import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Card, Text } from '@/components/ui';
import { colors, radius, scaleWidth, spacing } from '@/theme';
import type { Doctor } from '@/types/models';

interface Props {
  doctor: Doctor;
  onPress?: () => void;
  /** Compact tile for the horizontal rail on the dashboard. */
  layout?: 'tile' | 'row';
}

/** Physician card — initials avatar with a gold rule, title, specialties. */
export function DoctorCard({ doctor, onPress, layout = 'row' }: Props) {
  if (layout === 'tile') {
    return (
      <Card onPress={onPress} style={styles.tile} padded="lg">
        <View style={styles.tileInner}>
          <Avatar initials={doctor.initials} uri={doctor.avatarUrl} size={62} ring />
          <Text variant="h4" align="center" numberOfLines={2} style={styles.tileName}>
            {doctor.name}
          </Text>
          <Text variant="caption" tone="secondary" align="center" numberOfLines={2}>
            {doctor.specialties[0]}
          </Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={11} color={colors.accent} />
            <Text variant="caption" tone="tertiary" style={styles.ratingValue}>
              {doctor.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={styles.row} padded="base">
      <View style={styles.rowInner}>
        <Avatar initials={doctor.initials} uri={doctor.avatarUrl} size={54} ring />

        <View style={styles.rowBody}>
          <Text variant="h4" numberOfLines={1}>
            {doctor.name}
          </Text>
          <Text variant="caption" tone="gold" numberOfLines={1} style={styles.rowTitle}>
            {doctor.title}
          </Text>

          <View style={styles.metaRow}>
            <Feather name="star" size={11} color={colors.accent} />
            <Text variant="caption" tone="tertiary" style={styles.ratingValue}>
              {doctor.rating.toFixed(1)} ({doctor.reviewCount})
            </Text>
            <View style={styles.dot} />
            <Text variant="caption" tone="tertiary" numberOfLines={1}>
              {doctor.yearsExperience} yrs
            </Text>
          </View>
        </View>

        <Feather name="chevron-right" size={18} color={colors.textTertiary} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: scaleWidth(158),
    marginRight: spacing.md,
  },
  tileInner: {
    alignItems: 'center',
  },
  tileName: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    marginBottom: spacing.md,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
    marginHorizontal: spacing.base,
  },
  rowTitle: {
    marginTop: spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md - 2,
  },
  ratingValue: {
    marginLeft: spacing.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.hairlineStrong,
    marginHorizontal: spacing.sm,
  },
});
