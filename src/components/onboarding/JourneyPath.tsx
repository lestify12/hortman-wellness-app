import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { alpha, colors, scale } from '@/theme';

/**
 * Node positions in the path's own 0–1 coordinate space.
 *
 * Exported because the slide places its step text against these — the whole
 * point of drawing the path rather than using the supplied render is that the
 * copy and the curve agree on where the nodes are.
 */
export const JOURNEY_NODES = [
  { x: 0.66, y: 30 / 190 },
  { x: 0.42, y: 95 / 190 },
  { x: 0.72, y: 150 / 190 },
] as const;

const ICONS = ['star', 'check', 'bar-chart-2'] as const;

/**
 * Curve through the three nodes, in a 100 x 190 viewBox.
 *
 * That box is close to the aspect the path is drawn at on a handset, so
 * `preserveAspectRatio="none"` stretches x and y by nearly the same factor and
 * the stroke keeps an even weight.
 */
const CURVE =
  'M 104 0 C 96 12, 80 18, 66 30 C 52 42, 60 62, 50 78 C 44 88, 38 90, 42 95 ' +
  'C 46 106, 62 116, 68 128 C 72 140, 74 145, 72 150 C 70 166, 60 178, 50 190';

interface Props {
  width: number;
  height: number;
}

/**
 * The journey's glowing path, drawn rather than photographed.
 *
 * The supplied render is a heavy opaque ribbon — several times the line weight
 * of the reference design — and a raster glow cannot be thinned after the fact,
 * only faded until it turns grey. Stroking it instead gives the delicate line
 * the design asks for, keeps it in brand gold at a controlled intensity, and
 * puts the nodes at coordinates the copy can be laid out against.
 *
 * The glow is three passes of the same curve: a wide, faint halo, a mid body,
 * and a hairline core. That is how light reads — bright centre, fast falloff —
 * and it stays crisp at any size.
 */
export function JourneyPath({ width, height }: Props) {
  // Modest against a hairline curve: oversized discs read as the subject
  // and leave the line looking like an afterthought.
  const nodeR = Math.min(width, height / 3) * 0.21;

  return (
    <View style={{ width, height }} pointerEvents="none">
      <Svg width={width} height={height} viewBox="0 0 100 190" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="journey-glow" x1="0" y1="0" x2="0" y2="190" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={scale.gold300} />
            <Stop offset="0.5" stopColor={scale.gold500} />
            <Stop offset="1" stopColor={scale.gold400} />
          </LinearGradient>
        </Defs>

        {/* Halo — wide and faint. */}
        <Path
          d={CURVE}
          stroke="url(#journey-glow)"
          strokeWidth={9}
          strokeOpacity={0.14}
          fill="none"
          strokeLinecap="round"
        />
        {/* Body. */}
        <Path
          d={CURVE}
          stroke="url(#journey-glow)"
          strokeWidth={3}
          strokeOpacity={0.4}
          fill="none"
          strokeLinecap="round"
        />
        {/* Core — the bright thread. */}
        <Path
          d={CURVE}
          stroke={scale.gold300}
          strokeWidth={1.1}
          strokeOpacity={0.95}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>

      {/* Nodes sit above the curve as real views, so the icons stay crisp. */}
      {JOURNEY_NODES.map((n, i) => (
        <View
          key={ICONS[i]}
          style={[
            styles.node,
            {
              width: nodeR * 2,
              height: nodeR * 2,
              borderRadius: nodeR,
              left: n.x * width - nodeR,
              top: n.y * height - nodeR,
            },
          ]}
        >
          <Feather name={ICONS[i]} size={nodeR * 0.82} color={scale.gold400} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  node: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(scale.emerald900, 0.92),
    borderWidth: StyleSheet.hairlineWidth * 3,
    borderColor: alpha(colors.accent, 0.75),
  },
});
