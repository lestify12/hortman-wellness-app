import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useVeloraFonts } from '@/hooks/useVeloraFonts';
import { AuthProvider } from '@/providers/AuthProvider';
import { colors } from '@/theme';

// Hold the native splash until the brand splash is ready to take over, so the
// handoff reads as one continuous emerald surface.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { fontsLoaded, fontError } = useVeloraFonts();

  useEffect(() => {
    // Proceeding on font error is deliberate: the type falls back to the
    // platform serif rather than trapping the member on a blank screen.
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.canvas },
              animation: 'fade',
              animationDuration: 260,
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="treatments/[id]"
              options={{ animation: 'slide_from_right', presentation: 'card' }}
            />
            <Stack.Screen name="doctors/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="packages/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="messages/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="messages/[id]" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="doctors/index" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="membership" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen
              name="appointments/book"
              options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
            />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
