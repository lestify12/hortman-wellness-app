import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { alpha, colors, radius, scale, spacing } from '@/theme';
import { Text } from './Typography';

export type SocialProvider = 'apple' | 'google';

interface Props {
  provider: SocialProvider;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const PROVIDERS: Record<
  SocialProvider,
  { label: string; icon: React.ComponentProps<typeof FontAwesome>['name']; tint: string }
> = {
  apple: { label: 'Continue with Apple', icon: 'apple', tint: colors.textOnDark },
  // Google's mark is multi-colour; its own blue reads correctly on emerald and
  // is the one place the brand palette gives way to a third party's.
  google: { label: 'Continue with Google', icon: 'google', tint: '#E8E3DA' },
};

/**
 * Federated sign-in button for the emerald half of the auth screens: a gold
 * hairline over the marble, with the provider mark leading the label.
 */
export function SocialButton({ provider, onPress, loading = false, disabled, style }: Props) {
  const p = PROVIDERS[provider];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={p.label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textOnDark} />
      ) : (
        <View style={styles.row}>
          <FontAwesome name={p.icon} size={17} color={p.tint} style={styles.icon} />
          <Text variant="body" tone="onDark">
            {p.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(scale.emerald900, 0.28),
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: alpha(colors.accent, 0.42),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
});
