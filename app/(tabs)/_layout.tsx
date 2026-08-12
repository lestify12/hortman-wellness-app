import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { alpha, colors, fontFamily, radius, scale, spacing } from '@/theme';

type TabIconName = keyof typeof Feather.glyphMap;

/**
 * Authenticated tab shell.
 *
 * The bar is a floating ivory rail with a hairline rule; the active tab is
 * marked by a gold pip above the label rather than a filled icon, which keeps
 * the thin-line icon language intact.
 */
export default function TabsLayout() {
  const { status } = useAuth();

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.bar,
        tabBarItemStyle: styles.item,
        tabBarLabelStyle: styles.label,
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: 'Journey',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="trending-up" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="calendar" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="treatments"
        options={{
          title: 'Treatments',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="feather" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon name="user" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  focused,
  color,
}: {
  name: TabIconName;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={styles.iconWrap}>
      <View style={[styles.pip, focused && styles.pipActive]} />
      <Feather name={name} size={21} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    bottom: Platform.select({ ios: spacing.xl, default: spacing.base }),
    height: 72,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    shadowColor: scale.emerald900,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  item: {
    paddingTop: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: spacing.xs,
  },
  iconWrap: {
    alignItems: 'center',
  },
  pip: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm - 3,
    backgroundColor: alpha(colors.textPrimary, 0),
  },
  pipActive: {
    backgroundColor: colors.accent,
  },
});
