import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthScaffold } from '@/components/layout/AuthScaffold';
import { Button, Divider, Text, TextField } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { ServiceError } from '@/services';
import { spacing } from '@/theme';

interface FieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign In. Local validation first, then the auth repository. */
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
    <AuthScaffold
      eyebrow="Welcome back"
      title="Sign in to Velora"
      subtitle="Your journey, appointments and physicians — exactly where you left them."
      footer={
        <View style={styles.footer}>
          <Text variant="bodySm" tone="secondary">
            New to Velora?
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create an account"
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="label" tone="gold" style={styles.footerAction}>
                Request membership
              </Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <TextField
        label="Email address"
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
        placeholder="you@example.com"
        returnKeyType="next"
      />

      <TextField
        label="Password"
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
        placeholder="••••••••"
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
          <Text variant="caption" tone="secondary">
            Forgotten your password?
          </Text>
        </Pressable>
      </Link>

      {formError ? (
        <Text variant="bodySm" tone="primary" style={styles.formError}>
          {formError}
        </Text>
      ) : null}

      <Button
        label="Sign in"
        onPress={onSubmit}
        loading={submitting}
        icon="arrow-right"
        size="lg"
        style={styles.submit}
      />

      <Divider label="OR" style={styles.divider} />

      <Button
        label="Create an account"
        variant="outline"
        onPress={() => router.push('/(auth)/sign-up')}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    paddingVertical: spacing.sm,
  },
  formError: {
    marginTop: spacing.base,
  },
  submit: {
    marginTop: spacing.xl,
  },
  divider: {
    marginVertical: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  footerAction: {
    paddingVertical: spacing.xs,
  },
  pressed: {
    opacity: 0.55,
  },
});
