/** Namespaced AsyncStorage keys. One place to audit what the app persists. */
export const STORAGE_KEYS = {
  session: '@velora/auth-session',
  user: '@velora/auth-user',
  onboardingComplete: '@velora/onboarding-complete',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
