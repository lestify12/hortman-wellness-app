import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { alpha, colors, radius, scale, spacing } from '@/theme';
import type { JourneyEvent, JourneyEventType } from '@/types/models';
import { formatDate } from '@/utils/date';

interface Props {
  event: JourneyEvent;
  /** Hides the connector below the final item. */
  isLast?: boolean;
  onPress?: () => void;
}

const ICONS: Record<JourneyEventType, keyof typeof Feather.glyphMap> = {
  treatment: 'droplet',
  consultation: 'message-circle',
  milestone: 'award',
  measurement: 'activity',
  note: 'file-text',
};

/**
 * One entry on the My Journey timeline: a gold-ruled node, a vertical
 * connector, and the event card.
 */
export function JourneyTimelineItem({ event, isLast = false, onPress }: Props) {
  const isMilestone = event.type === 'milestone';

  return (
    <View style={styles.root}>
      <View style={styles.rail}>
        <View style={[styles.node, isMilestone && styles.nodeMilestone]}>
          <Feather
            name={ICONS[event.type]}
            size={13}
            color={isMilestone ? scale.emerald900 : scale.emerald600}
          />
        </View>
        {!isLast ? <View style={styles.connector} /> : null}
      </View>

      <View style={styles.body}>
        <Text variant="eyebrow" tone="tertiary" style={styles.date}>
          {formatDate(event.occurredAt, 'medium')}
        </Text>

        <Card
          tone={isMilestone ? 'muted' : 'surface'}
          onPress={onPress}
          padded="base"
          flat
          style={styles.card}
        >
          <Text variant="h4" numberOfLines={2}>
            {event.title}
          </Text>

          <Text variant="bodySm" tone="secondary" style={styles.summary}>
            {event.summary}
          </Text>

          {event.metric ? (
            <View style={styles.metric}>
              <Text variant="caption" tone="tertiary">
                {event.metric.label}
              </Text>
              <View style={styles.metricValue}>
                <Text variant="h4" tone="gold">
                  {event.metric.value}
                </Text>
                {event.metric.delta ? (
                  <Text variant="caption" tone="tertiary" style={styles.delta}>
                    {event.metric.delta}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {event.doctorName ? (
            <Text variant="caption" tone="tertiary" style={styles.doctor}>
              {event.doctorName}
            </Text>
          ) : null}
        </Card>
      </View>
    </View>
  );
}

const NODE_SIZE = 30;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
  },
  rail: {
    width: NODE_SIZE,
    alignItems: 'center',
    marginRight: spacing.base,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(scale.emerald600, 0.08),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: alpha(scale.emerald600, 0.2),
    // Aligns the node with the first line of the date label.
    marginTop: spacing.base,
  },
  nodeMilestone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  connector: {
    flex: 1,
    width: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.hairline,
    marginTop: spacing.sm,
    marginBottom: -spacing.sm,
  },
  body: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  date: {
    marginBottom: spacing.sm,
    marginTop: spacing.base,
  },
  card: {
    marginBottom: 0,
  },
  summary: {
    marginTop: spacing.sm,
  },
  metric: {
    marginTop: spacing.base,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  delta: {
    marginLeft: spacing.sm,
  },
  doctor: {
    marginTop: spacing.md,
  },
});
