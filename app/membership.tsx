import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import { VeloraMonogram } from '@/components/brand/VeloraMonogram';
import { MembershipTierCard } from '@/components/domain';
import {
  Card,
  Divider,
  ErrorState,
  IconButton,
  LoadingState,
  ProgressBar,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services';
import { alpha, colors, gutter, radius, scale, spacing } from '@/theme';
import type { MembershipTierId } from '@/types/models';
import { formatDate } from '@/utils/date';
import { formatPoints } from '@/utils/format';

/** Membership — current standing, points progress and the tier ladder. */
export default function MembershipRoute() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const userId = user?.id ?? '';

  const [changingTier, setChangingTier] = useState<MembershipTierId | null>(null);

  const membership = useAsyncData(async () => {
    const [tiers, state] = await Promise.all([
      api.membership.listTiers(),
      api.membership.getState(userId),
    ]);
    return { tiers, state };
  }, [userId]);

  const changeTier = useCallback(
    (tierId: MembershipTierId, tierName: string) => {
      Alert.alert(
        `Move to ${tierName}?`,
        'Your new rate applies from the next billing date. Your concierge will confirm the details.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: `Choose ${tierName}`,
            onPress: async () => {
              setChangingTier(tierId);
              try {
                const state = await api.membership.changeTier(userId, tierId);
                membership.setData({ tiers: membership.data?.tiers ?? [], state });
                await updateProfile({ membershipTier: tierId });
              } catch {
                Alert.alert(
                  'We could not change your tier',
                  'Please try again, or message your concierge.',
                );
              } finally {
                setChangingTier(null);
              }
            },
          },
        ],
      );
    },
    [userId, membership, updateProfile],
  );

  const state = membership.data?.state;
  const pointsGoal = state ? state.points + state.pointsToNextTier : 0;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Marble variant="emerald" style={styles.hero} intensity={1.1}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroBar}>
              <IconButton
                icon="chevron-left"
                tone="onDark"
                size={40}
                accessibilityLabel="Go back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
              />
            </View>

            <View style={styles.heroInner}>
              <VeloraMonogram size={64} tone="gold" />
              <Text variant="eyebrow" tone="onDarkMuted" style={styles.heroEyebrow}>
                Membership
              </Text>
              <Text variant="display" tone="onDark" align="center">
                {state ? TIER_NAMES[state.tierId] : 'Your standing'}
              </Text>

              {state ? (
                <View style={styles.heroPanel}>
                  <View style={styles.pointsRow}>
                    <Text variant="metric" tone="onDark">
                      {formatPoints(state.points)}
                    </Text>
                    <Text variant="caption" tone="onDarkMuted" style={styles.pointsLabel}>
                      points
                    </Text>
                  </View>

                  <ProgressBar
                    value={pointsGoal > 0 ? state.points / pointsGoal : 0}
                    tone="onDark"
                    style={styles.heroBarProgress}
                  />

                  <Text variant="caption" tone="onDarkMuted">
                    {formatPoints(state.pointsToNextTier)} points to your next tier · Renews{' '}
                    {formatDate(state.renewsAt, 'medium')}
                  </Text>
                </View>
              ) : null}
            </View>
          </SafeAreaView>
        </Marble>

        <View style={styles.body}>
          {membership.loading ? (
            <LoadingState label="Loading your membership" />
          ) : membership.error ? (
            <ErrorState
              message={membership.error.message}
              onRetry={() => void membership.reload()}
            />
          ) : (
            <>
              {/* Perks this period */}
              {state ? (
                <Card tone="muted" style={styles.perks}>
                  <View style={styles.perksHeader}>
                    <View>
                      <Text variant="eyebrow" tone="gold">
                        This period
                      </Text>
                      <Text variant="h3" style={styles.perksTitle}>
                        Complimentary rituals
                      </Text>
                    </View>
                    <Text variant="h2" tone="gold">
                      {state.perksTotal - state.perksUsed}
                    </Text>
                  </View>

                  <ProgressBar
                    value={state.perksTotal > 0 ? state.perksUsed / state.perksTotal : 0}
                    tone="gold"
                    style={styles.perksBar}
                  />

                  <Text variant="caption" tone="tertiary">
                    {state.perksUsed} of {state.perksTotal} used · resets{' '}
                    {formatDate(state.renewsAt, 'short')}
                  </Text>
                </Card>
              ) : null}

              {/* Tier ladder */}
              <View style={styles.section}>
                <SectionHeader
                  eyebrow="The ladder"
                  title="Choose your tier"
                />

                {membership.data?.tiers.map((tier) => (
                  <MembershipTierCard
                    key={tier.id}
                    tier={tier}
                    isCurrent={state?.tierId === tier.id}
                    loading={changingTier === tier.id}
                    onSelect={() => changeTier(tier.id, tier.name)}
                  />
                ))}
              </View>

              <Divider ornament style={styles.ornament} />

              <Text variant="caption" tone="tertiary" align="center" style={styles.smallPrint}>
                Membership rates are billed monthly and may be paused once each year. Noir
                membership is offered by invitation. Speak with your concierge for full terms.
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const TIER_NAMES: Record<MembershipTierId, string> = {
  essence: 'Essence',
  radiance: 'Radiance',
  noir: 'Noir',
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    paddingBottom: spacing.giant,
  },
  hero: {
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroBar: {
    paddingHorizontal: gutter,
    paddingTop: spacing.sm,
  },
  heroInner: {
    alignItems: 'center',
    paddingHorizontal: gutter,
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  heroEyebrow: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heroPanel: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: alpha(scale.ivory, 0.07),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairlineOnDark,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsLabel: {
    marginLeft: spacing.sm,
  },
  heroBarProgress: {
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  body: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
  },
  perks: {
    marginBottom: spacing.sm,
  },
  perksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perksTitle: {
    marginTop: spacing.sm,
  },
  perksBar: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  section: {
    marginTop: spacing.xxl,
  },
  ornament: {
    marginVertical: spacing.xl,
  },
  smallPrint: {
    paddingHorizontal: spacing.md,
  },
});
