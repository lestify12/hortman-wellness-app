import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import { Avatar, Badge, Card, Divider, Text } from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services';
import { alpha, colors, gutter, radius, scale, spacing, tabScrollInset } from '@/theme';
import { formatDate } from '@/utils/date';
import { formatPoints } from '@/utils/format';

interface Row {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  detail?: string;
  onPress?: () => void;
}

/** Profile — identity header, membership summary, and settings groups. */
export default function ProfileRoute() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const membership = useAsyncData(
    () => api.membership.getState(user?.id ?? ''),
    [user?.id],
  );

  const confirmSignOut = useCallback(() => {
    Alert.alert('Sign out of Velora?', 'You can sign back in at any time.', [
      { text: 'Stay signed in', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/sign-in');
        },
      },
    ]);
  }, [signOut, router]);

  if (!user) return null;

  const careRows: Row[] = [
    {
      icon: 'trending-up',
      label: 'My journey',
      detail: 'Timeline and results',
      onPress: () => router.push('/(tabs)/journey'),
    },
    {
      icon: 'calendar',
      label: 'Appointments',
      detail: 'Upcoming and past',
      onPress: () => router.push('/(tabs)/appointments'),
    },
    {
      icon: 'message-circle',
      label: 'Messages',
      detail: 'Physicians and concierge',
      onPress: () => router.push('/messages'),
    },
    {
      icon: 'users',
      label: 'My physicians',
      onPress: () => router.push('/doctors'),
    },
  ];

  const accountRows: Row[] = [
    { icon: 'user', label: 'Personal details', detail: user.email },
    { icon: 'bell', label: 'Notifications' },
    { icon: 'lock', label: 'Privacy and security' },
    { icon: 'credit-card', label: 'Payment methods' },
    { icon: 'globe', label: 'Language', detail: 'English' },
  ];

  const supportRows: Row[] = [
    { icon: 'help-circle', label: 'Help centre' },
    { icon: 'file-text', label: 'Member terms' },
    { icon: 'shield', label: 'Privacy notice' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Identity header */}
        <Marble variant="emerald" style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroInner}>
              <Avatar
                initials={user.initials}
                uri={user.avatarUrl}
                size={84}
                tone="onDark"
                ring
              />
              <Text variant="h1" tone="onDark" align="center" style={styles.name}>
                {user.firstName} {user.lastName}
              </Text>
              <Text variant="caption" tone="onDarkMuted" align="center">
                Member since {formatDate(user.memberSince, 'medium')}
              </Text>

              <Badge
                label={`${user.membershipTier.toUpperCase()} MEMBER`}
                tone="onDark"
                style={styles.tierBadge}
              />
            </View>
          </SafeAreaView>
        </Marble>

        <View style={styles.body}>
          {/* Membership summary */}
          <Card
            tone="surface"
            style={styles.membershipCard}
            onPress={() => router.push('/membership')}
          >
            <View style={styles.membershipRow}>
              <Stat label="Points" value={formatPoints(membership.data?.points ?? user.points)} />
              <View style={styles.vRule} />
              <Stat
                label="Perks used"
                value={
                  membership.data
                    ? `${membership.data.perksUsed}/${membership.data.perksTotal}`
                    : '—'
                }
              />
              <View style={styles.vRule} />
              <Stat
                label="Renews"
                value={membership.data ? formatDate(membership.data.renewsAt, 'short') : '—'}
              />
            </View>

            <Divider style={styles.membershipDivider} />

            <View style={styles.membershipAction}>
              <Text variant="label" tone="gold">
                Manage membership
              </Text>
              <Feather name="arrow-up-right" size={15} color={colors.textGold} />
            </View>
          </Card>

          {/* Concerns */}
          {user.concerns.length > 0 ? (
            <Card tone="muted" style={styles.concerns}>
              <Text variant="eyebrow" tone="gold">
                Your focus
              </Text>
              <View style={styles.concernList}>
                {user.concerns.map((concern) => (
                  <View key={concern} style={styles.concernChip}>
                    <Text variant="caption" tone="primary">
                      {concern}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          <RowGroup title="Care" rows={careRows} />
          <RowGroup title="Account" rows={accountRows} />
          <RowGroup title="Support" rows={supportRows} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          >
            <Feather name="log-out" size={16} color={colors.danger} />
            <Text variant="label" color={colors.danger} style={styles.signOutLabel}>
              Sign out
            </Text>
          </Pressable>

          <Text variant="caption" tone="tertiary" align="center" style={styles.version}>
            Velora Clinics · Version 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="h3" tone="primary" align="center">
        {value}
      </Text>
      <Text variant="caption" tone="tertiary" align="center" style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function RowGroup({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <View style={styles.group}>
      <Text variant="eyebrow" tone="tertiary" style={styles.groupTitle}>
        {title}
      </Text>

      <Card tone="surface" padded={false}>
        {rows.map((row, i) => (
          <Pressable
            key={row.label}
            accessibilityRole="button"
            accessibilityLabel={row.label}
            onPress={row.onPress}
            disabled={!row.onPress}
            style={({ pressed }) => [styles.row, pressed && row.onPress ? styles.pressed : null]}
          >
            <View style={styles.rowIcon}>
              <Feather name={row.icon} size={17} color={scale.emerald600} />
            </View>

            <View style={styles.rowText}>
              <Text variant="body" tone="primary">
                {row.label}
              </Text>
              {row.detail ? (
                <Text variant="caption" tone="tertiary" numberOfLines={1} style={styles.rowDetail}>
                  {row.detail}
                </Text>
              ) : null}
            </View>

            <Feather name="chevron-right" size={17} color={colors.textTertiary} />

            {i < rows.length - 1 ? <View style={styles.rowRule} /> : null}
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scrollContent: {
    paddingBottom: tabScrollInset,
  },
  hero: {
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroInner: {
    alignItems: 'center',
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  name: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  tierBadge: {
    marginTop: spacing.base,
  },
  body: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
  },
  membershipCard: {
    marginBottom: spacing.lg,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    marginTop: spacing.xs,
  },
  vRule: {
    width: StyleSheet.hairlineWidth,
    height: 34,
    backgroundColor: colors.hairline,
  },
  membershipDivider: {
    marginVertical: spacing.lg,
  },
  membershipAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  concerns: {
    marginBottom: spacing.lg,
  },
  concernList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  concernChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.pill,
    backgroundColor: alpha(scale.ivory, 0.85),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  group: {
    marginTop: spacing.xl,
  },
  groupTitle: {
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(scale.emerald600, 0.07),
    marginRight: spacing.base,
  },
  rowText: {
    flex: 1,
  },
  rowDetail: {
    marginTop: 1,
  },
  rowRule: {
    position: 'absolute',
    left: spacing.lg + 34 + spacing.base,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xxl,
    paddingVertical: spacing.base,
  },
  signOutLabel: {
    marginLeft: spacing.sm,
  },
  version: {
    marginTop: spacing.lg,
  },
  pressed: {
    opacity: 0.6,
  },
});
