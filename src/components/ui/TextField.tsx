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
  label: string;
  error?: string | null;
  hint?: string;
  icon?: keyof typeof Feather.glyphMap;
  /** Renders the eye toggle and manages secure entry internally. */
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Ivory-on-emerald treatment for fields placed over dark surfaces. */
  onDark?: boolean;
}

/**
 * Underlined field. Deliberately not a filled box — the hairline rule keeps
 * auth screens feeling like stationery rather than a web form.
 */
export function TextField({
  label,
  error,
  hint,
  icon,
  secure = false,
  containerStyle,
  onDark = false,
  ...inputProps
}: Props) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const palette = onDark ? DARK : LIGHT;
  const ruleColor = error
    ? colors.danger
    : focused
      ? palette.ruleFocused
      : palette.rule;

  return (
    <View style={[styles.root, containerStyle]}>
      <Text
        variant="eyebrow"
        color={error ? colors.danger : palette.label}
        style={styles.label}
      >
        {label}
      </Text>

      <View style={[styles.field, { borderBottomColor: ruleColor }]}>
        {icon ? (
          <Feather
            name={icon}
            size={17}
            color={focused ? palette.iconActive : palette.icon}
            style={styles.icon}
          />
        ) : null}

        <TextInput
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
  text: colors.textOnDark,
  placeholder: alpha(scale.ivory, 0.38),
  icon: alpha(scale.ivory, 0.5),
  iconActive: colors.accent,
  hint: alpha(scale.ivory, 0.5),
};

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.lg,
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
