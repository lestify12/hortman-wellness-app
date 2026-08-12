import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fontFamily, scale, spacing } from '@/theme';

export type WordmarkTone = 'gold' | 'ivory' | 'emerald';

interface Props {
  /** Cap height of the VELORA line; CLINICS derives from it. */
  size?: number;
  tone?: WordmarkTone;
  align?: 'center' | 'left';
  showTagline?: boolean;
  style?: ViewStyle;
}

const TONES: Record<WordmarkTone, { primary: string; secondary: string; rule: string }> = {
  gold: { primary: scale.gold500, secondary: scale.gold300, rule: scale.gold500 },
  ivory: { primary: colors.textOnDark, secondary: colors.textOnDarkMuted, rule: scale.gold500 },
  emerald: { primary: colors.textPrimary, secondary: colors.textSecondary, rule: scale.gold500 },
};

/**
 * VELORA CLINICS wordmark — letterspaced serif over a hairline rule.
 * Typeset rather than imaged, so it stays sharp and recolours per surface.
 */
export function VeloraWordmark({
  size = 19,
  tone = 'gold',
  align = 'center',
  showTagline = true,
  style,
}: Props) {
  const t = TONES[tone];
  const centered = align === 'center';

  return (
    <View style={[styles.root, centered && styles.centered, style]}>
      <Text
        style={[
          styles.primary,
          { color: t.primary, fontSize: size, letterSpacing: size * 0.42 },
          // Letterspacing adds trailing space; nudge back so it optically centres.
          centered && { marginRight: -size * 0.42 },
        ]}
      >
        VELORA
      </Text>

      {showTagline ? (
        <View style={[styles.taglineRow, centered && styles.centered]}>
          <View style={[styles.rule, { backgroundColor: t.rule }]} />
          <Text
            style={[
              styles.secondary,
              { color: t.secondary, fontSize: size * 0.46, letterSpacing: size * 0.3 },
            ]}
          >
            CLINICS
          </Text>
          <View style={[styles.rule, { backgroundColor: t.rule }]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
  },
  centered: {
    alignItems: 'center',
  },
  primary: {
    fontFamily: fontFamily.serifLight,
    includeFontPadding: false,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondary: {
    fontFamily: fontFamily.sansLight,
    includeFontPadding: false,
    marginHorizontal: spacing.sm,
  },
  rule: {
    width: 18,
    height: StyleSheet.hairlineWidth * 2,
    opacity: 0.7,
  },
});
