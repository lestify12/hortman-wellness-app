import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import { VeloraWordmark } from '@/components/brand/VeloraWordmark';
import {
  AppointmentCard,
  DoctorCard,
  PackageProgressCard,
  TreatmentCard,
} from '@/components/domain';
import {
  Avatar,
  Badge,
  Card,
  Divider,
  EmptyState,
  IconButton,
  LoadingState,
  ProgressBar,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services';
import {
  alpha,
  colors,
  gutter,
  radius,
  scale,
  scaleWidth,
  spacing,
  tabScrollInset,
} from '@/theme';
import { formatRelative, greetingForNow } from '@/utils/date';
import { formatPoints } from '@/utils/format';

/**
 * Home dashboard.
 *
 * Composition: emerald marble hero (greeting + membership pulse), the next
 * appointment, active courses, signature treatments rail, physicians rail, and
 * a concierge prompt. Everything is fetched through the repository layer.
 */
export default function HomeRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const dashboard = useAsyncData(
    async () => {
      const [appointments, packages, signature, doctors, membership, threads] = await Promise.all([
        api.appointments.listForUser(userId),
        api.packages.listForUser(userId),
        api.treatments.listSignature(),
        api.doctors.list(),
        api.membership.getState(userId),
        api.messages.listThreads(userId),
      ]);
      return { appointments, packages, signature, doctors, membership, threads };
    },
    [userId],
  );

  const nextAppointment = useMemo(
    () =>
      dashboard.data?.appointments.find(
        (a) => a.status === 'upcoming' && new Date(a.startsAt).getTime() > Date.now(),
      ) ?? null,
    [dashboard.data],
  );

  const activePackages = useMemo(
    () => dashboard.data?.packages.filter((p) => p.status === 'active') ?? [],
    [dashboard.data],
  );

  const unreadCount = useMemo(
    () => dashboard.data?.threads.reduce((sum, t) => sum + t.unreadCount, 0) ?? 0,
    [dashboard.data],
  );

  const onRefresh = useCallback(() => void dashboard.reload(true), [dashboard]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={dashboard.refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* ------------------------------------------------------- hero */}
        <Marble variant="emerald" style={styles.hero} intensity={1.05}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroInner}>
              <View style={styles.heroTop}>
                <VeloraWordmark size={13} tone="ivory" align="left" showTagline={false} />

                <View style={styles.heroActions}>
                  <IconButton
                    icon="message-circle"
                    tone="onDark"
                    size={40}
                    accessibilityLabel="Messages"
                    badgeCount={unreadCount}
                    onPress={() => router.push('/messages')}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open your profile"
                    onPress={() => router.push('/(tabs)/profile')}
                  >
                    <Avatar
                      initials={user?.initials ?? 'V'}
                      uri={user?.avatarUrl}
                      size={40}
                      tone="onDark"
                      ring
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.greeting}>
                <Text variant="eyebrow" tone="onDarkMuted">
                  {greetingForNow()}
                </Text>
                <Text variant="display" tone="onDark" style={styles.greetingName}>
                  {user?.firstName ?? 'Welcome'}
                </Text>
              </View>

              {/* Membership pulse — points, tier, renewal. */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View your membership"
                onPress={() => router.push('/membership')}
                style={({ pressed }) => [styles.pulse, pressed && styles.pressed]}
              >
                <View style={styles.pulseRow}>
                  <View>
                    <Text variant="eyebrow" tone="onDarkMuted">
                      {(user?.membershipTier ?? 'essence').toUpperCase()} MEMBER
                    </Text>
                    <View style={styles.pointsRow}>
                      <Text variant="h2" tone="onDark">
                        {formatPoints(dashboard.data?.membership.points ?? user?.points ?? 0)}
                      </Text>
                      <Text variant="caption" tone="onDarkMuted" style={styles.pointsLabel}>
                        points
                      </Text>
                    </View>
                  </View>

                  <Feather name="chevron-right" size={20} color={colors.textOnDarkMuted} />
                </View>

                {dashboard.data ? (
                  <>
                    <ProgressBar
                      value={
                        dashboard.data.membership.points /
                        (dashboard.data.membership.points +
                          dashboard.data.membership.pointsToNextTier)
                      }
                      tone="onDark"
                      style={styles.pulseBar}
                    />
                    <Text variant="caption" tone="onDarkMuted">
                      {formatPoints(dashboard.data.membership.pointsToNextTier)} points to your next
                      tier
                    </Text>
                  </>
                ) : null}
              </Pressable>
            </View>
          </SafeAreaView>
        </Marble>

        {/* ----------------------------------------------------- content */}
        <View style={styles.body}>
          {dashboard.loading ? (
            <LoadingState label="Preparing your dashboard" />
          ) : (
            <>
              {/* Quick actions */}
              <View style={styles.quickRow}>
                <QuickAction
                  icon="calendar"
                  label="Book"
                  onPress={() => router.push('/appointments/book')}
                />
                <QuickAction
                  icon="feather"
                  label="Treatments"
                  onPress={() => router.push('/(tabs)/treatments')}
                />
                <QuickAction
                  icon="users"
                  label="Doctors"
                  onPress={() => router.push('/doctors')}
                />
                <QuickAction
                  icon="award"
                  label="Membership"
                  onPress={() => router.push('/membership')}
                />
              </View>

              {/* Next appointment */}
              <View style={styles.section}>
                <SectionHeader
                  eyebrow="Coming up"
                  title="Your next visit"
                  actionLabel="All"
                  onAction={() => router.push('/(tabs)/appointments')}
                />

                {nextAppointment ? (
                  <AppointmentCard
                    appointment={nextAppointment}
                    featured
                    onPress={() => router.push('/(tabs)/appointments')}
                  />
                ) : (
                  <Card tone="muted">
                    <EmptyState
                      icon="calendar"
                      title="Nothing booked yet"
                      body="Your calendar is clear. Shall we arrange your next ritual?"
                      actionLabel="Book an appointment"
                      onAction={() => router.push('/appointments/book')}
                    />
                  </Card>
                )}
              </View>

              {/* Active courses */}
              {activePackages.length > 0 ? (
                <View style={styles.section}>
                  <SectionHeader
                    eyebrow="In progress"
                    title="Your courses"
                    actionLabel="Journey"
                    onAction={() => router.push('/(tabs)/journey')}
                  />
                  {activePackages.map((pkg) => (
                    <PackageProgressCard
                      key={pkg.id}
                      pkg={pkg}
                      onPress={() => router.push(`/packages/${pkg.id}`)}
                    />
                  ))}
                </View>
              ) : null}

              {/* Signature treatments */}
              <View style={styles.section}>
                <SectionHeader
                  eyebrow="Curated for you"
                  title="Signature rituals"
                  actionLabel="Explore"
                  onAction={() => router.push('/(tabs)/treatments')}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.rail}
                  contentContainerStyle={styles.railContent}
                >
                  {dashboard.data?.signature.map((treatment) => (
                    <TreatmentCard
                      key={treatment.id}
                      treatment={treatment}
                      layout="poster"
                      onPress={() => router.push(`/treatments/${treatment.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Physicians */}
              <View style={styles.section}>
                <SectionHeader
                  eyebrow="Your team"
                  title="Physicians"
                  actionLabel="All"
                  onAction={() => router.push('/doctors')}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.rail}
                  contentContainerStyle={styles.railContent}
                >
                  {dashboard.data?.doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={doctor}
                      layout="tile"
                      onPress={() => router.push(`/doctors/${doctor.id}`)}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Concierge */}
              <Card tone="muted" style={styles.concierge} onPress={() => router.push('/messages')}>
                <Divider ornament />
                <Text variant="h3" align="center" style={styles.conciergeTitle}>
                  Anything at all
                </Text>
                <Text variant="bodySm" tone="secondary" align="center">
                  Your concierge is available around the clock — bookings, travel, or a question for
                  your physician.
                </Text>
                <View style={styles.conciergeAction}>
                  <Badge label="Message the concierge" tone="gold" />
                </View>
              </Card>

              {nextAppointment ? (
                <Text variant="caption" tone="tertiary" align="center" style={styles.footNote}>
                  Next visit {formatRelative(nextAppointment.startsAt).toLowerCase()} ·{' '}
                  {nextAppointment.clinicName}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <View style={styles.quickDisc}>
        <Feather name={icon} size={19} color={scale.emerald600} />
      </View>
      <Text variant="caption" tone="secondary" align="center">
        {label}
      </Text>
    </Pressable>
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
    paddingHorizontal: gutter,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greeting: {
    marginTop: spacing.xxl,
  },
  greetingName: {
    marginTop: spacing.sm,
  },
  pulse: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: alpha(scale.ivory, 0.07),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairlineOnDark,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  pointsLabel: {
    marginLeft: spacing.sm,
  },
  pulseBar: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  body: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickDisc: {
    width: scaleWidth(52),
    height: scaleWidth(52),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  rail: {
    marginHorizontal: -gutter,
  },
  railContent: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.xs,
  },
  concierge: {
    marginBottom: spacing.lg,
  },
  conciergeTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  conciergeAction: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footNote: {
    marginTop: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
