import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthScaffold } from '@/components/layout/AuthScaffold';
import { Button, Text, TextField } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { ServiceError } from '@/services';
import { colors, spacing } from '@/theme';

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sign Up / membership request. */
export default function SignUpRoute() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearError = (key: keyof FieldErrors) => {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!firstName.trim()) next.firstName = 'Required.';
    if (!lastName.trim()) next.lastName = 'Required.';
    if (!email.trim()) next.email = 'Please enter your email address.';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'That email does not look right.';
    if (password.length < 8) next.password = 'At least 8 characters.';
    if (confirm !== password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setFormError(null);
    if (!validate()) return;
    if (!accepted) {
      setFormError('Please accept the member terms to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });
      router.replace('/(tabs)');
    } catch (err) {
      setFormError(
        err instanceof ServiceError
          ? err.message
          : 'We could not create your account just now. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScaffold
      eyebrow="Request membership"
      title="Begin your Velora journey"
      subtitle="A few details, and your first consultation can be arranged."
      showBack
      compactHero
      footer={
        <View style={styles.footer}>
          <Text variant="bodySm" tone="secondary">
            Already a member?
          </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="label" tone="gold" style={styles.footerAction}>
                Sign in
              </Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <View style={styles.nameRow}>
        <TextField
          label="First name"
          value={firstName}
          onChangeText={(v) => {
            setFirstName(v);
            clearError('firstName');
          }}
          error={errors.firstName}
          autoCapitalize="words"
          textContentType="givenName"
          placeholder="Amelia"
          containerStyle={styles.nameField}
        />
        <TextField
          label="Last name"
          value={lastName}
          onChangeText={(v) => {
            setLastName(v);
            clearError('lastName');
          }}
          error={errors.lastName}
          autoCapitalize="words"
          textContentType="familyName"
          placeholder="Rousseau"
          containerStyle={styles.nameField}
        />
      </View>

      <TextField
        label="Email address"
        icon="mail"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          clearError('email');
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="you@example.com"
      />

      <TextField
        label="Password"
        icon="lock"
        secure
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          clearError('password');
        }}
        error={errors.password}
        hint="At least 8 characters."
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="••••••••"
      />

      <TextField
        label="Confirm password"
        icon="lock"
        secure
        value={confirm}
        onChangeText={(v) => {
          setConfirm(v);
          clearError('confirm');
        }}
        error={errors.confirm}
        autoCapitalize="none"
        placeholder="••••••••"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        accessibilityLabel="Accept member terms and privacy notice"
        onPress={() => {
          setAccepted((v) => !v);
          setFormError(null);
        }}
        style={({ pressed }) => [styles.terms, pressed && styles.pressed]}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
          {accepted ? <View style={styles.checkboxMark} /> : null}
        </View>
        <Text variant="caption" tone="secondary" style={styles.termsText}>
          I accept the Velora member terms and privacy notice.
        </Text>
      </Pressable>

      {formError ? (
        <Text variant="bodySm" style={styles.formError}>
          {formError}
        </Text>
      ) : null}

      <Button
        label="Create account"
        onPress={onSubmit}
        loading={submitting}
        icon="arrow-right"
        size="lg"
        variant="gold"
        style={styles.submit}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  nameField: {
    flex: 1,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.hairlineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.surfaceInverse,
    borderColor: colors.surfaceInverse,
  },
  checkboxMark: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  termsText: {
    flex: 1,
  },
  formError: {
    marginTop: spacing.base,
  },
  submit: {
    marginTop: spacing.xl,
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
