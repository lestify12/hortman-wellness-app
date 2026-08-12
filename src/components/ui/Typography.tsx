import React from 'react';
import { StyleProp, Text as RNText, TextProps, TextStyle } from 'react-native';

import { colors, typeScale, type TypeVariant } from '@/theme';

interface Props extends TextProps {
  variant?: TypeVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  /** Convenience for gold eyebrows / accents without a style object. */
  tone?: 'primary' | 'secondary' | 'tertiary' | 'gold' | 'onDark' | 'onDarkMuted';
  style?: StyleProp<TextStyle>;
}

const TONES: Record<NonNullable<Props['tone']>, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  gold: colors.textGold,
  onDark: colors.textOnDark,
  onDarkMuted: colors.textOnDarkMuted,
};

/**
 * The only text primitive in the app. Screens pick a semantic variant instead
 * of assembling fontFamily/fontSize by hand, which is what keeps the type
 * system consistent across twelve screens.
 */
export function Text({
  variant = 'body',
  tone = 'primary',
  color,
  align,
  style,
  ...rest
}: Props) {
  return (
    <RNText
      {...rest}
      style={[
        typeScale[variant],
        { color: color ?? TONES[tone] },
        align ? { textAlign: align } : null,
        style,
      ]}
    />
  );
}

/** Small all-caps gold rule label used above section headings. */
export function Eyebrow({ tone = 'gold', style, ...rest }: Props) {
  return <Text variant="eyebrow" tone={tone} style={style} {...rest} />;
}
