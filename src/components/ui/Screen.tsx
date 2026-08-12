import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors, contentMaxWidth, gutter, screen, spacing } from '@/theme';
import { MarbleBackdrop, type MarbleVariant } from '../brand/Marble';

interface Props {
  children: React.ReactNode;
  /** Adds the vector marble wash behind the content. */
  marble?: MarbleVariant | false;
  marbleIntensity?: number;
  /** Emerald screens need light status-bar content and ivory text. */
  dark?: boolean;
  scroll?: boolean;
  edges?: readonly Edge[];
  /** Applies the standard horizontal gutter. Off for full-bleed lists. */
  gutters?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
}

/**
 * Screen shell.
 *
 * Owns safe areas, the optional marble backdrop, the horizontal gutter and the
 * tablet max-width column, so no screen re-implements any of it.
 */
export function Screen({
  children,
  marble = false,
  marbleIntensity = 1,
  dark = false,
  scroll = false,
  edges = ['top'],
  gutters = true,
  style,
  contentContainerStyle,
  scrollProps,
}: Props) {
  const body = (
    <View style={[styles.column, gutters && { paddingHorizontal: gutter }]}>{children}</View>
  );

  return (
    <View style={[styles.root, { backgroundColor: dark ? colors.surfaceInverse : colors.canvas }, style]}>
      {marble ? <MarbleBackdrop variant={marble} intensity={marbleIntensity} /> : null}

      <SafeAreaView style={styles.safe} edges={edges}>
        {scroll ? (
          <ScrollView
            {...scrollProps}
            style={styles.flex}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {body}
          </ScrollView>
        ) : (
          <View style={[styles.flex, contentContainerStyle]}>{body}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.giant,
    flexGrow: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: screen.isTablet ? contentMaxWidth : undefined,
    alignSelf: 'center',
  },
});
