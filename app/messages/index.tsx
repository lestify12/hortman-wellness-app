import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { MessageThreadRow } from '@/components/domain';
import {
  Divider,
  EmptyState,
  ErrorState,
  LoadingState,
  Screen,
  ScreenHeader,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useAuth } from '@/providers/AuthProvider';
import { api } from '@/services';
import { colors, spacing } from '@/theme';

/** Message threads with physicians and the concierge. */
export default function MessagesRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const threads = useAsyncData(() => api.messages.listThreads(userId), [userId]);

  const open = useCallback(
    (threadId: string) => {
      void api.messages.markRead(threadId);
      router.push(`/messages/${threadId}`);
    },
    [router],
  );

  return (
    <Screen marble="ivory" marbleIntensity={0.45}>
      <StatusBar style="dark" />
      <ScreenHeader eyebrow="Direct line" title="Messages" />

      {threads.loading ? (
        <LoadingState label="Loading conversations" />
      ) : threads.error ? (
        <ErrorState message={threads.error.message} onRetry={() => void threads.reload()} />
      ) : (
        <FlatList
          data={threads.data ?? []}
          keyExtractor={(t) => t.id}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={threads.refreshing}
              onRefresh={() => void threads.reload(true)}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => (
            <MessageThreadRow thread={item} onPress={() => open(item.id)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="message-circle"
              title="No conversations yet"
              body="Messages from your physicians and concierge will appear here."
            />
          }
          ListFooterComponent={<View style={styles.tail} />}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
  },
  tail: {
    height: spacing.xxxl,
  },
});
