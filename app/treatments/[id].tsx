import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import { DoctorCard } from '@/components/domain';
import {
  Badge,
  Button,
  Card,
  Divider,
  ErrorState,
  IconButton,
  LoadingState,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { api } from '@/services';
import { alpha, colors, gutter, radius, scale, scaleWidth, spacing } from '@/theme';
import { formatDuration } from '@/utils/date';
import { accentToMarble, CATEGORY_LABELS, formatCurrency } from '@/utils/format';

/** Treatment detail — hero, the ritual steps, benefits, aftercare, physicians. */
export default function TreatmentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const detail = useAsyncData(async () => {
    const treatment = await api.treatments.getById(id);
    if (!treatment) return null;
    const doctors = await api.doctors.listByTreatment(treatment.id);
    return { treatment, doctors };
  }, [id]);

  if (detail.loading) {
    return (
      <View style={styles.stateRoot}>
        <LoadingState label="Loading treatment" />
      </View>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <View style={styles.stateRoot}>
        <ErrorState message="We could not find that treatment." onRetry={() => void detail.reload()} />
      </View>
    );
  }

  const { treatment, doctors } = detail.data;
  const marble = accentToMarble(treatment.accent);
  const heroDark = marble === 'emerald';

  return (
    <View style={styles.root}>
      <StatusBar style={heroDark ? 'light' : 'dark'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <Marble variant={marble} style={styles.hero}>
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <View style={styles.heroBar}>
              <IconButton
                icon="chevron-left"
                tone={heroDark ? 'onDark' : 'surface'}
                size={40}
                accessibilityLabel="Go back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/treatments'))}
              />
              <IconButton
                icon="heart"
                tone={heroDark ? 'onDark' : 'surface'}
                size={40}
                accessibilityLabel="Save this treatment"
              />
            </View>

            <View style={styles.heroContent}>
              <View style={styles.heroBadges}>
                <Badge
                  label={CATEGORY_LABELS[treatment.category]}
                  tone={heroDark ? 'onDark' : 'gold'}
                />
                {treatment.isSignature ? (
                  <Badge label="Signature" tone={heroDark ? 'onDark' : 'emerald'} />
                ) : null}
              </View>

              <Text variant="display" tone={heroDark ? 'onDark' : 'primary'} style={styles.heroTitle}>
                {treatment.name}
              </Text>
              <Text variant="body" tone={heroDark ? 'onDarkMuted' : 'secondary'}>
                {treatment.tagline}
              </Text>
            </View>
          </SafeAreaView>
        </Marble>

        <View style={styles.body}>
          {/* Key facts */}
          <Card tone="surface" style={styles.facts}>
            <View style={styles.factRow}>
              <Fact
                icon="clock"
                value={formatDuration(treatment.durationMinutes)}
                label="Duration"
              />
              <View style={styles.vRule} />
              <Fact
                icon="tag"
                value={formatCurrency(treatment.priceFrom, treatment.currency)}
                label="From"
              />
              <View style={styles.vRule} />
              <Fact icon="star" value={treatment.rating.toFixed(1)} label={`${treatment.reviewCount} reviews`} />
            </View>
          </Card>

          {/* Description */}
          <View style={styles.section}>
            <SectionHeader eyebrow="The protocol" title="What it is" />
            <Text variant="bodyLg" tone="secondary">
              {treatment.description}
            </Text>
          </View>

          {/* Ritual steps */}
          <View style={styles.section}>
            <SectionHeader eyebrow="Step by step" title="The ritual" />
            <Card tone="muted">
              {treatment.steps.map((step, i) => (
                <View key={step} style={styles.step}>
                  <View style={styles.stepIndex}>
                    <Text variant="caption" tone="gold">
                      {String(i + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <Text variant="body" tone="primary" style={styles.stepText}>
                    {step}
                  </Text>
                  {i < treatment.steps.length - 1 ? <View style={styles.stepConnector} /> : null}
                </View>
              ))}
            </Card>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <SectionHeader eyebrow="Why members choose it" title="Benefits" />
            {treatment.benefits.map((benefit) => (
              <View key={benefit} style={styles.bullet}>
                <Feather name="check" size={15} color={scale.emerald600} style={styles.bulletIcon} />
                <Text variant="body" tone="secondary" style={styles.bulletText}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>

          {/* Aftercare */}
          {treatment.aftercare.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="Afterwards" title="Aftercare" />
              <Card tone="outline">
                {treatment.aftercare.map((item, i) => (
                  <View key={item}>
                    {i > 0 ? <Divider style={styles.aftercareDivider} /> : null}
                    <View style={styles.aftercareRow}>
                      <Feather name="feather" size={14} color={colors.accent} style={styles.bulletIcon} />
                      <Text variant="bodySm" tone="secondary" style={styles.bulletText}>
                        {item}
                      </Text>
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          {/* Physicians */}
          {doctors.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="Delivered by" title="Your physicians" />
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onPress={() => router.push(`/doctors/${doctor.id}`)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Booking bar */}
      <SafeAreaView edges={['bottom']} style={styles.bookBar}>
        <View style={styles.bookBarInner}>
          <View>
            <Text variant="caption" tone="tertiary">
              From
            </Text>
            <Text variant="h3">{formatCurrency(treatment.priceFrom, treatment.currency)}</Text>
          </View>

          <Button
            label="Book this ritual"
            icon="arrow-right"
            fullWidth={false}
            style={styles.bookButton}
            onPress={() => router.push('/appointments/book')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Fact({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.fact}>
      <Feather name={icon} size={15} color={colors.accent} />
      <Text variant="h4" align="center" style={styles.factValue}>
        {value}
      </Text>
      <Text variant="caption" tone="tertiary" align="center">
        {label}
      </Text>
    </View>
  );
}

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
    paddingBottom: spacing.giant + spacing.xxl,
  },
  hero: {
    minHeight: scaleWidth(300),
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroSafe: {
    flex: 1,
  },
  heroBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingTop: spacing.sm,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  heroTitle: {
    marginBottom: spacing.md,
  },
  body: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
  },
  facts: {
    marginBottom: spacing.sm,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fact: {
    flex: 1,
    alignItems: 'center',
  },
  factValue: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxs,
  },
  vRule: {
    width: StyleSheet.hairlineWidth,
    height: 44,
    backgroundColor: colors.hairline,
  },
  section: {
    marginTop: spacing.xxl,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  stepIndex: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(colors.accent, 0.12),
    marginRight: spacing.base,
  },
  stepText: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  stepConnector: {
    position: 'absolute',
    left: 15,
    top: 38,
    bottom: -4,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: alpha(colors.accent, 0.24),
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  bulletIcon: {
    marginRight: spacing.md,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
  },
  aftercareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  aftercareDivider: {
    marginVertical: spacing.xs,
  },
  bookBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  bookBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingVertical: spacing.md,
  },
  bookButton: {
    paddingHorizontal: spacing.lg,
  },
});
