import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useAuth } from '@/providers/AuthProvider';
import { colors, fontFamily, layout, radius, scale, spacing } from '@/theme';

type TabIconName = keyof typeof Feather.glyphMap;

interface TabDef {
  name: string;
  title: string;
  icon: TabIconName;
}

/**
 * The rail uses shorter words than the screens' own titles ("Appointments",
 * "Treatments") so five labels fit without truncation on compact handsets.
 */
const TABS: TabDef[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'journey', title: 'Journey', icon: 'trending-up' },
  { name: 'appointments', title: 'Visits', icon: 'calendar' },
  { name: 'treatments', title: 'Rituals', icon: 'feather' },
  { name: 'profile', title: 'Profile', icon: 'user' },
];

/**
 * Authenticated tab shell.
 *
 * The bar is a floating ivory rail with a hairline rule; the active tab is
 * marked by a gold pip above the icon rather than a filled glyph, which keeps
 * the thin-line icon language intact.
 *
 * The pip lives inside the fixed-size icon slot rather than above it:
 * react-navigation sizes that slot itself and renders two cross-fading copies
 * of it, so anything drawn outside its bounds escapes the bar.
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
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <TabIcon icon={tab.icon} focused={focused} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

function TabIcon({
  icon,
  focused,
  color,
}: {
  icon: TabIconName;
  focused: boolean;
  color: string;
}) {
  return (
    <View style={styles.iconWrap}>
      {focused ? <View style={styles.pip} /> : null}
      <Feather name={icon} size={20} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    bottom: Platform.select({ ios: spacing.xl, default: spacing.base }),
    height: layout.tabBarHeight,
    paddingTop: 0,
    paddingBottom: 0,
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
    height: layout.tabBarHeight,
    paddingHorizontal: spacing.xxs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    // Icon sits low in the slot so the pip has room at the top without
    // spilling past the slot's bounds.
    justifyContent: 'flex-end',
  },
  pip: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.2,
    marginTop: spacing.xs - 1,
    marginBottom: 0,
    includeFontPadding: false,
  },
});
