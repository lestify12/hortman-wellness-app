import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api, STORAGE_KEYS } from '@/services';
import type { AuthSession, SignInPayload, SignUpPayload, UserProfile } from '@/types/models';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  session: AuthSession | null;
  /** Null until the bootstrap read completes, then true/false. */
  hasSeenOnboarding: boolean | null;
  signIn(payload: SignInPayload): Promise<void>;
  signUp(payload: SignUpPayload): Promise<void>;
  signOut(): Promise<void>;
  completeOnboarding(): Promise<void>;
  updateProfile(patch: Partial<UserProfile>): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Cold-start bootstrap: restore the persisted session and onboarding flag.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [seen, restored] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete),
          api.auth.restoreSession(),
        ]);
        if (cancelled) return;
        setHasSeenOnboarding(seen === 'true');
        if (restored) {
          setUser(restored.user);
          setSession(restored.session);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch {
        if (cancelled) return;
        setHasSeenOnboarding(false);
        setStatus('unauthenticated');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const result = await api.auth.signIn(payload);
    setUser(result.user);
    setSession(result.session);
    setStatus('authenticated');
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const result = await api.auth.signUp(payload);
    setUser(result.user);
    setSession(result.session);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await api.auth.signOut();
    setUser(null);
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
    setHasSeenOnboarding(true);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      if (!user) return;
      const next = await api.auth.updateProfile(user.id, patch);
      setUser(next);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      session,
      hasSeenOnboarding,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      updateProfile,
    }),
    [
      status,
      user,
      session,
      hasSeenOnboarding,
      signIn,
      signUp,
      signOut,
      completeOnboarding,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}

/** Convenience for screens that are only reachable while authenticated. */
export function useCurrentUser(): UserProfile {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser called outside an authenticated route.');
  return user;
}
