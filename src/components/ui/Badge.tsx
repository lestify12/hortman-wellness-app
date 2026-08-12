import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, radius, scale, spacing } from '@/theme';
import { Text } from './Typography';

export type BadgeTone =
  | 'gold'
  | 'emerald'
  | 'sage'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onDark';

interface Props {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
  /** Adds a small leading dot — used for appointment status. */
  dot?: boolean;
}

const TONES: Record<BadgeTone, { bg: string; fg: string; border?: string }> = {
  gold: { bg: colors.accentSoft, fg: colors.textGold, border: alpha(colors.accent, 0.32) },
  emerald: { bg: alpha(scale.emerald600, 0.1), fg: scale.emerald600 },
  sage: { bg: colors.sageSoft, fg: scale.emerald700 },
  neutral: { bg: colors.surfaceMuted, fg: colors.textSecondary },
  success: { bg: colors.successSoft, fg: colors.success },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  onDark: { bg: alpha(scale.ivory, 0.1), fg: colors.textOnDark, border: colors.hairlineOnDark },
};

/** Small pill label — status, category, tier. */
export function Badge({ label, tone = 'neutral', dot = false, style }: Props) {
  const t = TONES[tone];
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: t.bg },
        t.border ? { borderWidth: StyleSheet.hairlineWidth, borderColor: t.border } : null,
        style,
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text variant="caption" color={t.fg} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.pill,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    marginRight: spacing.sm - 2,
  },
  label: {
    letterSpacing: 0.7,
  },
});
