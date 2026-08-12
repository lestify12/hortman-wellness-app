import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

import { images } from '@/constants/images';
import { JOURNEY_NODES, JourneyPath } from './JourneyPath';
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
          <Journey slide={slide} width={width} />
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
 * The journey steps, laid out against the drawn path.
 *
 * Each block is positioned from the curve's own node coordinates rather than
 * from hand-tuned offsets, so the copy and the line cannot drift apart: the
 * block's right edge stops a fixed gap short of its node, and its baseline sits
 * just above it. Nudging the curve now moves the text with it.
 */
function Journey({ slide, width }: { slide: OnboardingSlide; width: number }) {
  // The block is measured, so the path can be sized from real numbers rather
  // than percentages that the copy would then have to guess at.
  const [box, setBox] = React.useState({ w: 0, h: 0 });

  return (
    <View
      style={styles.journey}
      onLayout={(e) =>
        setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })
      }
    >
      {box.w > 0 ? (
        <>
          <View style={styles.journeyPath}>
            <JourneyPath width={box.w * PATH_WIDTH} height={box.h} />
          </View>

          {(slide.steps ?? []).map((s, i) => {
            const node = JOURNEY_NODES[i];
            const pathLeft = box.w * (1 - PATH_WIDTH);
            const nodeX = pathLeft + node.x * box.w * PATH_WIDTH;
            const nodeY = node.y * box.h;
            // Fixed width, variable left: that is what produces the stagger.
            // Sizing the width to the node instead would leave every block
            // flush left and the column would read as unrelated to the curve.
            const blockWidth = box.w * BLOCK_WIDTH;
            const left = Math.max(0, nodeX - NODE_GAP - blockWidth);

            return (
              <View
                key={s.index}
                style={[
                  styles.journeyStep,
                  { width: blockWidth, left, top: Math.max(0, nodeY - BLOCK_LIFT) },
                ]}
              >
                <Text variant="h3" color={scale.gold400}>
                  {s.index}
                </Text>
                <Text variant="label" tone="onDark" style={styles.stepTitle}>
                  {s.title}
                </Text>
                <Text variant="caption" tone="onDarkMuted" numberOfLines={2} style={styles.stepBody}>
                  {s.body}
                </Text>
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}

/** Share of the block's width the drawn path occupies, anchored right. */
const PATH_WIDTH = 0.42;
/** Share of the block's width each step's text occupies. */
const BLOCK_WIDTH = 0.56;
/** Clearance between a step's text and its node. */
const NODE_GAP = 22;
/** How far above its node a step's block starts. */
const BLOCK_LIFT = 38;

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
    right: 0,
    top: 0,
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
