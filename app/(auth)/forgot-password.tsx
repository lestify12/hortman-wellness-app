import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScaffold } from '@/components/layout/AuthScaffold';
import { Button, Divider, Text, TextField } from '@/components/ui';
import { api, ServiceError } from '@/services';
import { spacing } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Password reset request. Confirms in place rather than routing away. */
export default function ForgotPasswordRoute() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      await api.auth.sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ServiceError ? err.message : 'We could not send that link. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthScaffold
        eyebrow="Check your inbox"
        title="Your reset link is on its way"
        subtitle={`If an account exists for ${email.trim()}, you will receive a secure link within a few minutes.`}
        showBack
        compactHero
      >
        <View style={styles.confirmation}>
          <Divider ornament />
          <Text variant="bodySm" tone="secondary" align="center" style={styles.confirmationBody}>
            The link expires in 30 minutes. If it does not arrive, check your spam folder or contact
            your concierge.
          </Text>
        </View>

        <Button
          label="Back to sign in"
          onPress={() => router.replace('/(auth)/sign-in')}
          icon="arrow-left"
          iconPosition="left"
          style={styles.submit}
        />
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="Enter the email on your membership and we will send a secure reset link."
      showBack
      compactHero
    >
      <TextField
        label="Email address"
        icon="mail"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (error) setError(null);
        }}
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder="you@example.com"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
      />

      <Button
        label="Send reset link"
        onPress={onSubmit}
        loading={submitting}
        icon="arrow-right"
        size="lg"
        style={styles.submit}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: spacing.xl,
  },
  confirmation: {
    marginBottom: spacing.sm,
  },
  confirmationBody: {
    marginTop: spacing.lg,
  },
});
