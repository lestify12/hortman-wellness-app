import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, radius, scale } from '@/theme';
import { Text } from './Typography';

interface Props {
  initials: string;
  uri?: string;
  size?: number;
  tone?: 'emerald' | 'champagne' | 'onDark';
  /** Thin gold rule around the avatar — used for physicians. */
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Initials-first avatar. Photography is optional and degrades gracefully. */
export function Avatar({ initials, uri, size = 48, tone = 'emerald', ring = false, style }: Props) {
  const t = TONES[tone];

  return (
    <View
      style={[
        styles.root,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.bg,
        },
        ring && {
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: alpha(colors.accent, 0.55),
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text
          variant="h4"
          color={t.fg}
          style={{ fontSize: size * 0.34, lineHeight: size * 0.4, letterSpacing: 0.5 }}
        >
          {initials.slice(0, 2).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

const TONES = {
  emerald: { bg: alpha(scale.emerald600, 0.12), fg: scale.emerald600 },
  champagne: { bg: colors.surfaceMuted, fg: colors.textPrimary },
  onDark: { bg: alpha(scale.ivory, 0.12), fg: colors.textOnDark },
} as const;

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.pill,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
