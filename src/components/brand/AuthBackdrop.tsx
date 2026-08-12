import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

import { images } from '@/constants/images';
import { colors } from '@/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Full-bleed marble backdrop for the authentication screens: ivory marble
 * above a gold curve, emerald marble below.
 *
 * Uses an absolutely-filled `Image` rather than `ImageBackground`. The latter
 * sizes itself to the artwork's intrinsic dimensions (853×1844 here) instead of
 * honouring `flex: 1`, which stretches the whole screen to the image's height
 * and drags the curve far below where the layout expects it. Absolute fill
 * takes its box from the parent and lets `cover` crop, which behaves the same
 * on iOS, Android and web.
 */
export function AuthBackdrop({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <Image
        source={images.backgrounds.login}
        style={styles.image}
        resizeMode="cover"
        // Decorative: the lockup above it already names the brand.
        accessible={false}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    ...StyleSheet.absoluteFillObject,
    // Absolute insets alone are not enough: an Image with no explicit size
    // falls back to the artwork's intrinsic dimensions (853×1844), which
    // stretches the backdrop far past the viewport. Pinning both axes to the
    // parent keeps `cover` cropping against the screen on every platform.
    width: '100%',
    height: '100%',
  },
  root: {
    flex: 1,
    // Shows through only in the instant before the artwork decodes, and behind
    // the status bar on aspect ratios where `cover` cannot reach the edges.
    backgroundColor: colors.surfaceInverse,
  },
});
