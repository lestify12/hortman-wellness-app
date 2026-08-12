import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, radius, scale, spacing } from '@/theme';
import { Button } from './Button';
import { Text } from './Typography';

/* --------------------------------------------------------------- loading */

/** Centred emerald spinner with an optional serif caption. */
export function LoadingState({ label, dark = false }: { label?: string; dark?: boolean }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={dark ? colors.accent : colors.surfaceInverse} />
      {label ? (
        <Text variant="bodySm" tone={dark ? 'onDarkMuted' : 'tertiary'} style={styles.caption}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

/* ----------------------------------------------------------------- empty */

interface EmptyProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Empty state — thin-line icon in a soft emerald disc, serif title, action. */
export function EmptyState({
  icon = 'feather',
  title,
  body,
  actionLabel,
  onAction,
  dark = false,
  style,
}: EmptyProps) {
  return (
    <View style={[styles.center, styles.emptyRoot, style]}>
      <View style={[styles.iconDisc, dark && styles.iconDiscDark]}>
        <Feather name={icon} size={22} color={dark ? colors.accent : scale.emerald600} />
      </View>

      <Text variant="h3" tone={dark ? 'onDark' : 'primary'} align="center" style={styles.emptyTitle}>
        {title}
      </Text>

      {body ? (
        <Text variant="body" tone={dark ? 'onDarkMuted' : 'secondary'} align="center">
          {body}
        </Text>
      ) : null}

      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={dark ? 'onDark' : 'outline'}
          size="sm"
          fullWidth={false}
          style={styles.emptyAction}
        />
      ) : null}
    </View>
  );
}

/* ----------------------------------------------------------------- error */

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  dark?: boolean;
}

/** Failure state for a repository call. */
export function ErrorState({ message, onRetry, dark = false }: ErrorProps) {
  return (
    <EmptyState
      icon="alert-circle"
      title="Something went astray"
      body={message ?? 'We could not load this just now. Please try again in a moment.'}
      actionLabel={onRetry ? 'Try again' : undefined}
      onAction={onRetry}
      dark={dark}
    />
  );
}

/* -------------------------------------------------------------- skeleton */

/** Neutral placeholder block used while a card list loads. */
export function Skeleton({
  height = 96,
  style,
}: {
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.skeleton, { height }, style]} />;
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  caption: {
    marginTop: spacing.base,
  },
  emptyRoot: {
    paddingHorizontal: spacing.lg,
  },
  iconDisc: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(scale.emerald600, 0.09),
    marginBottom: spacing.lg,
  },
  iconDiscDark: {
    backgroundColor: alpha(scale.ivory, 0.08),
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyAction: {
    marginTop: spacing.xl,
  },
  skeleton: {
    backgroundColor: alpha(colors.textPrimary, 0.05),
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
});
