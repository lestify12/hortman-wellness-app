import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, spacing } from '@/theme';

interface Props {
  /** Length of each rule either side of the diamond. */
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Gold hairline rule with a centred diamond — the divider that sits under a
 * heading on the onboarding and auth screens.
 */
export function Ornament({ width = 56, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <View style={[styles.rule, { width }]} />
      <View style={styles.diamond} />
      <View style={[styles.rule, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rule: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: alpha(colors.accent, 0.55),
  },
  diamond: {
    width: 5,
    height: 5,
    marginHorizontal: spacing.md,
    backgroundColor: colors.accent,
    transform: [{ rotate: '45deg' }],
  },
});
