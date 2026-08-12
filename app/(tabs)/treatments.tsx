import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TreatmentCard } from '@/components/domain';
import {
  Chip,
  ChipRow,
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeader,
  Text,
} from '@/components/ui';
import { useAsyncData } from '@/hooks/useAsyncData';
import { api } from '@/services';
import { colors, gutter, radius, spacing, tabScrollInset, typeScale } from '@/theme';
import type { TreatmentCategory } from '@/types/models';
import { CATEGORY_LABELS } from '@/utils/format';

type Filter = 'all' | TreatmentCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'skin', label: CATEGORY_LABELS.skin },
  { key: 'aesthetics', label: CATEGORY_LABELS.aesthetics },
  { key: 'longevity', label: CATEGORY_LABELS.longevity },
  { key: 'wellness', label: CATEGORY_LABELS.wellness },
  { key: 'body', label: CATEGORY_LABELS.body },
];

/** Treatments catalogue — searchable, category-filtered, signature rail on top. */
export default function TreatmentsRoute() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const treatments = useAsyncData(() => api.treatments.list(), []);

  const signature = useMemo(
    () => treatments.data?.filter((t) => t.isSignature) ?? [],
    [treatments.data],
  );

  const results = useMemo(() => {
    const all = treatments.data ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((t) => {
      const matchesFilter = filter === 'all' || t.category === filter;
      const matchesQuery =
        q.length === 0 ||
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        CATEGORY_LABELS[t.category].toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [treatments.data, query, filter]);

  const onRefresh = useCallback(() => void treatments.reload(true), [treatments]);
  const isSearching = query.trim().length > 0 || filter !== 'all';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={treatments.refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
        >
          <View style={styles.header}>
            <Text variant="eyebrow" tone="gold">
              The collection
            </Text>
            <Text variant="display" style={styles.title}>
              Treatments
            </Text>

            <View style={styles.search}>
              <Feather name="search" size={17} color={colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search rituals and protocols"
                placeholderTextColor={colors.textTertiary}
                autoCorrect={false}
                returnKeyType="search"
                selectionColor={colors.accent}
                accessibilityLabel="Search treatments"
              />
              {query.length > 0 ? (
                <Feather
                  name="x"
                  size={16}
                  color={colors.textTertiary}
                  onPress={() => setQuery('')}
                  suppressHighlighting
                />
              ) : null}
            </View>
          </View>

          <View style={styles.filters}>
            <ChipRow>
              {FILTERS.map((f) => (
                <Chip
                  key={f.key}
                  label={f.label}
                  selected={filter === f.key}
                  onPress={() => setFilter(f.key)}
                />
              ))}
            </ChipRow>
          </View>

          {treatments.loading ? (
            <LoadingState label="Loading the collection" />
          ) : treatments.error ? (
            <View style={styles.body}>
              <ErrorState
                message={treatments.error.message}
                onRetry={() => void treatments.reload()}
              />
            </View>
          ) : (
            <>
              {/* Signature rail — hidden while searching so results lead. */}
              {!isSearching && signature.length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.body}>
                    <SectionHeader eyebrow="Most requested" title="Signature rituals" />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.railContent}
                  >
                    {signature.map((treatment) => (
                      <TreatmentCard
                        key={treatment.id}
                        treatment={treatment}
                        layout="poster"
                        onPress={() => router.push(`/treatments/${treatment.id}`)}
                      />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              <View style={[styles.body, styles.section]}>
                <SectionHeader
                  eyebrow={isSearching ? 'Results' : 'Full collection'}
                  title={
                    isSearching
                      ? `${results.length} treatment${results.length === 1 ? '' : 's'}`
                      : 'Every protocol'
                  }
                />

                {results.length === 0 ? (
                  <EmptyState
                    icon="search"
                    title="Nothing matches that"
                    body="Try a different search, or browse the full collection."
                    actionLabel="Clear filters"
                    onAction={() => {
                      setQuery('');
                      setFilter('all');
                    }}
                  />
                ) : (
                  results.map((treatment) => (
                    <TreatmentCard
                      key={treatment.id}
                      treatment={treatment}
                      onPress={() => router.push(`/treatments/${treatment.id}`)}
                    />
                  ))
                )}
              </View>
            </>
          )}
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
  },
  title: {
    marginTop: spacing.md,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typeScale.body,
    color: colors.textPrimary,
    padding: 0,
    includeFontPadding: false,
  },
  filters: {
    paddingHorizontal: gutter,
    marginTop: spacing.lg,
  },
  body: {
    paddingHorizontal: gutter,
  },
  section: {
    marginTop: spacing.xxl,
  },
  railContent: {
    paddingHorizontal: gutter,
    paddingVertical: spacing.xs,
  },
});
