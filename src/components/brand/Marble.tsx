import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';

import { alpha, brand, gradients, scale } from '@/theme';

export type MarbleVariant = 'emerald' | 'ivory' | 'champagne';

interface Props {
  variant?: MarbleVariant;
  /** Vein opacity multiplier — lower for busy screens. */
  intensity?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
  /** Rounds the texture along with its container. */
  radius?: number;
}

/**
 * Marble texture.
 *
 * Built from a base gradient plus hand-authored vein paths rather than a raster
 * texture: it stays sharp on every density, ships no binary assets, and can be
 * recoloured per variant. Veins are drawn in the brand's own tones — gold
 * threading on emerald, warm grey on ivory/champagne.
 */
export function Marble({
  variant = 'emerald',
  intensity = 1,
  radius = 0,
  style,
  children,
}: Props) {
  const config = VARIANTS[variant];

  return (
    <View style={[styles.root, { borderRadius: radius }, style]}>
      <LinearGradient
        colors={config.base}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 160"
        preserveAspectRatio="xMidYMid slice"
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id={`vein-${variant}`} x1="0" y1="0" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={config.veinFrom} stopOpacity={0.9} />
            <Stop offset="0.55" stopColor={config.veinTo} stopOpacity={0.45} />
            <Stop offset="1" stopColor={config.veinFrom} stopOpacity={0.75} />
          </SvgGradient>
        </Defs>

        {/* Primary vein — the long diagonal fracture. */}
        <Path
          d="M-8 22 C 14 34, 26 18, 42 40 S 66 74, 78 66 S 100 88, 112 78"
          stroke={`url(#vein-${variant})`}
          strokeWidth={config.majorWidth}
          strokeOpacity={config.majorOpacity * intensity}
          fill="none"
          strokeLinecap="round"
        />
        {/* Secondary vein — crosses the first at a shallower angle. */}
        <Path
          d="M-6 108 C 18 96, 30 122, 50 112 S 82 128, 108 116"
          stroke={`url(#vein-${variant})`}
          strokeWidth={config.majorWidth * 0.72}
          strokeOpacity={config.majorOpacity * 0.8 * intensity}
          fill="none"
          strokeLinecap="round"
        />
        {/* Capillary threads — the fine detail that sells the stone. */}
        <Path
          d="M8 40 C 20 52, 24 46, 34 62 S 48 82, 58 78"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth}
          strokeOpacity={config.minorOpacity * intensity}
          fill="none"
        />
        <Path
          d="M62 12 C 70 28, 84 24, 92 42"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth}
          strokeOpacity={config.minorOpacity * 0.9 * intensity}
          fill="none"
        />
        <Path
          d="M14 132 C 30 126, 38 142, 56 138 S 84 146, 96 140"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth}
          strokeOpacity={config.minorOpacity * 0.8 * intensity}
          fill="none"
        />
        {/* Soft clouding — broad low-opacity washes that break up the gradient. */}
        <Path
          d="M-10 0 C 30 18, 20 54, 56 62 S 96 40, 118 58 L 118 -10 L -10 -10 Z"
          fill={config.cloud}
          fillOpacity={config.cloudOpacity * intensity}
        />
        <Path
          d="M-10 170 C 24 150, 46 166, 72 146 S 104 150, 118 132 L 118 172 L -10 172 Z"
          fill={config.cloud}
          fillOpacity={config.cloudOpacity * 0.75 * intensity}
        />
      </Svg>

      {children}
    </View>
  );
}

const VARIANTS: Record<
  MarbleVariant,
  {
    base: readonly [string, string, ...string[]];
    veinFrom: string;
    veinTo: string;
    cloud: string;
    cloudOpacity: number;
    majorWidth: number;
    minorWidth: number;
    majorOpacity: number;
    minorOpacity: number;
  }
> = {
  emerald: {
    base: gradients.emeraldDepth,
    veinFrom: scale.gold400,
    veinTo: scale.gold300,
    cloud: scale.emerald500,
    cloudOpacity: 0.3,
    majorWidth: 0.9,
    minorWidth: 0.4,
    majorOpacity: 0.5,
    minorOpacity: 0.28,
  },
  ivory: {
    base: gradients.ivoryMarble,
    veinFrom: alpha(brand.deepEmerald, 0.5),
    veinTo: alpha(brand.sage, 0.9),
    cloud: scale.champagne,
    cloudOpacity: 0.5,
    majorWidth: 0.75,
    minorWidth: 0.35,
    majorOpacity: 0.22,
    minorOpacity: 0.18,
  },
  champagne: {
    base: gradients.champagneMarble,
    veinFrom: alpha(scale.gold600, 0.75),
    veinTo: alpha(brand.deepEmerald, 0.4),
    cloud: scale.ivoryLift,
    cloudOpacity: 0.55,
    majorWidth: 0.8,
    minorWidth: 0.35,
    majorOpacity: 0.3,
    minorOpacity: 0.2,
  },
};

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: brand.deepEmerald,
  },
});

/**
 * Full-screen marble backdrop, absolutely positioned behind screen content.
 */
export function MarbleBackdrop({
  variant = 'ivory',
  intensity = 1,
}: Pick<Props, 'variant' | 'intensity'>) {
  return (
    <Marble variant={variant} intensity={intensity} style={StyleSheet.absoluteFillObject as ViewStyle} />
  );
}
