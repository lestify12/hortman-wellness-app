import type {
  Appointment,
  AuthSession,
  BookAppointmentPayload,
  Clinic,
  Doctor,
  ID,
  JourneyEvent,
  JourneyStat,
  MembershipState,
  MembershipTier,
  Message,
  MessageThread,
  SignInPayload,
  SignUpPayload,
  Treatment,
  TreatmentPackage,
  UserProfile,
} from '@/types/models';

/**
 * Repository contracts.
 *
 * The UI depends only on these interfaces. `services/mock` implements them
 * against local fixtures today; a `services/firebase` folder can implement the
 * exact same surface against Firestore/Auth tomorrow, and `services/index.ts`
 * swaps the binding in one place. No screen changes required.
 */

export interface AuthRepository {
  signIn(payload: SignInPayload): Promise<{ session: AuthSession; user: UserProfile }>;
  signUp(payload: SignUpPayload): Promise<{ session: AuthSession; user: UserProfile }>;
  signOut(): Promise<void>;
  /** Resolves the persisted session on cold start, or null when signed out. */
  restoreSession(): Promise<{ session: AuthSession; user: UserProfile } | null>;
  sendPasswordReset(email: string): Promise<void>;
  updateProfile(userId: ID, patch: Partial<UserProfile>): Promise<UserProfile>;
}

export interface TreatmentRepository {
  list(): Promise<Treatment[]>;
  getById(id: ID): Promise<Treatment | null>;
  listSignature(): Promise<Treatment[]>;
}

export interface DoctorRepository {
  list(): Promise<Doctor[]>;
  getById(id: ID): Promise<Doctor | null>;
  listByTreatment(treatmentId: ID): Promise<Doctor[]>;
}

export interface ClinicRepository {
  list(): Promise<Clinic[]>;
}

export interface AppointmentRepository {
  listForUser(userId: ID): Promise<Appointment[]>;
  getById(id: ID): Promise<Appointment | null>;
  book(userId: ID, payload: BookAppointmentPayload): Promise<Appointment>;
  cancel(id: ID): Promise<Appointment>;
  reschedule(id: ID, startsAt: string): Promise<Appointment>;
}

export interface PackageRepository {
  listForUser(userId: ID): Promise<TreatmentPackage[]>;
  getById(id: ID): Promise<TreatmentPackage | null>;
}

export interface JourneyRepository {
  listEvents(userId: ID): Promise<JourneyEvent[]>;
  listStats(userId: ID): Promise<JourneyStat[]>;
}

export interface MessageRepository {
  listThreads(userId: ID): Promise<MessageThread[]>;
  listMessages(threadId: ID): Promise<Message[]>;
  send(threadId: ID, body: string): Promise<Message>;
  markRead(threadId: ID): Promise<void>;
}

export interface MembershipRepository {
  listTiers(): Promise<MembershipTier[]>;
  getState(userId: ID): Promise<MembershipState>;
  changeTier(userId: ID, tierId: MembershipTier['id']): Promise<MembershipState>;
}

/** The full backend surface the app binds to at startup. */
export interface VeloraBackend {
  auth: AuthRepository;
  treatments: TreatmentRepository;
  doctors: DoctorRepository;
  clinics: ClinicRepository;
  appointments: AppointmentRepository;
  packages: PackageRepository;
  journey: JourneyRepository;
  messages: MessageRepository;
  membership: MembershipRepository;
}
