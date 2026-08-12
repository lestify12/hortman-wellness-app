import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppointmentCard } from '@/components/domain';
import {
  Button,
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services';
import { colors, gutter, spacing, tabScrollInset } from '@/theme';
import type { Appointment } from '@/types/models';
import { formatDate, formatTime } from '@/utils/date';

type Tab = 'upcoming' | 'past' | 'cancelled';

const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

/** Appointments — segmented by upcoming, past and cancelled. */
export default function AppointmentsRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [tab, setTab] = useState<Tab>('upcoming');
  const [busyId, setBusyId] = useState<string | null>(null);

  const appointments = useAsyncData(() => api.appointments.listForUser(userId), [userId]);

  const grouped = useMemo(() => {
    const all = appointments.data ?? [];
    const now = Date.now();
    return {
      upcoming: all
        .filter((a) => a.status === 'upcoming' && new Date(a.startsAt).getTime() >= now)
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
      past: all
        .filter(
          (a) =>
            a.status === 'completed' ||
            (a.status === 'upcoming' && new Date(a.startsAt).getTime() < now),
        )
        .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt)),
      cancelled: all
        .filter((a) => a.status === 'cancelled')
        .sort((a, b) => +new Date(b.startsAt) - +new Date(a.startsAt)),
    };
  }, [appointments.data]);

  const visible = grouped[tab];

  const confirmCancel = useCallback(
    (appointment: Appointment) => {
      Alert.alert(
        'Cancel this appointment?',
        `${appointment.treatmentName} on ${formatDate(appointment.startsAt)} at ${formatTime(
          appointment.startsAt,
        )}. Cancellations within 24 hours may incur a charge.`,
        [
          { text: 'Keep it', style: 'cancel' },
          {
            text: 'Cancel appointment',
            style: 'destructive',
            onPress: async () => {
              setBusyId(appointment.id);
              try {
                const updated = await api.appointments.cancel(appointment.id);
                appointments.setData(
                  (appointments.data ?? []).map((a) => (a.id === updated.id ? updated : a)),
                );
              } catch {
                Alert.alert('We could not cancel that', 'Please try again, or message your concierge.');
              } finally {
                setBusyId(null);
              }
            },
          },
        ],
      );
    },
    [appointments],
  );

  const onRefresh = useCallback(() => void appointments.reload(true), [appointments]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={appointments.refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text variant="eyebrow" tone="gold">
                  Your calendar
                </Text>
                <Text variant="display" style={styles.title}>
                  Appointments
                </Text>
              </View>

              <IconButton
                icon="plus"
                tone="gold"
                accessibilityLabel="Book an appointment"
                onPress={() => router.push('/appointments/book')}
              />
            </View>
          </View>

          <View style={styles.tabs}>
            <ChipRow>
              {TABS.map((t) => (
                <Chip
                  key={t.key}
                  label={`${t.label}${grouped[t.key].length > 0 ? ` · ${grouped[t.key].length}` : ''}`}
                  selected={tab === t.key}
                  onPress={() => setTab(t.key)}
                />
              ))}
            </ChipRow>
          </View>

          <View style={styles.body}>
            {appointments.loading ? (
              <LoadingState label="Loading your calendar" />
            ) : appointments.error ? (
              <ErrorState
                message={appointments.error.message}
                onRetry={() => void appointments.reload()}
              />
            ) : visible.length === 0 ? (
              <EmptyState
                icon={tab === 'upcoming' ? 'calendar' : 'clock'}
                title={
                  tab === 'upcoming'
                    ? 'Your calendar is clear'
                    : tab === 'past'
                      ? 'No past visits yet'
                      : 'Nothing cancelled'
                }
                body={
                  tab === 'upcoming'
                    ? 'Arrange your next ritual and it will appear here.'
                    : 'Completed and cancelled visits are kept here for your records.'
                }
                actionLabel={tab === 'upcoming' ? 'Book an appointment' : undefined}
                onAction={tab === 'upcoming' ? () => router.push('/appointments/book') : undefined}
              />
            ) : (
              visible.map((appointment, i) => (
                <View key={appointment.id}>
                  <AppointmentCard
                    appointment={appointment}
                    featured={tab === 'upcoming' && i === 0}
                    onPress={() => router.push(`/treatments/${appointment.treatmentId}`)}
                  />

                  {tab === 'upcoming' ? (
                    <View style={styles.actions}>
                      <Button
                        label="Reschedule"
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        onPress={() => router.push('/appointments/book')}
                        style={styles.action}
                      />
                      <Button
                        label="Cancel"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        loading={busyId === appointment.id}
                        onPress={() => confirmCancel(appointment)}
                      />
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  title: {
    marginTop: spacing.md,
  },
  tabs: {
    paddingHorizontal: gutter,
    marginBottom: spacing.lg,
  },
  body: {
    paddingHorizontal: gutter,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  action: {
    marginRight: spacing.xs,
  },
});
