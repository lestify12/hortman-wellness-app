import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { images } from '@/constants/images';
import { colors } from '@/theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Full-bleed marble backdrop for the authentication screens: ivory marble
 * above a gold curve, emerald marble below.
 *
 * Two things this deliberately does NOT do, both learned the hard way:
 *
 * 1. It does not use `ImageBackground`, and it pins the image's width and
 *    height rather than relying on absolute insets alone. An Image with no
 *    explicit size falls back to the artwork's intrinsic dimensions, which
 *    stretches the backdrop past the viewport and drags the gold curve far
 *    below where the layout expects it.
 *
 * 2. It does not wrap the content in a KeyboardAvoidingView. That squeezes the
 *    layout while the artwork stays put, so the form rides up across the gold
 *    curve and ivory text lands on ivory marble. Instead the artwork lives
 *    *inside* the scrollable page and the page holds a fixed minimum height, so
 *    opening the keyboard scrolls stone and content together and the form stays
 *    on the emerald half.
 */
export function AuthBackdrop({ children, style }: Props) {
  // Captured once. On Android the keyboard resizes the window, so reading this
  // live would shrink the page and reintroduce the problem above. The app is
  // portrait-locked, so this cannot go stale from rotation.
  const [pageHeight] = useState(() => Dimensions.get('window').height);

  return (
    <View style={[styles.root, style]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        // Keeps the focused field above the keyboard on iOS without moving the
        // artwork relative to the form.
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        bounces={false}
      >
        <View style={[styles.page, { minHeight: pageHeight }]}>
          <Image
            source={images.backgrounds.login}
            style={styles.image}
            resizeMode="cover"
            // No cross-fade: the artwork is the screen, and fading it in reads
            // as the page loading late.
            fadeDuration={0}
            // Decorative: the lockup above it already names the brand.
            accessible={false}
          />
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Shows through only in the instant before the artwork decodes, and behind
    // the status bar on aspect ratios where `cover` cannot reach the edges.
    backgroundColor: colors.surfaceInverse,
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
});
