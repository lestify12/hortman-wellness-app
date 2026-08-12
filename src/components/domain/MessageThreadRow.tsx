import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Avatar, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';
import type { MessageThread } from '@/types/models';
import { formatMessageStamp } from '@/utils/date';

interface Props {
  thread: MessageThread;
  onPress?: () => void;
}

/** Conversation row for the Messages list. */
export function MessageThreadRow({ thread, onPress }: Props) {
  const unread = thread.unreadCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${thread.participantName}`}
      onPress={onPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <Avatar
        initials={thread.participantInitials}
        size={50}
        tone={unread ? 'emerald' : 'champagne'}
        ring={unread}
      />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text variant="h4" numberOfLines={1} style={styles.name}>
            {thread.participantName}
          </Text>
          <Text variant="caption" tone={unread ? 'gold' : 'tertiary'}>
            {formatMessageStamp(thread.lastMessageAt)}
          </Text>
        </View>

        <Text variant="caption" tone="tertiary" numberOfLines={1} style={styles.role}>
          {thread.participantRole}
        </Text>

        <View style={styles.bottomRow}>
          <Text
            variant="bodySm"
            tone={unread ? 'primary' : 'secondary'}
            numberOfLines={1}
            style={styles.preview}
          >
            {thread.lastMessage}
          </Text>

          {unread ? (
            <View style={styles.unreadPip}>
              <Text variant="caption" color={colors.textOnDark} style={styles.unreadCount}>
                {thread.unreadCount}
              </Text>
            </View>
          ) : (
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
  },
  pressed: {
    opacity: 0.6,
  },
  body: {
    flex: 1,
    marginLeft: spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  role: {
    marginTop: spacing.xxs,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  preview: {
    flex: 1,
  },
  unreadPip: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    fontSize: 10,
    lineHeight: 14,
  },
});
