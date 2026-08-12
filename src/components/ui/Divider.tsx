import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';
import { Text } from './Typography';

interface Props {
  /** Centres a small label between two hairlines. */
  label?: string;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Draws a short centred gold rule instead of a full-width line. */
  ornament?: boolean;
}

/** Hairline rule, optional centred label or gold ornament. */
export function Divider({ label, dark = false, style, ornament = false }: Props) {
  const lineColor = dark ? colors.hairlineOnDark : colors.hairline;

  if (ornament) {
    return (
      <View style={[styles.ornamentRow, style]}>
        <View style={[styles.ornamentLine, { backgroundColor: colors.accent }]} />
        <View style={[styles.ornamentDot, { backgroundColor: colors.accent }]} />
        <View style={[styles.ornamentLine, { backgroundColor: colors.accent }]} />
      </View>
    );
  }

  if (!label) {
    return <View style={[styles.line, { backgroundColor: lineColor }, style]} />;
  }

  return (
    <View style={[styles.labelRow, style]}>
      <View style={[styles.flexLine, { backgroundColor: lineColor }]} />
      <Text variant="caption" tone={dark ? 'onDarkMuted' : 'tertiary'} style={styles.label}>
        {label}
      </Text>
      <View style={[styles.flexLine, { backgroundColor: lineColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    marginHorizontal: spacing.base,
    letterSpacing: 1,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  ornamentLine: {
    width: 26,
    height: StyleSheet.hairlineWidth * 2,
  },
  ornamentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing.sm,
    transform: [{ rotate: '45deg' }],
  },
});
