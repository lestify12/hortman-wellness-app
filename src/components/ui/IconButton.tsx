import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, radius, scale } from '@/theme';
import { Text } from './Typography';

interface Props {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  size?: number;
  tone?: 'surface' | 'outline' | 'onDark' | 'gold';
  accessibilityLabel: string;
  /** Small gold count bubble, e.g. unread messages. */
  badgeCount?: number;
  style?: StyleProp<ViewStyle>;
}

/** Circular thin-line icon control used in headers and card actions. */
export function IconButton({
  icon,
  onPress,
  size = 42,
  tone = 'surface',
  accessibilityLabel,
  badgeCount,
  style,
}: Props) {
  const t = TONES[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { width: size, height: size, borderRadius: size / 2 },
        t.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Feather name={icon} size={size * 0.44} color={t.icon} />

      {badgeCount ? (
        <View style={styles.badge}>
          <Text variant="caption" color={scale.emerald900} style={styles.badgeLabel}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const TONES = {
  surface: {
    container: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.hairline,
    },
    icon: colors.textPrimary,
  },
  outline: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.hairlineStrong,
    },
    icon: colors.textPrimary,
  },
  onDark: {
    container: {
      backgroundColor: alpha(scale.ivory, 0.08),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.hairlineOnDark,
    },
    icon: colors.textOnDark,
  },
  gold: {
    container: { backgroundColor: colors.accent },
    icon: scale.emerald900,
  },
} as const;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 10,
    lineHeight: 13,
  },
});
