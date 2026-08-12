import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DoctorCard } from '@/components/domain';
import {
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { api } from '@/services';
import { spacing } from '@/theme';

/** Physician directory, filterable by clinic. */
export default function DoctorsRoute() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string>('all');

  const directory = useAsyncData(async () => {
    const [doctors, clinics] = await Promise.all([api.doctors.list(), api.clinics.list()]);
    return { doctors, clinics };
  }, []);

  const visible = useMemo(() => {
    const all = directory.data?.doctors ?? [];
    return clinicId === 'all' ? all : all.filter((d) => d.clinicId === clinicId);
  }, [directory.data, clinicId]);

  return (
    <Screen marble="ivory" marbleIntensity={0.5}>
      <StatusBar style="dark" />
      <ScreenHeader eyebrow="Your team" title="Physicians" />

      {directory.loading ? (
        <LoadingState label="Loading the directory" />
      ) : directory.error ? (
        <ErrorState message={directory.error.message} onRetry={() => void directory.reload()} />
      ) : (
        <>
          <ChipRow style={styles.filters}>
            <Chip label="All clinics" selected={clinicId === 'all'} onPress={() => setClinicId('all')} />
            {directory.data?.clinics.map((clinic) => (
              <Chip
                key={clinic.id}
                label={clinic.city}
                selected={clinicId === clinic.id}
                onPress={() => setClinicId(clinic.id)}
              />
            ))}
          </ChipRow>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {visible.length === 0 ? (
              <EmptyState
                icon="users"
                title="No physicians here"
                body="Try another clinic, or view the full directory."
                actionLabel="Show all"
                onAction={() => setClinicId('all')}
              />
            ) : (
              visible.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onPress={() => router.push(`/doctors/${doctor.id}`)}
                />
              ))
            )}
            <View style={styles.tail} />
          </ScrollView>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginBottom: spacing.lg,
  },
  list: {
    flex: 1,
  },
  tail: {
    height: spacing.xxxl,
  },
});
