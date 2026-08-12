import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar, Divider, ErrorState, LoadingState, Text } from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { api } from '@/services';
import { alpha, colors, gutter, radius, scale, spacing, typeScale } from '@/theme';
import type { Message } from '@/types/models';
import { formatDate, formatTime } from '@/utils/date';

/** Conversation view — bubbles, day separators, and a composer. */
export default function ConversationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const conversation = useAsyncData(async () => {
    const [threads, messages] = await Promise.all([
      api.messages.listThreads(''),
      api.messages.listMessages(id),
    ]);
    return { thread: threads.find((t) => t.id === id) ?? null, messages };
  }, [id]);

  const messages = useMemo(() => conversation.data?.messages ?? [], [conversation.data]);
  const thread = conversation.data?.thread ?? null;

  const send = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setDraft('');
    try {
      const message = await api.messages.send(id, body);
      conversation.setData({
        thread: conversation.data?.thread ?? null,
        messages: [...messages, message],
      });
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch {
      // Restore the draft so nothing the member typed is lost.
      setDraft(body);
    } finally {
      setSending(false);
    }
  }, [draft, sending, id, conversation, messages]);

  if (conversation.loading) {
    return (
      <View style={styles.stateRoot}>
        <LoadingState label="Opening conversation" />
      </View>
    );
  }

  if (conversation.error || !thread) {
    return (
      <View style={styles.stateRoot}>
        <ErrorState
          message="We could not open that conversation."
          onRetry={() => void conversation.reload()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/messages'))}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <Avatar initials={thread.participantInitials} size={40} ring />

          <View style={styles.headerText}>
            <Text variant="h4" numberOfLines={1}>
              {thread.participantName}
            </Text>
            <Text variant="caption" tone="tertiary" numberOfLines={1}>
              {thread.participantRole}
            </Text>
          </View>
        </View>

        <Divider />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item, index }) => {
              const previous = index > 0 ? messages[index - 1] : undefined;
              const showDay =
                !previous ||
                new Date(previous.sentAt).toDateString() !== new Date(item.sentAt).toDateString();

              return (
                <>
                  {showDay ? (
                    <Divider label={formatDate(item.sentAt, 'medium')} style={styles.daySeparator} />
                  ) : null}

                  <View style={[styles.bubbleRow, item.isMine && styles.bubbleRowMine]}>
                    <View style={[styles.bubble, item.isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                      <Text variant="body" tone={item.isMine ? 'onDark' : 'primary'}>
                        {item.body}
                      </Text>
                      <Text
                        variant="caption"
                        tone={item.isMine ? 'onDarkMuted' : 'tertiary'}
                        style={styles.stamp}
                      >
                        {formatTime(item.sentAt)}
                      </Text>
                    </View>
                  </View>
                </>
              );
            }}
          />

          {/* Composer */}
          <SafeAreaView edges={['bottom']} style={styles.composerWrap}>
            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a message"
                placeholderTextColor={colors.textTertiary}
                multiline
                maxLength={2000}
                selectionColor={colors.accent}
                accessibilityLabel="Message input"
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send message"
                accessibilityState={{ disabled: draft.trim().length === 0 || sending }}
                disabled={draft.trim().length === 0 || sending}
                onPress={send}
                style={({ pressed }) => [
                  styles.send,
                  (draft.trim().length === 0 || sending) && styles.sendDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="arrow-up" size={19} color={scale.emerald900} />
              </Pressable>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: gutter,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  back: {
    marginLeft: -spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  list: {
    paddingHorizontal: gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  daySeparator: {
    marginVertical: spacing.lg,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderTopLeftRadius: radius.xs,
  },
  bubbleMine: {
    backgroundColor: colors.surfaceInverse,
    borderTopRightRadius: radius.xs,
  },
  stamp: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  composerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: alpha(scale.ivoryLift, 0.96),
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 42,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    ...typeScale.body,
    color: colors.textPrimary,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  sendDisabled: {
    opacity: 0.35,
  },
  pressed: {
    opacity: 0.6,
  },
});
