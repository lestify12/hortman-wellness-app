import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Button, Card, Divider, Text } from '@/components/ui';
import { colors, scale, spacing } from '@/theme';
import type { MembershipTier } from '@/types/models';
import { formatCurrency } from '@/utils/format';

interface Props {
  tier: MembershipTier;
  isCurrent: boolean;
  onSelect?: () => void;
  loading?: boolean;
}

/** Membership tier card. The featured tier inverts to emerald. */
export function MembershipTierCard({ tier, isCurrent, onSelect, loading = false }: Props) {
  const dark = tier.isFeatured;

  return (
    <Card tone={dark ? 'emerald' : 'surface'} style={styles.card} padded="xl">
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="eyebrow" tone={dark ? 'onDarkMuted' : 'gold'}>
            {tier.isFeatured ? 'Most chosen' : 'Membership'}
          </Text>
          <Text variant="h2" tone={dark ? 'onDark' : 'primary'} style={styles.name}>
            {tier.name}
          </Text>
        </View>

        {isCurrent ? (
          <Badge label="Your tier" tone={dark ? 'onDark' : 'gold'} />
        ) : null}
      </View>

      <Text variant="bodySm" tone={dark ? 'onDarkMuted' : 'secondary'} style={styles.tagline}>
        {tier.tagline}
      </Text>

      <View style={styles.priceRow}>
        <Text variant="metric" tone={dark ? 'onDark' : 'primary'}>
          {formatCurrency(tier.monthlyPrice, tier.currency)}
        </Text>
        <Text variant="caption" tone={dark ? 'onDarkMuted' : 'tertiary'} style={styles.period}>
          per month
        </Text>
      </View>

      <Divider dark={dark} style={styles.divider} />

      <View style={styles.benefits}>
        {tier.benefits.map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Feather
              name="check"
              size={14}
              color={dark ? colors.accent : scale.emerald600}
              style={styles.check}
            />
            <Text variant="bodySm" tone={dark ? 'onDarkMuted' : 'secondary'} style={styles.benefitText}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      <Button
        label={isCurrent ? 'Current membership' : `Choose ${tier.name}`}
        onPress={onSelect}
        variant={isCurrent ? (dark ? 'onDark' : 'outline') : dark ? 'gold' : 'primary'}
        disabled={isCurrent}
        loading={loading}
        style={styles.action}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
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
  name: {
    marginTop: spacing.sm,
  },
  tagline: {
    marginTop: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.lg,
  },
  period: {
    marginLeft: spacing.sm,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  benefits: {
    gap: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  check: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
  },
  action: {
    marginTop: spacing.xl,
  },
});
