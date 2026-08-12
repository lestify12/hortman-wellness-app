import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { Text } from './Typography';

interface Props {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  dark?: boolean;
  style?: object;
}

/** Eyebrow + serif title + optional trailing text action. */
export function SectionHeader({
  title,
  eyebrow,
  actionLabel,
  onAction,
  dark = false,
  style,
}: Props) {
  return (
    <View style={[styles.root, style]}>
      <View style={styles.left}>
        {eyebrow ? (
          <Text variant="eyebrow" tone={dark ? 'onDarkMuted' : 'gold'} style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="h2" tone={dark ? 'onDark' : 'primary'}>
          {title}
        </Text>
      </View>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={10}
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text variant="label" tone={dark ? 'onDarkMuted' : 'secondary'}>
            {actionLabel}
          </Text>
          <Feather
            name="arrow-up-right"
            size={14}
            color={dark ? colors.textOnDarkMuted : colors.textSecondary}
            style={styles.actionIcon}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  left: {
    flex: 1,
    paddingRight: spacing.base,
  },
  eyebrow: {
    marginBottom: spacing.sm,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.xxs,
  },
  actionIcon: {
    marginLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.55,
  },
});
