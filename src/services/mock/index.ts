import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  Appointment,
  AuthSession,
  BookAppointmentPayload,
  ID,
  MembershipState,
  Message,
  SignInPayload,
  SignUpPayload,
  UserProfile,
} from '@/types/models';
import type { VeloraBackend } from '../contracts';
import { STORAGE_KEYS } from '../storageKeys';
import {
  MOCK_USER_ID,
  mockAppointments,
  mockClinics,
  mockDoctors,
  mockJourneyEvents,
  mockJourneyStats,
  mockMembershipState,
  mockMessages,
  mockPackages,
  mockThreads,
  mockTiers,
  mockTreatments,
  mockUser,
} from './fixtures';

/**
 * In-memory backend backed by fixtures.
 *
 * Mutations are applied to module-level copies so the app behaves like a real
 * client within a session (booking appears in the list, messages append, tier
 * changes persist). The auth session is persisted to AsyncStorage so cold
 * starts resume exactly as they will once Firebase Auth is wired in.
 */

const LATENCY_MS = 320;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/* ------------------------------------------------------------ mutable db */

let appointments: Appointment[] = clone(mockAppointments);
let messages: Record<string, Message[]> = clone(mockMessages);
let threads = clone(mockThreads);
let membershipState: MembershipState = clone(mockMembershipState);
let currentUser: UserProfile = clone(mockUser);

function issueSession(userId: ID): AuthSession {
  const now = Date.now();
  return {
    userId,
    token: `mock_${Math.random().toString(36).slice(2)}`,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

async function persistSession(session: AuthSession, user: UserProfile) {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.session, JSON.stringify(session)],
    [STORAGE_KEYS.user, JSON.stringify(user)],
  ]);
}

/* ------------------------------------------------------------- validation */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ServiceError extends Error {
  constructor(
    message: string,
    readonly code: string = 'unknown',
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/* ------------------------------------------------------------ the backend */

export const mockBackend: VeloraBackend = {
  auth: {
    async signIn({ email, password }: SignInPayload) {
      await delay(null, 620);
      if (!EMAIL_RE.test(email.trim())) {
        throw new ServiceError('Enter a valid email address.', 'auth/invalid-email');
      }
      if (password.length < 6) {
        throw new ServiceError(
          'Your password must be at least 6 characters.',
          'auth/weak-password',
        );
      }
      // Any well-formed credentials succeed against the mock backend.
      currentUser = { ...clone(mockUser), email: email.trim().toLowerCase() };
      const session = issueSession(currentUser.id);
      await persistSession(session, currentUser);
      return { session, user: currentUser };
    },

    async signUp(payload: SignUpPayload) {
      await delay(null, 720);
      const { firstName, lastName, email, password } = payload;
      if (!firstName.trim() || !lastName.trim()) {
        throw new ServiceError('Please tell us your full name.', 'auth/missing-name');
      }
      if (!EMAIL_RE.test(email.trim())) {
        throw new ServiceError('Enter a valid email address.', 'auth/invalid-email');
      }
      if (password.length < 8) {
        throw new ServiceError(
          'Choose a password of at least 8 characters.',
          'auth/weak-password',
        );
      }
      currentUser = {
        ...clone(mockUser),
        id: `usr_${Math.random().toString(36).slice(2, 10)}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: payload.phone?.trim(),
        initials: `${firstName.trim()[0] ?? ''}${lastName.trim()[0] ?? ''}`.toUpperCase(),
        memberSince: new Date().toISOString(),
        membershipTier: 'essence',
        points: 0,
        concerns: [],
      };
      const session = issueSession(currentUser.id);
      await persistSession(session, currentUser);
      return { session, user: currentUser };
    },

    async signOut() {
      await AsyncStorage.multiRemove([STORAGE_KEYS.session, STORAGE_KEYS.user]);
    },

    async restoreSession() {
      const [[, rawSession], [, rawUser]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.session,
        STORAGE_KEYS.user,
      ]);
      if (!rawSession || !rawUser) return null;
      try {
        const session = JSON.parse(rawSession) as AuthSession;
        const user = JSON.parse(rawUser) as UserProfile;
        if (new Date(session.expiresAt).getTime() < Date.now()) {
          await AsyncStorage.multiRemove([STORAGE_KEYS.session, STORAGE_KEYS.user]);
          return null;
        }
        currentUser = user;
        return { session, user };
      } catch {
        return null;
      }
    },

    async sendPasswordReset(email: string) {
      await delay(null, 500);
      if (!EMAIL_RE.test(email.trim())) {
        throw new ServiceError('Enter a valid email address.', 'auth/invalid-email');
      }
    },

    async updateProfile(_userId, patch) {
      await delay(null, 400);
      currentUser = { ...currentUser, ...patch };
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
      return clone(currentUser);
    },
  },

  treatments: {
    list: () => delay(clone(mockTreatments)),
    getById: (id) => delay(clone(mockTreatments.find((t) => t.id === id) ?? null)),
    listSignature: () => delay(clone(mockTreatments.filter((t) => t.isSignature))),
  },

  doctors: {
    list: () => delay(clone(mockDoctors)),
    getById: (id) => delay(clone(mockDoctors.find((d) => d.id === id) ?? null)),
    listByTreatment: (treatmentId) => {
      const treatment = mockTreatments.find((t) => t.id === treatmentId);
      if (!treatment) return delay([]);
      // Mock affinity: match doctors by treatment category keyword.
      const byCategory: Record<string, string[]> = {
        skin: ['doc_navarro', 'doc_lindqvist'],
        aesthetics: ['doc_navarro'],
        longevity: ['doc_haddad'],
        wellness: ['doc_okafor'],
        body: ['doc_okafor', 'doc_navarro'],
      };
      const ids = byCategory[treatment.category] ?? [];
      return delay(clone(mockDoctors.filter((d) => ids.includes(d.id))));
    },
  },

  clinics: {
    list: () => delay(clone(mockClinics)),
  },

  appointments: {
    listForUser: (userId) =>
      delay(
        clone(
          appointments
            .filter((a) => a.userId === userId || userId === MOCK_USER_ID)
            .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
        ),
      ),

    getById: (id) => delay(clone(appointments.find((a) => a.id === id) ?? null)),

    async book(userId: ID, payload: BookAppointmentPayload) {
      await delay(null, 600);
      const treatment = mockTreatments.find((t) => t.id === payload.treatmentId);
      const doctor = mockDoctors.find((d) => d.id === payload.doctorId);
      const clinic = mockClinics.find((c) => c.id === payload.clinicId);
      if (!treatment || !doctor || !clinic) {
        throw new ServiceError('That appointment could not be created.', 'booking/invalid');
      }
      const appointment: Appointment = {
        id: `apt_${Math.random().toString(36).slice(2, 9)}`,
        userId,
        treatmentId: treatment.id,
        treatmentName: treatment.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        clinicId: clinic.id,
        clinicName: clinic.name,
        startsAt: payload.startsAt,
        durationMinutes: treatment.durationMinutes,
        status: 'upcoming',
        notes: payload.notes,
      };
      appointments = [...appointments, appointment];
      return clone(appointment);
    },

    async cancel(id: ID) {
      await delay(null, 450);
      const index = appointments.findIndex((a) => a.id === id);
      if (index < 0) throw new ServiceError('Appointment not found.', 'booking/not-found');
      const updated: Appointment = { ...appointments[index], status: 'cancelled' };
      appointments = appointments.map((a) => (a.id === id ? updated : a));
      return clone(updated);
    },

    async reschedule(id: ID, startsAt: string) {
      await delay(null, 450);
      const index = appointments.findIndex((a) => a.id === id);
      if (index < 0) throw new ServiceError('Appointment not found.', 'booking/not-found');
      const updated: Appointment = { ...appointments[index], startsAt, status: 'upcoming' };
      appointments = appointments.map((a) => (a.id === id ? updated : a));
      return clone(updated);
    },
  },

  packages: {
    listForUser: () => delay(clone(mockPackages)),
    getById: (id) => delay(clone(mockPackages.find((p) => p.id === id) ?? null)),
  },

  journey: {
    listEvents: () =>
      delay(
        clone(
          [...mockJourneyEvents].sort(
            (a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt),
          ),
        ),
      ),
    listStats: () => delay(clone(mockJourneyStats)),
  },

  messages: {
    listThreads: () =>
      delay(
        clone(
          [...threads].sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt)),
        ),
      ),

    listMessages: (threadId) => delay(clone(messages[threadId] ?? [])),

    async send(threadId: ID, body: string) {
      await delay(null, 260);
      const trimmed = body.trim();
      if (!trimmed) throw new ServiceError('Message cannot be empty.', 'messages/empty');
      const message: Message = {
        id: `msg_${Math.random().toString(36).slice(2, 9)}`,
        threadId,
        authorId: currentUser.id,
        isMine: true,
        body: trimmed,
        sentAt: new Date().toISOString(),
      };
      messages = { ...messages, [threadId]: [...(messages[threadId] ?? []), message] };
      threads = threads.map((t) =>
        t.id === threadId
          ? { ...t, lastMessage: trimmed, lastMessageAt: message.sentAt, unreadCount: 0 }
          : t,
      );
      return clone(message);
    },

    async markRead(threadId: ID) {
      threads = threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t));
    },
  },

  membership: {
    listTiers: () => delay(clone(mockTiers)),
    getState: () => delay(clone(membershipState)),
    async changeTier(_userId, tierId) {
      await delay(null, 520);
      membershipState = { ...membershipState, tierId };
      currentUser = { ...currentUser, membershipTier: tierId };
      await AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
      return clone(membershipState);
    },
  },
};
