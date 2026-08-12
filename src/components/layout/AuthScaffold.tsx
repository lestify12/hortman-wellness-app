import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { Marble } from '@/components/brand/Marble';
import { VeloraMonogram } from '@/components/brand/VeloraMonogram';
import { VeloraWordmark } from '@/components/brand/VeloraWordmark';
import { Text } from '@/components/ui';
import { colors, contentMaxWidth, gutter, radius, scaleWidth, screen, spacing } from '@/theme';

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Pinned to the bottom of the sheet, below the scrolling form. */
  footer?: React.ReactNode;
  showBack?: boolean;
  /** Shorter emerald hero for denser forms like sign-up. */
  compactHero?: boolean;
}

/**
 * Shared chrome for the authentication screens: an emerald marble hero with the
 * logo lockup, and an ivory sheet that overlaps it carrying the form.
 */
export function AuthScaffold({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  showBack = false,
  compactHero = false,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {/* Hero takes whatever vertical space the sheet leaves, so the logo
            lockup is never clipped no matter how tall the form is. */}
        <Marble variant="emerald" style={styles.hero} intensity={1.05}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={14}
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace('/(auth)/sign-in')
                }
                style={({ pressed }) => [styles.back, pressed && styles.pressed]}
              >
                <Feather name="chevron-left" size={24} color={colors.textOnDark} />
              </Pressable>
            ) : null}

            <View style={styles.lockup}>
              <VeloraMonogram size={scaleWidth(compactHero ? 54 : 68)} tone="gold" />
              <VeloraWordmark
                size={scaleWidth(compactHero ? 13 : 15)}
                tone="ivory"
                align="center"
                showTagline={!compactHero}
                style={styles.wordmark}
              />
            </View>
          </SafeAreaView>
        </Marble>

        <View style={[styles.sheet, compactHero && styles.sheetTall]}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.column}>
              <Text variant="eyebrow" tone="gold" style={styles.eyebrow}>
                {eyebrow}
              </Text>
              <Text variant="h1">{title}</Text>
              {subtitle ? (
                <Text variant="body" tone="secondary" style={styles.subtitle}>
                  {subtitle}
                </Text>
              ) : null}

              <View style={styles.form}>{children}</View>
            </View>
          </ScrollView>

          {footer ? (
            <SafeAreaView edges={['bottom']} style={styles.footer}>
              <View style={styles.column}>{footer}</View>
            </SafeAreaView>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceInverse,
  },
  flex: {
    flex: 1,
  },
  hero: {
    flex: 1,
    // Guarantees room for the lockup even when the form is at its tallest.
    minHeight: 190,
  },
  heroSafe: {
    flex: 1,
    paddingHorizontal: gutter,
  },
  back: {
    marginLeft: -spacing.sm,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.55,
  },
  lockup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Offsets the sheet's overlap so the lockup reads as optically centred.
    paddingBottom: spacing.base,
  },
  wordmark: {
    marginTop: spacing.base,
  },
  sheet: {
    maxHeight: '72%',
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    overflow: 'hidden',
    // Overlaps the marble hero so the rounded edge sits over the stone.
    marginTop: -radius.xxl,
  },
  sheetTall: {
    maxHeight: '80%',
  },
  scrollContent: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  column: {
    paddingHorizontal: gutter,
    width: '100%',
    maxWidth: screen.isTablet ? contentMaxWidth : undefined,
    alignSelf: 'center',
  },
  eyebrow: {
    marginBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.md,
  },
  form: {
    marginTop: spacing.xxl,
  },
  footer: {
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
  },
});
