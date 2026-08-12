import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useAuth } from '@/providers/AuthProvider';
import { colors } from '@/theme';

/** Auth group. Signed-in members are bounced straight to the dashboard. */
export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'authenticated') return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
