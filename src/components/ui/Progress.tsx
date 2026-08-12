import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { alpha, colors, radius, scale, spacing } from '@/theme';
import { Text } from './Typography';

/* ------------------------------------------------------------- linear bar */

interface BarProps {
  /** 0–1. */
  value: number;
  tone?: 'gold' | 'emerald' | 'sage' | 'onDark';
  height?: number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

const BAR_TONES = {
  gold: { fill: colors.accent, track: alpha(colors.accent, 0.16) },
  emerald: { fill: scale.emerald600, track: alpha(scale.emerald600, 0.14) },
  sage: { fill: scale.sage300, track: alpha(scale.sage300, 0.3) },
  onDark: { fill: colors.accent, track: alpha(scale.ivory, 0.16) },
} as const;

/** Thin progress rule used on package and membership cards. */
export function ProgressBar({
  value,
  tone = 'gold',
  height = 4,
  style,
  animated = true,
}: BarProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const t = BAR_TONES[tone];
  const width = useRef(new Animated.Value(animated ? 0 : clamped)).current;

  useEffect(() => {
    if (!animated) {
      width.setValue(clamped);
      return;
    }
    Animated.timing(width, {
      toValue: clamped,
      duration: 720,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, animated, width]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, backgroundColor: t.track }, style]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: t.fill,
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ ring */

interface RingProps {
  /** 0–1. */
  value: number;
  size?: number;
  strokeWidth?: number;
  tone?: 'gold' | 'emerald' | 'onDark';
  /** Large numeral in the centre; pass null to render children instead. */
  caption?: string;
  label?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_TONES = {
  gold: { from: scale.gold300, to: scale.gold600, track: alpha(colors.accent, 0.16) },
  emerald: { from: scale.emerald400, to: scale.emerald700, track: alpha(scale.emerald600, 0.14) },
  onDark: { from: scale.gold300, to: scale.gold500, track: alpha(scale.ivory, 0.16) },
} as const;

/**
 * Circular progress ring — the hero metric on the journey and package screens.
 * Animates the stroke dash offset on mount.
 */
export function ProgressRing({
  value,
  size = 132,
  strokeWidth = 6,
  tone = 'gold',
  caption,
  label,
  children,
  style,
}: RingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const t = RING_TONES[tone];
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: clamped,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, progress]);

  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const gradientId = `ring-${tone}`;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[{ width: size, height: size }, styles.ringRoot, style]}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2={size} y2={size} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={t.from} />
            <Stop offset="1" stopColor={t.to} />
          </LinearGradient>
        </Defs>

        <Circle cx={size / 2} cy={size / 2} r={r} stroke={t.track} strokeWidth={strokeWidth} fill="none" />

        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          // Start the arc at 12 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.ringCenter}>
        {children ?? (
          <>
            {caption ? (
              <Text variant="metric" tone={tone === 'onDark' ? 'onDark' : 'primary'}>
                {caption}
              </Text>
            ) : null}
            {label ? (
              <Text
                variant="eyebrow"
                tone={tone === 'onDark' ? 'onDarkMuted' : 'tertiary'}
                align="center"
                style={styles.ringLabel}
              >
                {label}
              </Text>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------- step dots */

interface StepDotsProps {
  total: number;
  completed: number;
  /** Index of the session that is booked but not yet completed. */
  scheduledIndex?: number;
  style?: StyleProp<ViewStyle>;
}

/** Session pips for a treatment course — filled, next, and remaining. */
export function StepDots({ total, completed, scheduledIndex, style }: StepDotsProps) {
  return (
    <View style={[styles.dots, style]}>
      {Array.from({ length: total }, (_, i) => {
        const isDone = i < completed;
        const isScheduled = scheduledIndex !== undefined && i === scheduledIndex;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              isDone && styles.dotDone,
              isScheduled && styles.dotScheduled,
              !isDone && !isScheduled && styles.dotPending,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
  },
  ringRoot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: {
    marginTop: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
  },
  dotDone: {
    backgroundColor: colors.accent,
  },
  dotScheduled: {
    backgroundColor: colors.transparent,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.accent,
  },
  dotPending: {
    backgroundColor: alpha(colors.textPrimary, 0.14),
  },
});
