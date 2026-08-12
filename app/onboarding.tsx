import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PageDots } from '@/components/onboarding/PageDots';
import { SlideContent } from '@/components/onboarding/SlideContent';
import { SLIDES } from '@/components/onboarding/slides';
import { Button, Text } from '@/components/ui';
import { images } from '@/constants/images';
import { useAuth } from '@/providers/AuthProvider';
import { colors, fontFamily, gutter, scaleWidth, spacing } from '@/theme';

/**
 * Onboarding.
 *
 * The marble backdrop, the logo lockup and the footer controls are fixed; only
 * the middle band pages. That keeps the brand anchored while the content moves,
 * and means the expensive artwork is never re-laid-out mid-gesture.
 *
 * Paging is a plain horizontal ScrollView rather than a FlatList: three slides
 * is well inside what should stay mounted, and keeping them all rendered means
 * the parallax has something to move on both sides of the fold.
 */
export default function OnboardingRoute() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { width, height } = useWindowDimensions();

  // Keep the artwork's own aspect so nothing distorts, then zoom just enough
  // that lifting it still covers the bottom of the screen.
  const artWidth = width * ART_ZOOM;
  const artHeight = Math.max(artWidth * ART_ASPECT, height + CURVE_LIFT);

  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLast = index === SLIDES.length - 1;

  const finish = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/sign-up');
  }, [completeOnboarding, router]);

  const goToSignIn = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(auth)/sign-in');
  }, [completeOnboarding, router]);

  const advance = useCallback(() => {
    if (isLast) return void finish();
    const next = index + 1;
    // Set the index here as well as in onMomentumScrollEnd: a programmatic
    // scrollTo does not reliably emit a momentum-end event, so relying on that
    // alone leaves the dots and the button label stuck on the first slide.
    setIndex(next);
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  }, [index, isLast, width, finish]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      if (next !== index) setIndex(next);
    },
    [width, index],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/*
        Sized explicitly rather than left to `cover`. Onboarding carries far
        more content below the gold curve than sign-in does, so the artwork is
        zoomed slightly and pulled upward until the curve's lowest point clears
        the headings. Letting `cover` derive the scale from a taller box does
        the opposite — it zooms in and pushes the curve further down.
      */}
      <Image
        source={images.backgrounds.login}
        style={[
          styles.backdrop,
          {
            width: artWidth,
            height: artHeight,
            left: (width - artWidth) / 2,
            top: -CURVE_LIFT,
          },
        ]}
        resizeMode="cover"
        fadeDuration={0}
        accessible={false}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Fixed brand header, on the ivory half */}
        <View style={styles.header}>
          <View style={styles.skipRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              hitSlop={12}
              onPress={finish}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="bodySm" tone="primary">
                Skip
              </Text>
            </Pressable>
          </View>

          <View style={styles.lockup}>
            <Image
              source={images.brand.monogram}
              style={styles.monogram}
              resizeMode="contain"
              accessibilityLabel="Velora Clinics"
            />
            <Text style={styles.wordmark}>VELORA</Text>
            <Text style={styles.subWordmark}>CLINICS</Text>
            <Text variant="bodySm" tone="primary" align="center" style={styles.tagline}>
              Elevated care.
            </Text>
            <Text variant="bodySm" tone="primary" align="center">
              Exceptional you.
            </Text>
          </View>
        </View>

        {/* Paged band */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumEnd}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: true,
          })}
          scrollEventThrottle={16}
          style={styles.pager}
          // Snapping decelerates fast so the page settles crisply instead of
          // coasting, which is what makes a slow pager feel loose.
          decelerationRate="fast"
        >
          {SLIDES.map((slide, i) => (
            <SlideContent key={slide.key} slide={slide} width={width} scrollX={scrollX} index={i} />
          ))}
        </Animated.ScrollView>

        {/* Fixed footer */}
        <View style={styles.footer}>
          <PageDots count={SLIDES.length} index={index} style={styles.dots} />

          <Button
            label={isLast ? 'Get Started' : 'Next'}
            onPress={advance}
            icon="arrow-right"
            variant="marble"
            size="lg"
          />

          <View style={styles.signInRow}>
            <Text variant="bodySm" tone="onDarkMuted">
              Already have an account?{' '}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              hitSlop={8}
              onPress={goToSignIn}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text variant="bodySm" tone="gold">
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/** Aspect (h/w) of login-background.jpg — 853x1844. */
const ART_ASPECT = 1844 / 853;
/** Slight zoom, so raising the artwork still leaves stone at the bottom. */
const ART_ZOOM = 1.3;
/** How far the backdrop is raised so the curve clears the paged content. */
const CURVE_LIFT = 196;
const MONO = scaleWidth(66);
/** Gap between the fixed lockup and the paged band. */
const PAGER_OFFSET = 84;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceInverse,
  },
  backdrop: {
    position: 'absolute',
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: gutter,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingTop: spacing.xs,
    minHeight: 24,
  },
  lockup: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  monogram: {
    width: MONO * 1.06,
    height: MONO,
  },
  wordmark: {
    fontFamily: fontFamily.serif,
    color: colors.textPrimary,
    fontSize: MONO * 0.34,
    letterSpacing: MONO * 0.115,
    marginRight: -MONO * 0.115,
    marginTop: spacing.sm,
    includeFontPadding: false,
  },
  subWordmark: {
    fontFamily: fontFamily.sansLight,
    color: colors.textSecondary,
    fontSize: MONO * 0.15,
    letterSpacing: MONO * 0.15,
    marginRight: -MONO * 0.15,
    marginTop: spacing.xs,
    includeFontPadding: false,
  },
  tagline: {
    marginTop: spacing.sm,
  },
  pager: {
    flex: 1,
    // Drops the paged band clear of the curve's lowest point.
    marginTop: PAGER_OFFSET,
  },
  footer: {
    paddingHorizontal: gutter,
    paddingBottom: spacing.sm,
  },
  dots: {
    marginBottom: spacing.lg,
  },
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.base,
  },
  pressed: {
    opacity: 0.55,
  },
});
