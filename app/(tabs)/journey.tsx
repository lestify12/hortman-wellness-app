import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { JourneyTimelineItem, PackageProgressCard } from '@/components/domain';
import {
  Card,
  Chip,
  ChipRow,
  Divider,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressRing,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services';
import { colors, gutter, spacing, tabScrollInset } from '@/theme';
import type { JourneyEventType } from '@/types/models';
import { formatDate } from '@/utils/date';

type Filter = 'all' | JourneyEventType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'treatment', label: 'Treatments' },
  { key: 'milestone', label: 'Milestones' },
  { key: 'measurement', label: 'Measurements' },
  { key: 'consultation', label: 'Consultations' },
];

/**
 * My Journey.
 *
 * A progress ring summarising active courses, a stat band, and a filtered
 * chronological timeline of everything that has happened at Velora.
 */
export default function JourneyRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [filter, setFilter] = useState<Filter>('all');

  const journey = useAsyncData(
    async () => {
      const [events, stats, packages] = await Promise.all([
        api.journey.listEvents(userId),
        api.journey.listStats(userId),
        api.packages.listForUser(userId),
      ]);
      return { events, stats, packages };
    },
    [userId],
  );

  const visibleEvents = useMemo(() => {
    if (!journey.data) return [];
    if (filter === 'all') return journey.data.events;
    return journey.data.events.filter((e) => e.type === filter);
  }, [journey.data, filter]);

  const activePackages = useMemo(
    () => journey.data?.packages.filter((p) => p.status === 'active') ?? [],
    [journey.data],
  );

  const overallProgress = useMemo(() => {
    if (activePackages.length === 0) return 0;
    const completed = activePackages.reduce((sum, p) => sum + p.completedSessions, 0);
    const total = activePackages.reduce((sum, p) => sum + p.totalSessions, 0);
    return total === 0 ? 0 : completed / total;
  }, [activePackages]);

  const onRefresh = useCallback(() => void journey.reload(true), [journey]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={journey.refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.header}>
            <Text variant="eyebrow" tone="gold">
              My journey
            </Text>
            <Text variant="display" style={styles.title}>
              Every step, recorded
            </Text>
            {user ? (
              <Text variant="bodySm" tone="secondary" style={styles.since}>
                A member since {formatDate(user.memberSince, 'medium')}
              </Text>
            ) : null}
          </View>

          {journey.loading ? (
            <LoadingState label="Gathering your history" />
          ) : journey.error ? (
            <View style={styles.body}>
              <ErrorState message={journey.error.message} onRetry={() => void journey.reload()} />
            </View>
          ) : (
            <>
              {/* Progress summary */}
              <View style={styles.body}>
                <Card tone="surface" padded="xl">
                  <View style={styles.summary}>
                    <ProgressRing
                      value={overallProgress}
                      size={118}
                      caption={`${Math.round(overallProgress * 100)}%`}
                      label="Courses"
                    />

                    <View style={styles.summaryStats}>
                      {journey.data?.stats.slice(0, 3).map((stat, i) => (
                        <View key={stat.label}>
                          {i > 0 ? <Divider style={styles.statDivider} /> : null}
                          <View style={styles.statRow}>
                            <View style={styles.statText}>
                              <Text variant="label" tone="primary">
                                {stat.label}
                              </Text>
                              {stat.caption ? (
                                <Text variant="caption" tone="tertiary">
                                  {stat.caption}
                                </Text>
                              ) : null}
                            </View>
                            <Text variant="h3" tone="gold">
                              {stat.value}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </Card>
              </View>

              {/* Active courses */}
              {activePackages.length > 0 ? (
                <View style={[styles.body, styles.section]}>
                  <SectionHeader eyebrow="In progress" title="Active courses" />
                  {activePackages.map((pkg) => (
                    <PackageProgressCard
                      key={pkg.id}
                      pkg={pkg}
                      onPress={() => router.push(`/packages/${pkg.id}`)}
                    />
                  ))}
                </View>
              ) : null}

              {/* Timeline */}
              <View style={[styles.body, styles.section]}>
                <SectionHeader eyebrow="History" title="Your timeline" />
              </View>

              <View style={styles.filters}>
                <ChipRow>
                  {FILTERS.map((f) => (
                    <Chip
                      key={f.key}
                      label={f.label}
                      selected={filter === f.key}
                      onPress={() => setFilter(f.key)}
                    />
                  ))}
                </ChipRow>
              </View>

              <View style={styles.body}>
                {visibleEvents.length === 0 ? (
                  <EmptyState
                    icon="clock"
                    title="Nothing here yet"
                    body="Entries of this kind will appear as your journey continues."
                    actionLabel="Show everything"
                    onAction={() => setFilter('all')}
                  />
                ) : (
                  visibleEvents.map((event, i) => (
                    <JourneyTimelineItem
                      key={event.id}
                      event={event}
                      isLast={i === visibleEvents.length - 1}
                    />
                  ))
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: tabScrollInset,
  },
  header: {
    paddingHorizontal: gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
  },
  since: {
    marginTop: spacing.md,
  },
  body: {
    paddingHorizontal: gutter,
  },
  section: {
    marginTop: spacing.xxl,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStats: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  statText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  statDivider: {
    marginVertical: spacing.xs,
  },
  filters: {
    paddingHorizontal: gutter,
    marginBottom: spacing.lg,
  },
});
