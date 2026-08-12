import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { images } from '@/constants/images';
import { colors, fontFamily, scaleWidth, spacing } from '@/theme';
import { Text } from '@/components/ui/Typography';

interface Props {
  /** Height of the gold monogram. Everything else scales from it. */
  size?: number;
  /** Emerald on light marble, ivory on the emerald half. */
  tone?: 'emerald' | 'ivory';
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TONES = {
  emerald: { primary: colors.textPrimary, secondary: colors.textSecondary },
  ivory: { primary: colors.textOnDark, secondary: colors.textOnDarkMuted },
} as const;

/**
 * The full Velora lockup: the supplied gold V monogram over a typeset
 * VELORA / CLINICS wordmark.
 *
 * The monogram is a bitmap because the swooshed V is bespoke artwork, but the
 * wordmark is typeset rather than sliced out of the same render — it stays
 * crisp at any size and recolours per surface, and the supplied render has it
 * in near-black emerald that cannot sit on the ivory marble.
 */
export function VeloraLogoLockup({
  size = 84,
  tone = 'emerald',
  showTagline = false,
  style,
}: Props) {
  const t = TONES[tone];
  // The monogram artwork is slightly wider than tall; keep its own ratio.
  const width = size * 1.06;
  const wordSize = size * 0.30;

  return (
    <View style={[styles.root, style]}>
      <Image
        source={images.brand.monogram}
        style={{ width, height: size }}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Velora Clinics"
      />

      <Text
        style={[
          styles.wordmark,
          {
            color: t.primary,
            fontSize: wordSize,
            letterSpacing: wordSize * 0.34,
            marginRight: -wordSize * 0.34,
            marginTop: size * 0.16,
          },
        ]}
      >
        VELORA
      </Text>

      <Text
        style={[
          styles.sub,
          {
            color: t.secondary,
            fontSize: wordSize * 0.44,
            letterSpacing: wordSize * 0.44,
            marginRight: -wordSize * 0.44,
            marginTop: size * 0.07,
          },
        ]}
      >
        CLINICS
      </Text>

      {showTagline ? (
        <View style={styles.tagline}>
          <Text variant="bodyLg" color={t.primary} align="center" style={styles.taglineLine}>
            Elevated care.
          </Text>
          <Text variant="bodyLg" color={t.primary} align="center" style={styles.taglineLine}>
            Exceptional you.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: fontFamily.serif,
    includeFontPadding: false,
  },
  sub: {
    fontFamily: fontFamily.sansLight,
    includeFontPadding: false,
  },
  tagline: {
    marginTop: spacing.base,
  },
  taglineLine: {
    lineHeight: scaleWidth(23),
  },
});
