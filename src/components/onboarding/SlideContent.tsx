import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

import { images } from '@/constants/images';
import { Ornament, Text } from '@/components/ui';
import { alpha, colors, scale, scaleWidth, spacing } from '@/theme';
import type { OnboardingSlide } from './slides';

interface Props {
  slide: OnboardingSlide;
  width: number;
  /** Shared horizontal scroll offset, native-driven. */
  scrollX: Animated.Value;
  index: number;
}

/**
 * One onboarding page.
 *
 * Everything animates off the shared scroll offset rather than off an index, so
 * the motion tracks the finger through a drag instead of snapping once the
 * gesture ends. Layers move at different rates — artwork slowest, heading
 * fastest — which is what gives the transition depth.
 *
 * Every interpolation drives only `opacity` and `transform`, so the whole page
 * runs on the native driver and stays smooth while JS is busy.
 */
export function SlideContent({ slide, width, scrollX, index }: Props) {
  const range = [(index - 1) * width, index * width, (index + 1) * width];

  // Negative multiplier = trails the scroll, so the layer appears to sit
  // behind the page. Larger magnitude reads as further back.
  const drift = (depth: number) =>
    scrollX.interpolate({
      inputRange: range,
      outputRange: [width * depth, 0, -width * depth],
      extrapolate: 'clamp',
    });

  // A straight three-point ramp, so at the midpoint of a swipe the outgoing
  // and incoming pages are both at half opacity and genuinely cross-fade.
  // Bottoming out earlier than the midpoint leaves a blank frame mid-gesture.
  const fade = () =>
    scrollX.interpolate({
      inputRange: range,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

  const rise = (distance: number) =>
    scrollX.interpolate({
      inputRange: range,
      outputRange: [distance, 0, distance],
      extrapolate: 'clamp',
    });

  const artScale = scrollX.interpolate({
    inputRange: range,
    outputRange: [0.86, 1, 0.86],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.page, { width }]}>
      {/* Heading — travels closest to the finger. */}
      <Animated.View
        style={[styles.heading, { opacity: fade(), transform: [{ translateX: drift(0.12) }] }]}
      >
        <Text variant="h1" tone="onDark" align="center">
          {slide.titleTop}
        </Text>
        <Text variant="h1" tone="gold" align="center" color={scale.gold400}>
          {slide.titleBottom}
        </Text>
        <Ornament style={styles.ornament} />
        <Text variant="bodySm" tone="onDarkMuted" align="center" style={styles.body}>
          {slide.body}
        </Text>
      </Animated.View>

      {/* Body — one step further back, and rises as it settles. */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade(),
            transform: [{ translateX: drift(0.3) }, { translateY: rise(26) }],
          },
        ]}
      >
        {slide.kind === 'features' ? (
          <Features slide={slide} scrollX={scrollX} width={width} index={index} />
        ) : slide.kind === 'journey' ? (
          <Journey slide={slide} />
        ) : (
          <Animated.View style={[styles.planWrap, { transform: [{ scale: artScale }] }]}>
            <Image
              source={images.onboarding.carePlan}
              style={styles.planArt}
              resizeMode="contain"
              accessible={false}
            />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

/** Three gold-icon rows, each entering slightly after the one above it. */
function Features({
  slide,
  scrollX,
  width,
  index,
}: {
  slide: OnboardingSlide;
  scrollX: Animated.Value;
  width: number;
  index: number;
}) {
  return (
    <View>
      {(slide.features ?? []).map((f, i) => {
        // Staggering the depth per row makes them fan out on the way in
        // rather than moving as one slab.
        const depth = 0.1 + i * 0.07;
        const translateX = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [width * depth, 0, -width * depth],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={f.title}
            style={[styles.featureRow, i > 0 && styles.featureRowSpaced, { transform: [{ translateX }] }]}
          >
            <View style={styles.featureDisc}>
              <Image source={f.image} style={styles.featureIcon} resizeMode="contain" accessible={false} />
            </View>
            <View style={styles.featureText}>
              <Text variant="h4" tone="onDark" numberOfLines={1}>
                {f.title}
              </Text>
              <Text
                variant="caption"
                tone="onDarkMuted"
                numberOfLines={2}
                style={styles.featureBody}
              >
                {f.body}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

/**
 * The glowing path, drawn whole, with the steps set against it.
 *
 * The artwork is one continuous winding curve, so it has to be shown complete —
 * cropping it to a narrow rail breaks the line into what look like unrelated
 * gold fragments. It is anchored right at its own aspect ratio and the steps
 * are placed absolutely down the left, each sitting beside its node rather than
 * flowing in a column that ignores where the curve actually is.
 */
function Journey({ slide }: { slide: OnboardingSlide }) {
  return (
    <View style={styles.journey}>
      <Image
        source={images.onboarding.path}
        style={styles.journeyPath}
        resizeMode="contain"
        accessible={false}
      />

      {(slide.steps ?? []).map((s, i) => (
        <View key={s.index} style={[styles.journeyStep, STEP_POS[i]]}>
          <Text variant="h3" color={scale.gold400}>
            {s.index}
          </Text>
          <Text variant="label" tone="onDark" style={styles.stepTitle}>
            {s.title}
          </Text>
          <Text variant="caption" tone="onDarkMuted" numberOfLines={3} style={styles.stepBody}>
            {s.body}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Where each step sits against the curve, as shares of the block.
 *
 * The horizontal stagger is the point: the artwork's three nodes are not
 * stacked in a line, so a rigid left column leaves the text unrelated to the
 * curve it is meant to annotate. Each block is nudged to sit just clear of its
 * own node, which is what makes the two read as one composition.
 *
 * Nodes sit at roughly (48%, 24%), (48%, 57%) and (83%, 80%) of the artwork.
 */
const STEP_POS = [
  { top: '-4%', left: '0%', width: '50%' },
  // Indented, following the curve — but only as far as the glow allows. The
  // artwork swings widest left at this height, and text over the glow is the
  // one thing that costs more than the stagger buys.
  { top: '30%', left: '14%', width: '46%' },
  { top: '63%', left: '6%', width: '50%' },
] as const;

/** How far the curve sits past the block's right edge, clearing the columns. */
const PATH_BLEED = 48;

const DISC = scaleWidth(44);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  heading: {
    alignItems: 'center',
  },
  ornament: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  body: {
    paddingHorizontal: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.md,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureRowSpaced: {
    marginTop: spacing.md,
  },
  featureDisc: {
    width: DISC,
    height: DISC,
    borderRadius: DISC / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: alpha(colors.accent, 0.45),
    backgroundColor: alpha(scale.emerald900, 0.3),
    marginRight: spacing.base,
  },
  featureIcon: {
    width: DISC * 0.52,
    height: DISC * 0.52,
  },
  featureText: {
    flex: 1,
  },
  featureBody: {
    marginTop: spacing.xs,
  },

  journey: {
    flex: 1,
  },
  journeyPath: {
    position: 'absolute',
    right: -PATH_BLEED,
    // Bleeds a little above and below the block so the curve reads at a size
    // worth looking at; the block itself is only ~190pt tall on a handset.
    top: '-9%',
    height: '124%',
    // Both axes explicit. Absolute insets are not enough: an Image with no
    // definite height falls back to the artwork's own 620 px and overflows,
    // leaving a single node filling the corner.
    width: '66%',
  },
  journeyStep: {
    position: 'absolute',
  },
  stepTitle: {
    marginTop: spacing.xxs,
  },
  stepBody: {
    marginTop: spacing.xs,
  },

  planWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  planArt: {
    width: scaleWidth(260),
    height: scaleWidth(300),
  },
});
