import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import {
  Badge,
  Button,
  Card,
  Divider,
  ErrorState,
  IconButton,
  LoadingState,
  ProgressRing,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { api } from '@/services';
import { alpha, colors, gutter, radius, scale, spacing } from '@/theme';
import type { PackageSession } from '@/types/models';
import { formatDate, formatTime } from '@/utils/date';
import { accentToMarble } from '@/utils/format';

/**
 * Package / treatment progress.
 *
 * The hero carries a progress ring over marble; below it, a per-session
 * timeline showing what is done, what is booked and what remains.
 */
export default function PackageDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const detail = useAsyncData(async () => {
    const pkg = await api.packages.getById(id);
    if (!pkg) return null;
    const treatment = await api.treatments.getById(pkg.treatmentId);
    return { pkg, treatment };
  }, [id]);

  if (detail.loading) {
    return (
      <View style={styles.stateRoot}>
        <LoadingState label="Loading your course" />
      </View>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <View style={styles.stateRoot}>
        <ErrorState message="We could not find that course." onRetry={() => void detail.reload()} />
      </View>
    );
  }

  const { pkg, treatment } = detail.data;
  const progress = pkg.totalSessions > 0 ? pkg.completedSessions / pkg.totalSessions : 0;
  const remaining = pkg.totalSessions - pkg.completedSessions;
  const nextSession = pkg.sessions.find((s) => !s.completedAt);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Marble variant="emerald" style={styles.hero} intensity={1.05}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroBar}>
              <IconButton
                icon="chevron-left"
                tone="onDark"
                size={40}
                accessibilityLabel="Go back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/journey'))}
              />
              <Badge
                label={pkg.status === 'active' ? 'In progress' : 'Complete'}
                tone="onDark"
              />
            </View>

            <View style={styles.heroInner}>
              <ProgressRing
                value={progress}
                size={162}
                strokeWidth={7}
                tone="onDark"
                caption={`${pkg.completedSessions}/${pkg.totalSessions}`}
                label="Sessions"
              />

              <Text variant="h1" tone="onDark" align="center" style={styles.heroTitle}>
                {pkg.name}
              </Text>
              <Text variant="caption" tone="onDarkMuted" align="center">
                {pkg.doctorName}
              </Text>
            </View>
          </SafeAreaView>
        </Marble>

        <View style={styles.body}>
          {/* Summary */}
          <Card tone="surface" style={styles.summary}>
            <View style={styles.summaryRow}>
              <Summary value={`${remaining}`} label="Remaining" />
              <View style={styles.vRule} />
              <Summary value={`${Math.round(progress * 100)}%`} label="Complete" />
              <View style={styles.vRule} />
              <Summary value={formatDate(pkg.expiresAt, 'short')} label="Valid until" />
            </View>

            {nextSession?.scheduledAt ? (
              <>
                <Divider style={styles.summaryDivider} />
                <View style={styles.nextRow}>
                  <Feather name="calendar" size={15} color={colors.accent} />
                  <Text variant="bodySm" tone="primary" style={styles.nextText}>
                    Session {nextSession.index} on {formatDate(nextSession.scheduledAt)} at{' '}
                    {formatTime(nextSession.scheduledAt)}
                  </Text>
                </View>
              </>
            ) : null}
          </Card>

          {/* Session timeline */}
          <View style={styles.section}>
            <SectionHeader eyebrow="Session by session" title="Your progress" />

            <Card tone="muted" padded="lg">
              {pkg.sessions.map((session, i) => (
                <SessionRow
                  key={session.index}
                  session={session}
                  isLast={i === pkg.sessions.length - 1}
                />
              ))}
            </Card>
          </View>

          {/* Related treatment */}
          {treatment ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="The protocol" title={treatment.name} />
              <Card
                tone="surface"
                onPress={() => router.push(`/treatments/${treatment.id}`)}
                padded="base"
              >
                <View style={styles.treatmentRow}>
                  <Marble
                    variant={accentToMarble(treatment.accent)}
                    radius={radius.md}
                    style={styles.treatmentThumb}
                  />
                  <View style={styles.treatmentBody}>
                    <Text variant="bodySm" tone="secondary" numberOfLines={3}>
                      {treatment.tagline}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.textTertiary} />
                </View>
              </Card>
            </View>
          ) : null}

          {pkg.status === 'active' ? (
            <Button
              label={remaining > 0 ? 'Book your next session' : 'Renew this course'}
              icon="arrow-right"
              size="lg"
              style={styles.action}
              onPress={() => router.push('/appointments/book')}
            />
          ) : (
            <Button
              label="Repeat this course"
              icon="refresh-cw"
              variant="outline"
              size="lg"
              style={styles.action}
              onPress={() => router.push('/appointments/book')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SessionRow({ session, isLast }: { session: PackageSession; isLast: boolean }) {
  const done = Boolean(session.completedAt);
  const booked = !done && Boolean(session.scheduledAt);

  return (
    <View style={styles.sessionRow}>
      <View style={styles.sessionRail}>
        <View
          style={[
            styles.sessionNode,
            done && styles.sessionNodeDone,
            booked && styles.sessionNodeBooked,
          ]}
        >
          {done ? (
            <Feather name="check" size={12} color={scale.emerald900} />
          ) : (
            <Text variant="caption" tone={booked ? 'gold' : 'tertiary'} style={styles.sessionIndex}>
              {session.index}
            </Text>
          )}
        </View>
        {!isLast ? <View style={styles.sessionConnector} /> : null}
      </View>

      <View style={styles.sessionBody}>
        <View style={styles.sessionHeader}>
          <Text variant="label" tone={done || booked ? 'primary' : 'tertiary'}>
            Session {session.index}
          </Text>
          {booked ? <Badge label="Booked" tone="gold" /> : null}
        </View>

        <Text variant="caption" tone="tertiary" style={styles.sessionMeta}>
          {done && session.completedAt
            ? `Completed ${formatDate(session.completedAt)}`
            : booked && session.scheduledAt
              ? `${formatDate(session.scheduledAt)} at ${formatTime(session.scheduledAt)}`
              : 'Not yet scheduled'}
        </Text>

        {session.note ? (
          <Text variant="bodySm" tone="secondary" style={styles.sessionNote}>
            {session.note}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text variant="h3" align="center">
        {value}
      </Text>
      <Text variant="caption" tone="tertiary" align="center" style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

const NODE = 26;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  stateRoot: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    paddingHorizontal: gutter,
  },
  scroll: {
    paddingBottom: spacing.giant,
  },
  hero: {
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingTop: spacing.sm,
  },
  heroInner: {
    alignItems: 'center',
    paddingHorizontal: gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  heroTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  body: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
  },
  summary: {
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    marginTop: spacing.xs,
  },
  vRule: {
    width: StyleSheet.hairlineWidth,
    height: 38,
    backgroundColor: colors.hairline,
  },
  summaryDivider: {
    marginVertical: spacing.lg,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  section: {
    marginTop: spacing.xxl,
  },
  sessionRow: {
    flexDirection: 'row',
  },
  sessionRail: {
    width: NODE,
    alignItems: 'center',
    marginRight: spacing.base,
  },
  sessionNode: {
    width: NODE,
    height: NODE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairlineStrong,
    backgroundColor: alpha(scale.ivory, 0.6),
  },
  sessionNodeDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sessionNodeBooked: {
    backgroundColor: colors.transparent,
    borderColor: colors.accent,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  sessionIndex: {
    fontSize: 11,
  },
  sessionConnector: {
    flex: 1,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairlineStrong,
    marginVertical: spacing.xs,
  },
  sessionBody: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: NODE,
  },
  sessionMeta: {
    marginTop: spacing.xxs,
  },
  sessionNote: {
    marginTop: spacing.sm,
  },
  treatmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treatmentThumb: {
    width: 54,
    height: 54,
    marginRight: spacing.base,
  },
  treatmentBody: {
    flex: 1,
    marginRight: spacing.md,
  },
  action: {
    marginTop: spacing.xxl,
  },
});
