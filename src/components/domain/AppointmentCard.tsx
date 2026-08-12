import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Card, Divider, Text } from '@/components/ui';
import { alpha, colors, radius, scale, spacing } from '@/theme';
import type { Appointment, AppointmentStatus } from '@/types/models';
import { formatDate, formatDuration, formatRelative, formatTime, formatWeekday } from '@/utils/date';

interface Props {
  appointment: Appointment;
  onPress?: () => void;
  /** Emerald hero treatment for the next appointment on the dashboard. */
  featured?: boolean;
}

const STATUS: Record<AppointmentStatus, { label: string; tone: 'gold' | 'success' | 'danger' | 'neutral' }> = {
  upcoming: { label: 'Confirmed', tone: 'gold' },
  pending: { label: 'Pending', tone: 'neutral' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

/** Appointment row — date block on the left, detail on the right. */
export function AppointmentCard({ appointment, onPress, featured = false }: Props) {
  const status = STATUS[appointment.status];
  const dark = featured;

  return (
    <Card
      tone={featured ? 'emerald' : 'surface'}
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`${appointment.treatmentName} with ${appointment.doctorName}`}
    >
      <View style={styles.header}>
        <View style={[styles.dateBlock, dark && styles.dateBlockDark]}>
          <Text variant="eyebrow" tone={dark ? 'onDarkMuted' : 'tertiary'}>
            {formatWeekday(appointment.startsAt)}
          </Text>
          <Text
            variant="h2"
            tone={dark ? 'onDark' : 'primary'}
            style={styles.dateNumeral}
          >
            {new Date(appointment.startsAt).getDate()}
          </Text>
          <Text variant="caption" tone={dark ? 'onDarkMuted' : 'tertiary'}>
            {formatDate(appointment.startsAt, 'short').split(' ')[1]}
          </Text>
        </View>

        <View style={styles.headerBody}>
          <Badge
            label={featured ? formatRelative(appointment.startsAt) : status.label}
            tone={featured ? 'onDark' : status.tone}
            dot={!featured}
            style={styles.badge}
          />
          <Text variant="h3" tone={dark ? 'onDark' : 'primary'} numberOfLines={2}>
            {appointment.treatmentName}
          </Text>
          <Text
            variant="bodySm"
            tone={dark ? 'onDarkMuted' : 'secondary'}
            style={styles.doctor}
            numberOfLines={1}
          >
            {appointment.doctorName}
          </Text>
        </View>
      </View>

      <Divider dark={dark} style={styles.divider} />

      <View style={styles.metaRow}>
        <Meta
          icon="clock"
          label={`${formatTime(appointment.startsAt)} · ${formatDuration(appointment.durationMinutes)}`}
          dark={dark}
        />
        <Meta icon="map-pin" label={appointment.clinicName} dark={dark} />
      </View>
    </Card>
  );
}

function Meta({
  icon,
  label,
  dark,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  dark: boolean;
}) {
  return (
    <View style={styles.meta}>
      <Feather
        name={icon}
        size={13}
        color={dark ? colors.textOnDarkMuted : colors.textTertiary}
        style={styles.metaIcon}
      />
      <Text variant="caption" tone={dark ? 'onDarkMuted' : 'secondary'} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dateBlock: {
    width: 56,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: alpha(scale.emerald600, 0.06),
    marginRight: spacing.base,
  },
  dateBlockDark: {
    backgroundColor: alpha(scale.ivory, 0.1),
  },
  dateNumeral: {
    marginVertical: 1,
  },
  headerBody: {
    flex: 1,
    paddingTop: spacing.xxs,
  },
  badge: {
    marginBottom: spacing.sm,
  },
  doctor: {
    marginTop: spacing.xs,
  },
  divider: {
    marginVertical: spacing.base,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  metaIcon: {
    marginRight: spacing.sm - 2,
  },
});
