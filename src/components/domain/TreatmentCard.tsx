import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Marble } from '@/components/brand/Marble';
import { Badge, Card, Text } from '@/components/ui';
import { colors, elevation, radius, scaleWidth, spacing } from '@/theme';
import type { Treatment } from '@/types/models';
import { formatDuration } from '@/utils/date';
import { accentToMarble, CATEGORY_LABELS, formatCurrency } from '@/utils/format';

interface Props {
  treatment: Treatment;
  onPress?: () => void;
  /** Tall poster card for the signature carousel on the dashboard. */
  layout?: 'poster' | 'row';
}

/** Treatment card. Poster layout leads the home rails; row layout fills lists. */
export function TreatmentCard({ treatment, onPress, layout = 'row' }: Props) {
  if (layout === 'poster') return <PosterCard treatment={treatment} onPress={onPress} />;
  return <RowCard treatment={treatment} onPress={onPress} />;
}

function PosterCard({ treatment, onPress }: Props) {
  const marble = accentToMarble(treatment.accent);
  const dark = marble === 'emerald';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={treatment.name}
      onPress={onPress}
      style={({ pressed }) => [styles.poster, elevation.medium, pressed && styles.pressed]}
    >
      <Marble variant={marble} radius={radius.xl} style={styles.posterMarble}>
        <View style={styles.posterInner}>
          <View style={styles.posterTop}>
            <Badge
              label={CATEGORY_LABELS[treatment.category]}
              tone={dark ? 'onDark' : 'gold'}
            />
            {treatment.isSignature ? (
              <Feather name="award" size={16} color={colors.accent} />
            ) : null}
          </View>

          <View>
            <Text variant="h3" tone={dark ? 'onDark' : 'primary'} numberOfLines={2}>
              {treatment.name}
            </Text>
            <Text
              variant="caption"
              tone={dark ? 'onDarkMuted' : 'secondary'}
              numberOfLines={2}
              style={styles.posterTagline}
            >
              {treatment.tagline}
            </Text>

            <View style={styles.posterFooter}>
              <Text variant="label" tone={dark ? 'onDark' : 'primary'}>
                {formatCurrency(treatment.priceFrom, treatment.currency)}
              </Text>
              <Text variant="caption" tone={dark ? 'onDarkMuted' : 'tertiary'}>
                {formatDuration(treatment.durationMinutes)}
              </Text>
            </View>
          </View>
        </View>
      </Marble>
    </Pressable>
  );
}

function RowCard({ treatment, onPress }: Props) {
  return (
    <Card onPress={onPress} style={styles.row} padded="base">
      <View style={styles.rowInner}>
        <Marble
          variant={accentToMarble(treatment.accent)}
          radius={radius.md}
          style={styles.rowThumb}
        />

        <View style={styles.rowBody}>
          <View style={styles.rowHeader}>
            <Text variant="h4" numberOfLines={1} style={styles.rowTitle}>
              {treatment.name}
            </Text>
            {treatment.isSignature ? (
              <Feather name="award" size={14} color={colors.accent} />
            ) : null}
          </View>

          <Text variant="caption" tone="secondary" numberOfLines={2} style={styles.rowTagline}>
            {treatment.tagline}
          </Text>

          <View style={styles.rowFooter}>
            <Text variant="label" tone="primary">
              {formatCurrency(treatment.priceFrom, treatment.currency)}
            </Text>
            <View style={styles.rowDot} />
            <Text variant="caption" tone="tertiary">
              {formatDuration(treatment.durationMinutes)}
            </Text>
            <View style={styles.rowDot} />
            <Feather name="star" size={11} color={colors.accent} />
            <Text variant="caption" tone="tertiary" style={styles.rating}>
              {treatment.rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const POSTER_WIDTH = scaleWidth(212);

const styles = StyleSheet.create({
  poster: {
    width: POSTER_WIDTH,
    height: scaleWidth(268),
    borderRadius: radius.xl,
    marginRight: spacing.md,
  },
  posterMarble: {
    flex: 1,
  },
  posterInner: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  posterTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  posterTagline: {
    marginTop: spacing.sm,
  },
  posterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.base,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  row: {
    marginBottom: spacing.md,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowThumb: {
    width: 62,
    height: 62,
    marginRight: spacing.base,
  },
  rowBody: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowTitle: {
    flexShrink: 1,
  },
  rowTagline: {
    marginTop: spacing.xs,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md - 2,
  },
  rowDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.hairlineStrong,
    marginHorizontal: spacing.sm,
  },
  rating: {
    marginLeft: spacing.xs,
  },
});
