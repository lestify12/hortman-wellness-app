import React from 'react';
import { Pressable, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, gutter, radius, scale, spacing } from '@/theme';
import { Text } from './Typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

/** Filter / selection chip. Selected state is an emerald fill with ivory text. */
export function Chip({ label, selected = false, onPress, dark = false, style, disabled }: ChipProps) {
  const content = (
    <Text
      variant="label"
      color={
        selected
          ? dark
            ? scale.emerald900
            : colors.textOnDark
          : dark
            ? colors.textOnDarkMuted
            : colors.textSecondary
      }
    >
      {label}
    </Text>
  );

  const containerStyle: StyleProp<ViewStyle> = [
    styles.chip,
    dark
      ? selected
        ? styles.chipDarkSelected
        : styles.chipDark
      : selected
        ? styles.chipSelected
        : styles.chipDefault,
    disabled && styles.disabled,
    style,
  ];

  if (!onPress) return <View style={containerStyle}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

interface RowProps {
  children: React.ReactNode;
  /** Bleeds past the screen gutter so the row can scroll edge to edge. */
  bleed?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Horizontally scrolling chip rail. */
export function ChipRow({ children, bleed = true, style }: RowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[bleed && { marginHorizontal: -gutter }, style]}
      contentContainerStyle={[styles.row, bleed && { paddingHorizontal: gutter }]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 1,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipDefault: {
    backgroundColor: colors.transparent,
    borderColor: colors.hairlineStrong,
  },
  chipSelected: {
    backgroundColor: colors.surfaceInverse,
    borderColor: colors.surfaceInverse,
  },
  chipDark: {
    backgroundColor: alpha(scale.ivory, 0.06),
    borderColor: colors.hairlineOnDark,
  },
  chipDarkSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
