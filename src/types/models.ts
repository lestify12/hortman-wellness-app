/**
 * Domain models.
 *
 * These are transport-agnostic on purpose: every field is a primitive or a
 * plain object, and all timestamps are ISO-8601 strings. A Firestore adapter
 * converts `Timestamp` -> ISO string at the repository boundary, so no UI code
 * ever depends on a backend SDK type.
 */

export type ID = string;
export type ISODateString = string;

/* ------------------------------------------------------------------ user */

export type MembershipTierId = 'essence' | 'radiance' | 'noir';

export interface UserProfile {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  /** Initials fallback when no avatar has been uploaded. */
  initials: string;
  memberSince: ISODateString;
  membershipTier: MembershipTierId;
  /** Loyalty points, shown on the home dashboard and membership screen. */
  points: number;
  preferredClinicId?: ID;
  concerns: string[];
  dateOfBirth?: ISODateString;
}

export interface AuthSession {
  userId: ID;
  token: string;
  issuedAt: ISODateString;
  expiresAt: ISODateString;
}

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

/* ------------------------------------------------------------- treatments */

export type TreatmentCategory =
  | 'aesthetics'
  | 'skin'
  | 'wellness'
  | 'longevity'
  | 'body';

export interface Treatment {
  id: ID;
  name: string;
  /** One-line positioning statement, used on cards. */
  tagline: string;
  description: string;
  category: TreatmentCategory;
  durationMinutes: number;
  priceFrom: number;
  currency: string;
  /** Ordered ritual steps shown on the treatment detail screen. */
  steps: string[];
  benefits: string[];
  aftercare: string[];
  /** Marble/gradient key used for the hero when no photography is available. */
  accent: 'emerald' | 'champagne' | 'sage' | 'gold';
  isSignature: boolean;
  rating: number;
  reviewCount: number;
}

/* ---------------------------------------------------------------- doctors */

export interface Doctor {
  id: ID;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  avatarUrl?: string;
  initials: string;
  yearsExperience: number;
  rating: number;
  reviewCount: number;
  clinicId: ID;
  languages: string[];
  /** Weekday index (0 = Sunday) -> available time slots. */
  availability: Record<string, string[]>;
}

export interface Clinic {
  id: ID;
  name: string;
  city: string;
  addressLine: string;
  phone: string;
}

/* ----------------------------------------------------------- appointments */

export type AppointmentStatus =
  | 'upcoming'
  | 'completed'
  | 'cancelled'
  | 'pending';

export interface Appointment {
  id: ID;
  userId: ID;
  treatmentId: ID;
  treatmentName: string;
  doctorId: ID;
  doctorName: string;
  clinicId: ID;
  clinicName: string;
  /** Appointment start, ISO-8601 with offset. */
  startsAt: ISODateString;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  /** Set when the appointment consumes a session from a package. */
  packageId?: ID;
}

export interface BookAppointmentPayload {
  treatmentId: ID;
  doctorId: ID;
  clinicId: ID;
  startsAt: ISODateString;
  notes?: string;
}

/* --------------------------------------------------------------- packages */

export type PackageStatus = 'active' | 'completed' | 'expired';

export interface TreatmentPackage {
  id: ID;
  userId: ID;
  treatmentId: ID;
  name: string;
  totalSessions: number;
  completedSessions: number;
  status: PackageStatus;
  purchasedAt: ISODateString;
  expiresAt: ISODateString;
  /** Per-session log powering the progress timeline. */
  sessions: PackageSession[];
  doctorName: string;
  accent: Treatment['accent'];
}

export interface PackageSession {
  index: number;
  completedAt?: ISODateString;
  scheduledAt?: ISODateString;
  doctorName?: string;
  note?: string;
}

/* ---------------------------------------------------------------- journey */

export type JourneyEventType =
  | 'treatment'
  | 'consultation'
  | 'milestone'
  | 'measurement'
  | 'note';

export interface JourneyEvent {
  id: ID;
  userId: ID;
  type: JourneyEventType;
  title: string;
  summary: string;
  occurredAt: ISODateString;
  doctorName?: string;
  /** Optional before/after or progress metric attached to the entry. */
  metric?: { label: string; value: string; delta?: string };
}

export interface JourneyStat {
  label: string;
  value: string;
  caption?: string;
}

/* --------------------------------------------------------------- messages */

export interface MessageThread {
  id: ID;
  userId: ID;
  participantId: ID;
  participantName: string;
  participantRole: string;
  participantInitials: string;
  lastMessage: string;
  lastMessageAt: ISODateString;
  unreadCount: number;
}

export interface Message {
  id: ID;
  threadId: ID;
  authorId: ID;
  /** True when the signed-in member wrote it. */
  isMine: boolean;
  body: string;
  sentAt: ISODateString;
}

/* ------------------------------------------------------------- membership */

export interface MembershipTier {
  id: MembershipTierId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  currency: string;
  benefits: string[];
  accent: 'sage' | 'champagne' | 'emerald';
  isFeatured: boolean;
}

export interface MembershipState {
  tierId: MembershipTierId;
  renewsAt: ISODateString;
  points: number;
  pointsToNextTier: number;
  perksUsed: number;
  perksTotal: number;
}
