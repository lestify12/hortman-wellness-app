import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthBackdrop } from '@/components/brand/AuthBackdrop';
import { VeloraLogoLockup } from '@/components/brand/VeloraLogoLockup';
import { Button, Divider, SocialButton, Text, TextField } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { ServiceError } from '@/services';
import { contentMaxWidth, gutter, screen, scaleWidth, spacing } from '@/theme';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign In.
 *
 * Laid out over the supplied marble background: the lockup sits on the ivory
 * half, the form on the emerald half below the gold curve. The split is driven
 * by flex proportions rather than absolute offsets, so the content tracks the
 * curve as the artwork is cropped on taller or shorter handsets.
 *
 * `AuthBackdrop` owns the scrolling and the artwork together, which is what
 * keeps the form on emerald when the keyboard opens — see the note there.
 */
export default function SignInRoute() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = 'Please enter your email address.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'That email does not look right.';
    if (!password) next.password = 'Please enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err) {
      setFormError(
        err instanceof ServiceError
          ? err.message
          : 'We could not sign you in just now. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthBackdrop>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.column}>
          {/* Ivory half — brand */}
          <View style={styles.brand}>
            <VeloraLogoLockup size={scaleWidth(70)} tone="emerald" showTagline />
          </View>

          {/* Emerald half — form */}
          <View style={styles.form}>
            <Text variant="h1" tone="onDark" align="center">
              Welcome back
            </Text>
            <Text variant="body" tone="onDarkMuted" align="center" style={styles.subtitle}>
              Sign in to continue your journey
            </Text>

            <TextField
              label="Email address"
              placeholder="Email address"
              showLabel={false}
              variant="boxed"
              onDark
              icon="mail"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
            />

            <TextField
              label="Password"
              placeholder="Password"
              showLabel={false}
              variant="boxed"
              onDark
              icon="lock"
              secure
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
              }}
              error={errors.password}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot your password"
                hitSlop={8}
                style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
              >
                <Text variant="caption" tone="gold">
                  Forgot password?
                </Text>
              </Pressable>
            </Link>

            {formError ? (
              <Text variant="bodySm" tone="onDark" align="center" style={styles.formError}>
                {formError}
              </Text>
            ) : null}

            <Button
              label="Sign in"
              onPress={onSubmit}
              loading={submitting}
              variant="marble"
              size="lg"
              style={styles.submit}
            />

            <Divider label="OR" dark style={styles.divider} />

            <SocialButton
              provider="apple"
              onPress={() => setFormError('Apple sign-in is not connected yet.')}
              style={styles.social}
            />
            <SocialButton
              provider="google"
              onPress={() => setFormError('Google sign-in is not connected yet.')}
            />

            <View style={styles.footer}>
              <Text variant="bodySm" tone="onDarkMuted">
                Don&apos;t have an account?{' '}
              </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Create an account"
                  hitSlop={8}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <Text variant="bodySm" tone="gold">
                    Create Account
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackdrop>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: screen.isTablet ? contentMaxWidth : undefined,
    alignSelf: 'center',
    paddingHorizontal: gutter,
  },
  brand: {
    // Roughly the ivory portion of the artwork, so the lockup lands above the
    // gold curve without being pinned to a pixel offset.
    flex: 0.38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
  },
  form: {
    flex: 0.62,
    justifyContent: 'center',
    paddingBottom: spacing.sm,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  forgot: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    marginTop: -spacing.xs,
  },
  formError: {
    marginTop: spacing.md,
  },
  submit: {
    marginTop: spacing.md,
  },
  divider: {
    marginVertical: spacing.md,
  },
  social: {
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
  },
  pressed: {
    opacity: 0.55,
  },
});
