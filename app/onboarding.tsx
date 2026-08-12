import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import { VeloraMonogram } from '@/components/brand/VeloraMonogram';
import { Button, Divider, Text } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { alpha, colors, gutter, radius, scale, scaleWidth, spacing } from '@/theme';

interface Slide {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: keyof typeof Feather.glyphMap;
}

const SLIDES: Slide[] = [
  {
    key: 'ritual',
    eyebrow: 'Considered care',
    title: 'Medicine, refined into ritual',
    body: 'Every Velora protocol is designed by physicians and delivered with the calm of a private atelier. No queues, no clinical glare — only considered care.',
    icon: 'feather',
  },
  {
    key: 'journey',
    eyebrow: 'Your journey',
    title: 'Progress you can actually see',
    body: 'Track each session, measurement and milestone in one place. Your journey is documented so results are never a matter of memory.',
    icon: 'trending-up',
  },
  {
    key: 'access',
    eyebrow: 'Membership',
    title: 'Your physicians, one message away',
    body: 'Priority booking, private suites and direct access to the specialists who know your history. Everything arranged before you arrive.',
    icon: 'key',
  },
];

/**
 * Onboarding carousel.
 *
 * A paged horizontal scroll with a marble hero per slide. The scroll offset
 * drives both the hero cross-fade and the progress rule, so the motion stays
 * tied to the gesture rather than to a timer.
 */
export default function OnboardingRoute() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { width } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<Animated.FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;

  const finish = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/sign-up');
  }, [completeOnboarding, router]);

  const advance = useCallback(() => {
    if (isLast) return void finish();
    const next = index + 1;
    setIndex(next);
    scrollRef.current?.scrollToOffset({ offset: next * width, animated: true });
  }, [index, isLast, width, finish]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(next);
    },
    [width],
  );

  const heroOpacity = useMemo(
    () =>
      SLIDES.map((_, i) =>
        scrollX.interpolate({
          inputRange: [(i - 1) * width, i * width, (i + 1) * width],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        }),
      ),
    [scrollX, width],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Marble heroes cross-fade behind the paged copy. */}
      <View style={styles.hero} pointerEvents="none">
        {SLIDES.map((slide, i) => (
          <Animated.View key={slide.key} style={[StyleSheet.absoluteFill, { opacity: heroOpacity[i] }]}>
            <Marble
              variant={i === 1 ? 'champagne' : 'emerald'}
              intensity={i === 1 ? 0.9 : 1.15}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        ))}

        <View style={styles.heroContent}>
          <VeloraMonogram size={scaleWidth(64)} tone="gold" ring={false} />
        </View>
      </View>

      <SafeAreaView style={styles.sheetWrap} edges={['bottom']}>
        <View style={styles.sheet}>
          <Animated.FlatList
            ref={scrollRef}
            data={SLIDES}
            keyExtractor={(item) => item.key}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: true,
            })}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <View style={[styles.slide, { width }]}>
                <View style={styles.iconDisc}>
                  <Feather name={item.icon} size={19} color={scale.emerald600} />
                </View>

                <Text variant="eyebrow" tone="gold" style={styles.eyebrow}>
                  {item.eyebrow}
                </Text>
                <Text variant="display" style={styles.title}>
                  {item.title}
                </Text>
                <Text variant="bodyLg" tone="secondary" style={styles.body}>
                  {item.body}
                </Text>
              </View>
            )}
          />

          <View style={styles.controls}>
            <View style={styles.dots}>
              {SLIDES.map((slide, i) => (
                <View key={slide.key} style={[styles.dot, i === index && styles.dotActive]} />
              ))}
            </View>

            <Button
              label={isLast ? 'Begin' : 'Continue'}
              onPress={advance}
              variant={isLast ? 'gold' : 'primary'}
              icon="arrow-right"
              size="lg"
            />

            <Divider label={isLast ? 'ALREADY A MEMBER' : 'OR'} style={styles.divider} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in to an existing account"
              onPress={async () => {
                await completeOnboarding();
                router.replace('/(auth)/sign-in');
              }}
              style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
            >
              <Text variant="label" tone="primary">
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceInverse,
  },
  hero: {
    flex: 1,
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  sheetWrap: {
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    // Lifts the sheet over the marble hero.
    marginTop: -radius.xxl,
  },
  sheet: {
    paddingTop: spacing.xxl,
  },
  slide: {
    paddingHorizontal: gutter,
  },
  iconDisc: {
    width: 46,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(scale.emerald600, 0.08),
    marginBottom: spacing.lg,
  },
  eyebrow: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.base,
  },
  body: {
    minHeight: 100,
  },
  controls: {
    paddingHorizontal: gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.hairlineStrong,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.55,
  },
});
