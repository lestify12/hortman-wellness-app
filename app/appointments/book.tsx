import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { useAuth } from '@/providers/AuthProvider';
import { api, ServiceError } from '@/services';
import { alpha, colors, gutter, radius, scale, spacing, typeScale } from '@/theme';
import { formatDate, formatDuration, formatWeekday } from '@/utils/date';
import { CATEGORY_LABELS, formatCurrency } from '@/utils/format';

/** How many days forward the date rail offers. */
const HORIZON_DAYS = 21;

/**
 * Booking flow.
 *
 * Four steps on one scroll — treatment, physician, date and time, then
 * confirmation. Slots come from the selected physician's availability for the
 * chosen weekday, so the three selections stay consistent with each other.
 */
export default function BookAppointmentRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ treatmentId?: string; doctorId?: string }>();

  const [treatmentId, setTreatmentId] = useState<string | null>(params.treatmentId ?? null);
  const [doctorId, setDoctorId] = useState<string | null>(params.doctorId ?? null);
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const options = useAsyncData(async () => {
    const [treatments, doctors, clinics] = await Promise.all([
      api.treatments.list(),
      api.doctors.list(),
      api.clinics.list(),
    ]);
    return { treatments, doctors, clinics };
  }, []);

  const treatment = useMemo(
    () => options.data?.treatments.find((t) => t.id === treatmentId) ?? null,
    [options.data, treatmentId],
  );

  const doctor = useMemo(
    () => options.data?.doctors.find((d) => d.id === doctorId) ?? null,
    [options.data, doctorId],
  );

  const clinic = useMemo(
    () => options.data?.clinics.find((c) => c.id === doctor?.clinicId) ?? null,
    [options.data, doctor],
  );

  /** Next N days, so the rail always starts from tomorrow. */
  const dates = useMemo(() => {
    const out: Date[] = [];
    for (let i = 1; i <= HORIZON_DAYS; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      out.push(d);
    }
    return out;
  }, []);

  /** Slots the selected physician actually offers on the selected weekday. */
  const slots = useMemo(() => {
    if (!doctor || !date) return [];
    return doctor.availability[String(date.getDay())] ?? [];
  }, [doctor, date]);

  const canSubmit = Boolean(treatment && doctor && clinic && date && slot);

  const confirm = useCallback(async () => {
    if (!treatment || !doctor || !clinic || !date || !slot || !user) return;

    const [hour, minute] = slot.split(':').map(Number);
    const startsAt = new Date(date);
    startsAt.setHours(hour ?? 9, minute ?? 0, 0, 0);

    setSubmitting(true);
    try {
      await api.appointments.book(user.id, {
        treatmentId: treatment.id,
        doctorId: doctor.id,
        clinicId: clinic.id,
        startsAt: startsAt.toISOString(),
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Your appointment is confirmed',
        `${treatment.name} with ${doctor.name} on ${formatDate(startsAt.toISOString(), 'long')} at ${slot}.`,
        [
          {
            text: 'View my appointments',
            onPress: () => router.replace('/(tabs)/appointments'),
          },
        ],
      );
    } catch (err) {
      Alert.alert(
        'We could not confirm that',
        err instanceof ServiceError ? err.message : 'Please try again, or message your concierge.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [treatment, doctor, clinic, date, slot, notes, user, router]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text variant="eyebrow" tone="gold">
              New booking
            </Text>
            <Text variant="h1" style={styles.title}>
              Arrange a visit
            </Text>
          </View>

          <IconButton
            icon="x"
            accessibilityLabel="Close"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
          />
        </View>

        {options.loading ? (
          <LoadingState label="Loading availability" />
        ) : options.error ? (
          <View style={styles.body}>
            <ErrorState message={options.error.message} onRetry={() => void options.reload()} />
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1 — Treatment */}
              <View style={styles.body}>
                <StepHeader index={1} eyebrow="Choose" title="Treatment" />
                {options.data?.treatments.map((t) => (
                  <Pressable
                    key={t.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: treatmentId === t.id }}
                    accessibilityLabel={t.name}
                    onPress={() => {
                      setTreatmentId(t.id);
                      // A different treatment can change the eligible physicians.
                      setDoctorId(null);
                      setSlot(null);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      treatmentId === t.id && styles.optionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.optionBody}>
                      <Text variant="h4" numberOfLines={1}>
                        {t.name}
                      </Text>
                      <Text variant="caption" tone="tertiary" style={styles.optionMeta}>
                        {CATEGORY_LABELS[t.category]} · {formatDuration(t.durationMinutes)} ·{' '}
                        {formatCurrency(t.priceFrom, t.currency)}
                      </Text>
                    </View>
                    <Radio selected={treatmentId === t.id} />
                  </Pressable>
                ))}
              </View>

              {/* 2 — Physician */}
              {treatment ? (
                <View style={[styles.body, styles.section]}>
                  <StepHeader index={2} eyebrow="Choose" title="Physician" />
                  {options.data?.doctors.map((d) => (
                    <Pressable
                      key={d.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: doctorId === d.id }}
                      accessibilityLabel={d.name}
                      onPress={() => {
                        setDoctorId(d.id);
                        setSlot(null);
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        doctorId === d.id && styles.optionSelected,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Avatar initials={d.initials} size={40} style={styles.optionAvatar} />
                      <View style={styles.optionBody}>
                        <Text variant="h4" numberOfLines={1}>
                          {d.name}
                        </Text>
                        <Text variant="caption" tone="tertiary" numberOfLines={1}>
                          {d.specialties[0]}
                        </Text>
                      </View>
                      <Radio selected={doctorId === d.id} />
                    </Pressable>
                  ))}
                </View>
              ) : null}

              {/* 3 — Date and time */}
              {doctor ? (
                <View style={styles.section}>
                  <View style={styles.body}>
                    <StepHeader index={3} eyebrow="Choose" title="Date and time" />
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateRail}
                  >
                    {dates.map((d) => {
                      const hasSlots = (doctor.availability[String(d.getDay())] ?? []).length > 0;
                      const selected = date?.toDateString() === d.toDateString();
                      return (
                        <Pressable
                          key={d.toISOString()}
                          accessibilityRole="button"
                          accessibilityState={{ selected, disabled: !hasSlots }}
                          accessibilityLabel={formatDate(d.toISOString(), 'long')}
                          disabled={!hasSlots}
                          onPress={() => {
                            setDate(d);
                            setSlot(null);
                          }}
                          style={({ pressed }) => [
                            styles.dateCell,
                            selected && styles.dateCellSelected,
                            !hasSlots && styles.dateCellDisabled,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Text
                            variant="caption"
                            tone={selected ? 'onDarkMuted' : 'tertiary'}
                          >
                            {formatWeekday(d.toISOString())}
                          </Text>
                          <Text
                            variant="h3"
                            tone={selected ? 'onDark' : 'primary'}
                            style={styles.dateNumeral}
                          >
                            {d.getDate()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>

                  {date ? (
                    <View style={[styles.body, styles.slotBlock]}>
                      {slots.length === 0 ? (
                        <Text variant="bodySm" tone="tertiary">
                          {doctor.name} has no availability that day. Try another date.
                        </Text>
                      ) : (
                        <View style={styles.slots}>
                          {slots.map((s) => (
                            <Pressable
                              key={s}
                              accessibilityRole="radio"
                              accessibilityState={{ selected: slot === s }}
                              accessibilityLabel={`${s}`}
                              onPress={() => setSlot(s)}
                              style={({ pressed }) => [
                                styles.slot,
                                slot === s && styles.slotSelected,
                                pressed && styles.pressed,
                              ]}
                            >
                              <Text variant="label" tone={slot === s ? 'onDark' : 'primary'}>
                                {s}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              ) : null}

              {/* 4 — Notes and summary */}
              {canSubmit ? (
                <View style={[styles.body, styles.section]}>
                  <StepHeader index={4} eyebrow="Confirm" title="Your booking" />

                  <Card tone="muted" style={styles.summary}>
                    <SummaryRow label="Treatment" value={treatment?.name ?? ''} />
                    <Divider style={styles.summaryDivider} />
                    <SummaryRow label="Physician" value={doctor?.name ?? ''} />
                    <Divider style={styles.summaryDivider} />
                    <SummaryRow
                      label="When"
                      value={`${formatDate(date!.toISOString(), 'long')} · ${slot}`}
                    />
                    <Divider style={styles.summaryDivider} />
                    <SummaryRow label="Where" value={clinic ? `${clinic.name}, ${clinic.city}` : '—'} />

                    {treatment ? (
                      <>
                        <Divider style={styles.summaryDivider} />
                        <View style={styles.priceRow}>
                          <Text variant="label" tone="primary">
                            From
                          </Text>
                          <Badge
                            label={formatCurrency(treatment.priceFrom, treatment.currency)}
                            tone="gold"
                          />
                        </View>
                      </>
                    ) : null}
                  </Card>

                  <SectionHeader eyebrow="Optional" title="Anything we should know?" />
                  <TextInput
                    style={styles.notes}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Allergies, preferences, or a request for your physician"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    maxLength={500}
                    selectionColor={colors.accent}
                    accessibilityLabel="Appointment notes"
                  />
                </View>
              ) : null}
            </ScrollView>

            {/* Confirm bar */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
              <View style={styles.footerInner}>
                {!canSubmit ? (
                  <Text variant="caption" tone="tertiary" align="center" style={styles.footerHint}>
                    {!treatment
                      ? 'Choose a treatment to continue'
                      : !doctor
                        ? 'Choose a physician to continue'
                        : 'Choose a date and time to continue'}
                  </Text>
                ) : null}

                <Button
                  label="Confirm booking"
                  icon={canSubmit ? 'check' : undefined}
                  disabled={!canSubmit}
                  loading={submitting}
                  size="lg"
                  variant="gold"
                  onPress={confirm}
                />
              </View>
            </SafeAreaView>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function StepHeader({
  index,
  eyebrow,
  title,
}: {
  index: number;
  eyebrow: string;
  title: string;
}) {
  return (
    <View style={styles.stepHeader}>
      <View style={styles.stepIndex}>
        <Text variant="caption" tone="gold">
          {index}
        </Text>
      </View>
      <View>
        <Text variant="eyebrow" tone="gold">
          {eyebrow}
        </Text>
        <Text variant="h2" style={styles.stepTitle}>
          {title}
        </Text>
      </View>
    </View>
  );
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <Feather name="check" size={12} color={scale.emerald900} /> : null}
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text variant="caption" tone="tertiary" style={styles.summaryLabel}>
        {label}
      </Text>
      <Text variant="bodySm" tone="primary" style={styles.summaryValue}>
        {value}
      </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: gutter,
    paddingTop: spacing.base,
    paddingBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    marginTop: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  body: {
    paddingHorizontal: gutter,
  },
  section: {
    marginTop: spacing.xxl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(colors.accent, 0.13),
    marginRight: spacing.md,
  },
  stepTitle: {
    marginTop: spacing.xxs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  optionSelected: {
    borderColor: colors.accent,
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: alpha(colors.accent, 0.05),
  },
  optionAvatar: {
    marginRight: spacing.md,
  },
  optionBody: {
    flex: 1,
    marginRight: spacing.md,
  },
  optionMeta: {
    marginTop: spacing.xs,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.hairlineStrong,
  },
  radioSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dateRail: {
    paddingHorizontal: gutter,
    gap: spacing.sm,
  },
  dateCell: {
    width: 60,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  dateCellSelected: {
    backgroundColor: colors.surfaceInverse,
    borderColor: colors.surfaceInverse,
  },
  dateCellDisabled: {
    opacity: 0.32,
  },
  dateNumeral: {
    marginTop: spacing.xxs,
  },
  slotBlock: {
    marginTop: spacing.lg,
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md - 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  slotSelected: {
    backgroundColor: colors.surfaceInverse,
    borderColor: colors.surfaceInverse,
  },
  summary: {
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    width: 82,
    paddingTop: 2,
  },
  summaryValue: {
    flex: 1,
  },
  summaryDivider: {
    marginVertical: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notes: {
    minHeight: 96,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    textAlignVertical: 'top',
    ...typeScale.body,
    color: colors.textPrimary,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  footerInner: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.md,
  },
  footerHint: {
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.75,
  },
});
