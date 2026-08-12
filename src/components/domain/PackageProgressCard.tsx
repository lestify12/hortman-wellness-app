import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, ProgressBar, StepDots, Text } from '@/components/ui';
import { spacing } from '@/theme';
import type { TreatmentPackage } from '@/types/models';
import { formatDate } from '@/utils/date';

interface Props {
  pkg: TreatmentPackage;
  onPress?: () => void;
}

/** Course-of-treatment card: sessions remaining, pips, and a progress rule. */
export function PackageProgressCard({ pkg, onPress }: Props) {
  const progress = pkg.totalSessions > 0 ? pkg.completedSessions / pkg.totalSessions : 0;
  const remaining = pkg.totalSessions - pkg.completedSessions;
  const scheduledIndex = pkg.sessions.findIndex((s) => !s.completedAt && s.scheduledAt);

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="h4" numberOfLines={2}>
            {pkg.name}
          </Text>
          <Text variant="caption" tone="secondary" style={styles.doctor}>
            {pkg.doctorName}
          </Text>
        </View>

        <Badge
          label={pkg.status === 'active' ? `${remaining} left` : 'Complete'}
          tone={pkg.status === 'active' ? 'gold' : 'success'}
        />
      </View>

      <View style={styles.progressBlock}>
        <View style={styles.progressLabels}>
          <Text variant="label" tone="primary">
            {pkg.completedSessions} of {pkg.totalSessions} sessions
          </Text>
          <Text variant="caption" tone="tertiary">
            {Math.round(progress * 100)}%
          </Text>
        </View>

        <ProgressBar
          value={progress}
          tone={pkg.status === 'completed' ? 'emerald' : 'gold'}
          style={styles.bar}
        />

        <StepDots
          total={pkg.totalSessions}
          completed={pkg.completedSessions}
          scheduledIndex={scheduledIndex >= 0 ? scheduledIndex : undefined}
          style={styles.dots}
        />
      </View>

      <Text variant="caption" tone="tertiary">
        {pkg.status === 'active'
          ? `Valid until ${formatDate(pkg.expiresAt)}`
          : `Completed ${formatDate(pkg.expiresAt)}`}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  doctor: {
    marginTop: spacing.xs,
  },
  progressBlock: {
    marginVertical: spacing.lg,
  },
  progressLabels: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md - 2,
  },
  bar: {
    marginBottom: spacing.md,
  },
  dots: {
    marginTop: spacing.xxs,
  },
});
