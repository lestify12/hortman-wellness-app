import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Marble } from '@/components/brand/Marble';
import { TreatmentCard } from '@/components/domain';
import {
  Avatar,
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
import { alpha, colors, gutter, radius, scale, spacing } from '@/theme';

/** Physician profile — credentials, biography, availability and treatments. */
export default function DoctorDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const detail = useAsyncData(async () => {
    const doctor = await api.doctors.getById(id);
    if (!doctor) return null;
    const [clinics, treatments] = await Promise.all([
      api.clinics.list(),
      api.treatments.list(),
    ]);
    const related = treatments.filter((t) => matchesSpecialty(t.category, doctor.specialties));
    return {
      doctor,
      clinic: clinics.find((c) => c.id === doctor.clinicId) ?? null,
      related: related.slice(0, 4),
    };
  }, [id]);

  if (detail.loading) {
    return (
      <View style={styles.stateRoot}>
        <LoadingState label="Loading profile" />
      </View>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <View style={styles.stateRoot}>
        <ErrorState
          message="We could not find that physician."
          onRetry={() => void detail.reload()}
        />
      </View>
    );
  }

  const { doctor, clinic, related } = detail.data;
  const availableDays = Object.entries(doctor.availability);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Marble variant="emerald" style={styles.hero}>
          <SafeAreaView edges={['top']}>
            <View style={styles.heroBar}>
              <IconButton
                icon="chevron-left"
                tone="onDark"
                size={40}
                accessibilityLabel="Go back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/doctors'))}
              />
              <IconButton
                icon="message-circle"
                tone="onDark"
                size={40}
                accessibilityLabel={`Message ${doctor.name}`}
                onPress={() => router.push('/messages')}
              />
            </View>

            <View style={styles.heroInner}>
              <Avatar initials={doctor.initials} uri={doctor.avatarUrl} size={92} tone="onDark" ring />
              <Text variant="h1" tone="onDark" align="center" style={styles.name}>
                {doctor.name}
              </Text>
              <Text variant="caption" tone="onDarkMuted" align="center">
                {doctor.title}
              </Text>

              <View style={styles.heroStats}>
                <HeroStat value={doctor.rating.toFixed(1)} label="Rating" />
                <View style={styles.heroRule} />
                <HeroStat value={`${doctor.yearsExperience}`} label="Years" />
                <View style={styles.heroRule} />
                <HeroStat value={`${doctor.reviewCount}`} label="Reviews" />
              </View>
            </View>
          </SafeAreaView>
        </Marble>

        <View style={styles.body}>
          {/* Specialties */}
          <View style={styles.badges}>
            {doctor.specialties.map((s) => (
              <Badge key={s} label={s} tone="sage" />
            ))}
          </View>

          {/* Biography */}
          <Card tone="surface" style={styles.card}>
            <Text variant="eyebrow" tone="gold">
              About
            </Text>
            <Text variant="body" tone="secondary" style={styles.bio}>
              {doctor.bio}
            </Text>

            <Divider style={styles.divider} />

            <MetaRow icon="globe" label="Languages" value={doctor.languages.join(' · ')} />
            {clinic ? (
              <MetaRow
                icon="map-pin"
                label="Based at"
                value={`${clinic.name}, ${clinic.city}`}
                last
              />
            ) : null}
          </Card>

          {/* Availability */}
          <View style={styles.section}>
            <SectionHeader eyebrow="Booking" title="Typical availability" />
            <Card tone="muted">
              {availableDays.length === 0 ? (
                <Text variant="bodySm" tone="secondary">
                  Availability is arranged through your concierge.
                </Text>
              ) : (
                availableDays.map(([day, slots], i) => (
                  <View key={day}>
                    {i > 0 ? <Divider style={styles.slotDivider} /> : null}
                    <View style={styles.dayRow}>
                      <Text variant="label" tone="primary" style={styles.dayLabel}>
                        {DAY_NAMES[Number(day)]}
                      </Text>
                      <View style={styles.slots}>
                        {slots.map((slot) => (
                          <View key={slot} style={styles.slot}>
                            <Text variant="caption" tone="primary">
                              {slot}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>

          {/* Related treatments */}
          {related.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader eyebrow="Performed by this physician" title="Treatments" />
              {related.map((treatment) => (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  onPress={() => router.push(`/treatments/${treatment.id}`)}
                />
              ))}
            </View>
          ) : null}

          <Button
            label={`Book with ${doctor.name.split(' ').slice(-1)[0]}`}
            icon="calendar"
            size="lg"
            style={styles.book}
            onPress={() => router.push('/appointments/book')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <Text variant="h3" tone="onDark" align="center">
        {value}
      </Text>
      <Text variant="caption" tone="onDarkMuted" align="center">
        {label}
      </Text>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.metaRow, !last && styles.metaRowSpaced]}>
      <Feather name={icon} size={15} color={scale.emerald600} style={styles.metaIcon} />
      <Text variant="caption" tone="tertiary" style={styles.metaLabel}>
        {label}
      </Text>
      <Text variant="bodySm" tone="primary" style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Loose affinity between a treatment category and a physician's specialties. */
function matchesSpecialty(category: string, specialties: string[]): boolean {
  const haystack = specialties.join(' ').toLowerCase();
  const map: Record<string, string[]> = {
    skin: ['skin', 'derma', 'pigment', 'barrier', 'regenerative'],
    aesthetics: ['facial', 'inject', 'architecture', 'aesthetic'],
    longevity: ['longevity', 'biomarker', 'iv', 'internal'],
    wellness: ['stress', 'sleep', 'recovery', 'wellness'],
    body: ['recovery', 'body', 'stress'],
  };
  return (map[category] ?? []).some((token) => haystack.includes(token));
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
    paddingTop: spacing.base,
    paddingBottom: spacing.xxl,
  },
  name: {
    marginTop: spacing.base,
    marginBottom: spacing.xs,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: alpha(scale.ivory, 0.07),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairlineOnDark,
  },
  heroStat: {
    paddingHorizontal: spacing.lg,
  },
  heroRule: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: colors.hairlineOnDark,
  },
  body: {
    paddingHorizontal: gutter,
    paddingTop: spacing.xl,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  bio: {
    marginTop: spacing.md,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRowSpaced: {
    marginBottom: spacing.md,
  },
  metaIcon: {
    marginRight: spacing.md,
  },
  metaLabel: {
    width: 76,
  },
  metaValue: {
    flex: 1,
  },
  section: {
    marginTop: spacing.xxl,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  dayLabel: {
    width: 84,
    paddingTop: spacing.sm,
  },
  slots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  slotDivider: {
    marginVertical: spacing.xs,
  },
  book: {
    marginTop: spacing.xxl,
  },
});
