import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { Text } from './Typography';

interface Props {
  title?: string;
  eyebrow?: string;
  /** Shows the back chevron. Defaults to true when the router can go back. */
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  dark?: boolean;
  align?: 'left' | 'center';
}

/**
 * In-screen header. Expo Router's native header is disabled app-wide so that
 * every screen uses this serif treatment instead of a platform title bar.
 */
export function ScreenHeader({
  title,
  eyebrow,
  showBack = true,
  onBack,
  right,
  dark = false,
  align = 'left',
}: Props) {
  const router = useRouter();
  const tint = dark ? colors.textOnDark : colors.textPrimary;

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.root}>
      <View style={styles.bar}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={14}
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Feather name="chevron-left" size={24} color={tint} />
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}

        <View style={styles.rightSlot}>{right}</View>
      </View>

      {eyebrow || title ? (
        <View style={[styles.titleBlock, align === 'center' && styles.centered]}>
          {eyebrow ? (
            <Text
              variant="eyebrow"
              tone={dark ? 'onDarkMuted' : 'gold'}
              align={align === 'center' ? 'center' : 'left'}
              style={styles.eyebrow}
            >
              {eyebrow}
            </Text>
          ) : null}
          {title ? (
            <Text
              variant="h1"
              tone={dark ? 'onDark' : 'primary'}
              align={align === 'center' ? 'center' : 'left'}
            >
              {title}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  backButton: {
    marginLeft: -spacing.sm,
    padding: spacing.xs,
  },
  backSpacer: {
    width: 1,
    height: 36,
  },
  rightSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titleBlock: {
    marginTop: spacing.md,
  },
  centered: {
    alignItems: 'center',
  },
  eyebrow: {
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.5,
  },
});
