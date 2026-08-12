import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Marble } from '@/components/brand/Marble';
import { VeloraMonogram } from '@/components/brand/VeloraMonogram';
import { VeloraWordmark } from '@/components/brand/VeloraWordmark';
import { Text } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { scaleWidth, spacing } from '@/theme';

/** Minimum time the splash stays up, so the brand moment is never a flash. */
const MIN_SPLASH_MS = 2100;

/**
 * Splash screen.
 *
 * Doubles as the routing gate: it plays the monogram animation while
 * `AuthProvider` restores the session, then routes to onboarding, auth or home.
 */
export default function SplashRoute() {
  const router = useRouter();
  const { status, hasSeenOnboarding } = useAuth();

  const monogramOpacity = useRef(new Animated.Value(0)).current;
  const monogramScale = useRef(new Animated.Value(0.86)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkShift = useRef(new Animated.Value(14)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const mountedAt = useRef(Date.now());

  // Entrance: the monogram settles, the wordmark rises beneath it.
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(monogramOpacity, {
          toValue: 1,
          duration: 780,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(monogramScale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkShift, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [monogramOpacity, monogramScale, wordmarkOpacity, wordmarkShift, taglineOpacity]);

  // Routing gate — waits for both the bootstrap and the minimum brand moment.
  useEffect(() => {
    if (status === 'loading' || hasSeenOnboarding === null) return;

    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed);

    const timer = setTimeout(() => {
      if (status === 'authenticated') router.replace('/(tabs)');
      else if (!hasSeenOnboarding) router.replace('/onboarding');
      else router.replace('/(auth)/sign-in');
    }, wait);

    return () => clearTimeout(timer);
  }, [status, hasSeenOnboarding, router]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Marble variant="emerald" style={StyleSheet.absoluteFillObject} intensity={1.1} />

      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: monogramOpacity,
            transform: [{ scale: monogramScale }],
          }}
        >
          <VeloraMonogram size={scaleWidth(120)} tone="gold" />
        </Animated.View>

        <Animated.View
          style={[
            styles.wordmark,
            { opacity: wordmarkOpacity, transform: [{ translateY: wordmarkShift }] },
          ]}
        >
          <VeloraWordmark size={scaleWidth(24)} tone="ivory" align="center" />
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: taglineOpacity }]}>
        <Text variant="caption" tone="onDarkMuted" align="center" style={styles.tagline}>
          THE ART OF CONSIDERED WELLNESS
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    marginTop: spacing.xxl,
  },
  footer: {
    paddingBottom: spacing.huge,
    alignItems: 'center',
  },
  tagline: {
    letterSpacing: 3,
  },
});
