import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, radius, scale, spacing } from '@/theme';

interface Props {
  count: number;
  index: number;
  style?: StyleProp<ViewStyle>;
}

const DOT = 7;
const ACTIVE_WIDTH = 22;

/**
 * Page indicator: the active dot stretches into a gold pill.
 *
 * Driven by the settled index rather than by the shared scroll offset. Width is
 * not a native-driver property, and mixing drivers on one Animated.Value throws
 * — so this keeps its own JS-driven value while the pages keep the native one.
 * It is three small views, so the JS driver costs nothing here.
 */
export function PageDots({ count, index, style }: Props) {
  const progress = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: index,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [index, progress]);

  return (
    <View style={[styles.root, style]} accessibilityRole="tablist">
      {Array.from({ length: count }, (_, i) => {
        const distance = progress.interpolate({
          inputRange: [i - 1, i, i + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={i}
            accessibilityRole="tab"
            accessibilityState={{ selected: i === index }}
            style={[
              styles.dot,
              {
                width: distance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [DOT, ACTIVE_WIDTH],
                }),
                backgroundColor: distance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [alpha(scale.ivory, 0.28), colors.accent],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: DOT,
    borderRadius: radius.pill,
  },
});
