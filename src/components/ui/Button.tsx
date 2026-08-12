import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { alpha, colors, elevation, gradients, radius, scale, spacing, typeScale } from '@/theme';
import { Text } from './Typography';

export type ButtonVariant = 'primary' | 'gold' | 'outline' | 'ghost' | 'onDark' | 'marble';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const HEIGHTS: Record<ButtonSize, number> = { sm: 40, md: 50, lg: 58 };

/**
 * Primary action control. Emerald fill by default, gold for the single most
 * important action on a screen, outline/ghost for secondary paths.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'right',
  fullWidth = true,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  const scheme = SCHEMES[variant];
  const height = HEIGHTS[size];

  const iconNode = icon ? (
    <Feather
      name={icon}
      size={size === 'sm' ? 15 : 17}
      color={scheme.content}
      style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
    />
  ) : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: size === 'sm' || variant === 'marble' ? radius.md : radius.pill,
        },
        scheme.container,
        fullWidth ? styles.fullWidth : styles.hugged,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        variant !== 'ghost' && variant !== 'outline' && variant !== 'marble'
          ? elevation.soft
          : null,
        style,
      ]}
    >
      {scheme.gradient ? (
        <LinearGradient
          colors={scheme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={scheme.content} />
        ) : (
          <>
            {iconPosition === 'left' ? iconNode : null}
            <Text
              variant="button"
              color={scheme.content}
              // The control has a fixed height, so a label must never wrap.
              numberOfLines={1}
              style={size === 'sm' ? styles.labelSm : undefined}
            >
              {label}
            </Text>
            {iconPosition === 'right' ? iconNode : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

interface Scheme {
  container: ViewStyle;
  content: string;
  gradient?: readonly [string, string, ...string[]];
}

const SCHEMES: Record<ButtonVariant, Scheme> = {
  primary: {
    container: { backgroundColor: colors.surfaceInverse },
    content: colors.textOnDark,
    gradient: gradients.emeraldSheen,
  },
  gold: {
    container: { backgroundColor: colors.accent },
    content: scale.emerald900,
    gradient: gradients.goldLeaf,
  },
  outline: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: colors.hairlineStrong,
    },
    content: colors.textPrimary,
  },
  ghost: {
    container: { backgroundColor: colors.transparent },
    content: colors.textPrimary,
  },
  onDark: {
    container: {
      backgroundColor: colors.transparent,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: colors.hairlineOnDark,
    },
    content: colors.textOnDark,
  },
  // Primary action sitting on the emerald marble: a lifted emerald fill inside
  // a gold hairline, so it reads as raised stone rather than a pasted-on chip.
  marble: {
    container: {
      backgroundColor: alpha(scale.emerald500, 0.55),
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: alpha(colors.accent, 0.55),
    },
    content: colors.textOnDark,
  },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  hugged: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelSm: {
    fontSize: typeScale.button.fontSize - 1.5,
    letterSpacing: 1.1,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
