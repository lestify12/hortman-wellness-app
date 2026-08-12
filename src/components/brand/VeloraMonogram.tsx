import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from 'react-native-svg';

import { colors, scale } from '@/theme';
import { VeloraWordmark } from './VeloraWordmark';

export type MonogramTone = 'gold' | 'ivory' | 'emerald';

interface Props {
  size?: number;
  tone?: MonogramTone;
  /** Draws the thin circular rule around the V. */
  ring?: boolean;
  style?: ViewStyle;
}

const TONES: Record<MonogramTone, { from: string; to: string; ring: string }> = {
  gold: { from: scale.gold300, to: scale.gold600, ring: scale.gold500 },
  ivory: { from: scale.ivoryLift, to: scale.champagneDeep, ring: scale.ivory },
  emerald: { from: scale.emerald500, to: scale.emerald900, ring: scale.emerald600 },
};

/**
 * The Velora "V" monogram.
 *
 * Drawn as vector so it stays crisp at every size and can be tinted per
 * surface. Geometry: a high-contrast serif V — thick left stroke, hairline
 * right stroke, with a fine apex serif — inside an optional thin rule.
 */
export function VeloraMonogram({ size = 72, tone = 'gold', ring = true, style }: Props) {
  const t = TONES[tone];
  const gradientId = `velora-monogram-${tone}`;

  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <SvgGradient id={gradientId} x1="18" y1="24" x2="82" y2="82" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={t.from} />
            <Stop offset="1" stopColor={t.to} />
          </SvgGradient>
        </Defs>

        {ring ? (
          <>
            <Circle cx="50" cy="50" r="46" stroke={t.ring} strokeOpacity={0.5} strokeWidth={0.9} />
            <Circle cx="50" cy="50" r="41.5" stroke={t.ring} strokeOpacity={0.22} strokeWidth={0.6} />
          </>
        ) : null}

        {/* Left stroke — the weighted diagonal, tapering into the vertex. */}
        <Path
          d="M28.4 30.5 L37.6 30.5 L52.4 70.6 L48.2 78.4 L28.4 30.5 Z"
          fill={`url(#${gradientId})`}
        />
        {/* Right stroke — hairline diagonal returning to the top right. */}
        <Path
          d="M71.6 30.5 L67.4 30.5 L48.8 76.2 L50.9 79.4 L71.6 30.5 Z"
          fill={`url(#${gradientId})`}
        />
        {/* Apex serifs — the detail that reads as a couture wordmark. */}
        <Path d="M24.2 29.2 L41.8 29.2 L41.8 31.8 L24.2 31.8 Z" fill={`url(#${gradientId})`} />
        <Path d="M63.4 29.2 L75.8 29.2 L75.8 31.8 L63.4 31.8 Z" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

interface LockupProps {
  size?: number;
  tone?: MonogramTone;
  align?: 'center' | 'left';
  showTagline?: boolean;
  style?: ViewStyle;
}

/**
 * Full logo lockup: monogram over the VELORA CLINICS wordmark.
 * Used on the splash, onboarding and auth screens.
 */
export function VeloraLockup({
  size = 84,
  tone = 'gold',
  align = 'center',
  showTagline = true,
  style,
}: LockupProps) {
  return (
    <View style={[{ alignItems: align === 'center' ? 'center' : 'flex-start' }, style]}>
      <VeloraMonogram size={size} tone={tone} />
      <VeloraWordmark
        tone={tone === 'emerald' ? 'emerald' : tone === 'gold' ? 'gold' : 'ivory'}
        size={size / 4.4}
        align={align}
        showTagline={showTagline}
        style={{ marginTop: size * 0.22 }}
      />
    </View>
  );
}

export const monogramRingColor = colors.accent;
