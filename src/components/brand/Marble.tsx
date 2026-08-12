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

      {/*
        The viewBox is deliberately close to a portrait handset's aspect ratio.
        With "slice", a squarer box would be scaled up ~5x to cover the screen,
        magnifying every vein into a coarse zigzag; matching the aspect keeps
        the drawn units close to points.
      */}
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 100 216"
        preserveAspectRatio="xMidYMid slice"
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id={`vein-${variant}`} x1="0" y1="0" x2="100" y2="216" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={config.veinFrom} stopOpacity={0.85} />
            <Stop offset="0.5" stopColor={config.veinTo} stopOpacity={0.4} />
            <Stop offset="1" stopColor={config.veinFrom} stopOpacity={0.7} />
          </SvgGradient>
        </Defs>

        {/* Clouding — broad, very soft tonal shifts. Kept low-contrast so the
            boundaries never resolve into readable shapes. */}
        <Path
          d="M-10 -10 C 24 10, 8 46, 34 62 C 58 76, 86 44, 118 60 L 118 -10 Z"
          fill={config.cloud}
          fillOpacity={config.cloudOpacity * 0.7 * intensity}
        />
        <Path
          d="M-10 226 C 20 202, 44 214, 66 188 C 86 164, 102 180, 118 162 L 118 226 Z"
          fill={config.cloud}
          fillOpacity={config.cloudOpacity * 0.55 * intensity}
        />
        <Path
          d="M-10 96 C 18 112, 34 90, 56 110 C 76 128, 94 108, 118 124 L 118 158 C 90 142, 68 162, 46 144 C 26 128, 8 142, -10 130 Z"
          fill={config.cloud}
          fillOpacity={config.cloudOpacity * 0.3 * intensity}
        />

        {/* Primary vein. Long consistent direction with a fine, high-frequency
            meander around it — that drift is what reads as stone. Wide swings
            read as a wave; hard corners read as a chart line. */}
        <Path
          d="M-8 18 C 6 26, 4 34, 16 44 C 28 54, 24 62, 34 72 C 44 82, 40 92, 52 102
             C 64 112, 58 122, 68 132 C 78 142, 74 152, 86 162 C 96 170, 94 180, 108 190"
          stroke={`url(#vein-${variant})`}
          strokeWidth={config.majorWidth}
          strokeOpacity={config.majorOpacity * intensity}
          fill="none"
          strokeLinecap="round"
        />
        {/* Branch peeling away from the primary at a shallower angle. */}
        <Path
          d="M34 72 C 46 68, 52 74, 62 68 C 72 62, 80 68, 92 62 C 100 58, 104 62, 110 58"
          stroke={`url(#vein-${variant})`}
          strokeWidth={config.majorWidth * 0.5}
          strokeOpacity={config.majorOpacity * 0.55 * intensity}
          fill="none"
          strokeLinecap="round"
        />
        {/* Secondary vein — lower, shallower, crossing the frame. */}
        <Path
          d="M-8 158 C 10 152, 18 160, 32 154 C 46 148, 54 158, 68 152
             C 82 146, 92 156, 108 150"
          stroke={`url(#vein-${variant})`}
          strokeWidth={config.majorWidth * 0.62}
          strokeOpacity={config.majorOpacity * 0.6 * intensity}
          fill="none"
          strokeLinecap="round"
        />

        {/* Capillary threads — hairlines drifting near their parent vein. */}
        <Path
          d="M2 36 C 12 44, 10 52, 20 60 C 30 68, 28 76, 38 84"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth}
          strokeOpacity={config.minorOpacity * intensity}
          fill="none"
        />
        <Path
          d="M62 8 C 70 18, 68 26, 78 36 C 86 44, 84 52, 92 60"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth}
          strokeOpacity={config.minorOpacity * 0.8 * intensity}
          fill="none"
        />
        <Path
          d="M8 190 C 22 184, 30 192, 44 186 C 58 180, 68 188, 84 182"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth}
          strokeOpacity={config.minorOpacity * 0.65 * intensity}
          fill="none"
        />
        <Path
          d="M56 116 C 62 124, 60 130, 68 138"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth * 0.8}
          strokeOpacity={config.minorOpacity * 0.55 * intensity}
          fill="none"
        />
        <Path
          d="M18 84 C 22 94, 18 100, 24 110"
          stroke={config.veinTo}
          strokeWidth={config.minorWidth * 0.8}
          strokeOpacity={config.minorOpacity * 0.5 * intensity}
          fill="none"
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
