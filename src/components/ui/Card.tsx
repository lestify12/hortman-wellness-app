import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { alpha, colors, elevation, gradients, radius, scale, spacing } from '@/theme';

export type CardTone = 'surface' | 'muted' | 'emerald' | 'gold' | 'outline' | 'glass';

interface Props {
  tone?: CardTone;
  padded?: boolean | keyof typeof spacing;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  /** Softens elevation for cards inside a scrolling list. */
  flat?: boolean;
  accessibilityLabel?: string;
}

/**
 * The rounded premium card that carries most of the app's content.
 *
 * Emerald and gold tones paint a gradient; the rest are flat surfaces with a
 * hairline. Pressable cards dip slightly on press rather than flashing.
 */
export function Card({
  tone = 'surface',
  padded = true,
  onPress,
  disabled,
  style,
  contentStyle,
  children,
  flat = false,
  accessibilityLabel,
}: Props) {
  const pad = padded === true ? spacing.lg : padded === false ? 0 : spacing[padded];
  const isGradient = tone === 'emerald' || tone === 'gold' || tone === 'glass';
  const shadow = flat ? undefined : tone === 'emerald' ? elevation.medium : elevation.soft;

  const body = (
    <>
      {isGradient ? (
        <LinearGradient
          colors={GRADIENTS[tone]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={[{ padding: pad }, contentStyle]}>{children}</View>
    </>
  );

  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    TONE_STYLES[tone],
    shadow,
    style,
  ];

  if (!onPress) {
    return (
      <View style={containerStyle} accessibilityLabel={accessibilityLabel}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        containerStyle,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {body}
    </Pressable>
  );
}

const GRADIENTS: Record<'emerald' | 'gold' | 'glass', readonly [string, string, ...string[]]> = {
  emerald: gradients.emeraldSheen,
  gold: gradients.goldLeaf,
  glass: gradients.glassOnDark,
};

const TONE_STYLES: Record<CardTone, ViewStyle> = {
  surface: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: alpha(scale.champagneDeep, 0.9),
  },
  emerald: {
    backgroundColor: colors.surfaceInverse,
  },
  gold: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairlineStrong,
  },
  glass: {
    backgroundColor: alpha(scale.ivory, 0.06),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairlineOnDark,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.992 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
