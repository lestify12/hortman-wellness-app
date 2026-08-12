import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { alpha, colors, radius, scale, spacing, typeScale } from '@/theme';
import { Text } from './Typography';

interface Props extends Omit<TextInputProps, 'style'> {
  /** Also the accessible name when `showLabel` is false. */
  label: string;
  error?: string | null;
  hint?: string;
  icon?: keyof typeof Feather.glyphMap;
  /** Renders the eye toggle and manages secure entry internally. */
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Ivory-on-emerald treatment for fields placed over dark surfaces. */
  onDark?: boolean;
  /**
   * `underline` is the stationery treatment used on light sheets; `boxed` is
   * the gold-hairline capsule used over the marble auth background.
   */
  variant?: 'underline' | 'boxed';
  /** Boxed fields carry their label as a placeholder instead. */
  showLabel?: boolean;
}

/**
 * Text field with two treatments. The underlined default keeps light sheets
 * feeling like stationery rather than a web form; the boxed variant gives the
 * marble auth screens a capsule the placeholder can sit inside.
 */
export function TextField({
  label,
  error,
  hint,
  icon,
  secure = false,
  containerStyle,
  onDark = false,
  variant = 'underline',
  showLabel = true,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const boxed = variant === 'boxed';
  const palette = onDark ? DARK : LIGHT;
  const ruleColor = error
    ? colors.danger
    : focused
      ? palette.ruleFocused
      : boxed
        ? palette.box
        : palette.rule;

  return (
    <View style={[styles.root, boxed && styles.rootBoxed, containerStyle]}>
      {showLabel ? (
        <Text
          variant="eyebrow"
          color={error ? colors.danger : palette.label}
          style={styles.label}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          boxed
            ? [styles.fieldBoxed, { borderColor: ruleColor, backgroundColor: palette.boxFill }]
            : { borderBottomColor: ruleColor },
        ]}
      >
        {icon ? (
          <Feather
            name={icon}
            size={17}
            color={focused ? palette.iconActive : palette.icon}
            style={styles.icon}
          />
        ) : null}

        <TextInput
          accessibilityLabel={label}
          {...inputProps}
          style={[styles.input, { color: palette.text }]}
          placeholderTextColor={palette.placeholder}
          secureTextEntry={secure && !revealed}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          selectionColor={colors.accent}
        />

        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={12}
            onPress={() => setRevealed((v) => !v)}
          >
            <Feather name={revealed ? 'eye-off' : 'eye'} size={17} color={palette.icon} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.helper}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={palette.hint} style={styles.helper}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const LIGHT = {
  label: colors.textTertiary,
  rule: colors.hairlineStrong,
  ruleFocused: colors.accent,
  box: colors.hairlineStrong,
  boxFill: alpha(scale.ivoryLift, 0.7),
  text: colors.textPrimary,
  placeholder: colors.textTertiary,
  icon: colors.textTertiary,
  iconActive: colors.accent,
  hint: colors.textTertiary,
};

const DARK = {
  label: alpha(scale.ivory, 0.5),
  rule: colors.hairlineOnDark,
  ruleFocused: colors.accent,
  box: alpha(colors.accent, 0.42),
  // Barely-there fill: enough to lift the field off the marble without
  // flattening the stone behind it.
  boxFill: alpha(scale.emerald900, 0.28),
  text: colors.textOnDark,
  placeholder: alpha(scale.ivory, 0.55),
  icon: alpha(scale.ivory, 0.62),
  iconActive: colors.accent,
  hint: alpha(scale.ivory, 0.5),
};

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.lg,
  },
  rootBoxed: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    paddingBottom: spacing.sm,
    borderRadius: radius.none,
  },
  fieldBoxed: {
    height: 52,
    paddingBottom: 0,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 0,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
  },
  icon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    ...typeScale.bodyLg,
    paddingVertical: spacing.xs,
    // Android adds vertical padding that breaks the underline rhythm.
    paddingTop: spacing.xs,
    includeFontPadding: false,
  },
  helper: {
    marginTop: spacing.sm,
  },
});
