import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Avatar } from '../components/Avatar';
import { FilterChips } from '../components/FilterChips';
import { Stars } from '../components/Stars';
import { findProvider } from '../data/home';
import { getReviews, ratingBreakdown, timeAgo } from '../data/reviews';
import type { Review } from '../data/reviews';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

const GUTTER = 18;
const ALL = 'all';
const STAR_LEVELS = [5, 4, 3, 2, 1] as const;

export function ReviewsScreen({
  navigation,
  route,
}: RootScreenProps<'Reviews'>) {
  const insets = useSafeAreaInsets();
  const provider = findProvider(route.params.providerId);
  const [filter, setFilter] = useState<string>(ALL);

  const reviews = useMemo(
    () => (provider ? getReviews(provider) : []),
    [provider],
  );
  const breakdown = useMemo(
    () => (provider ? ratingBreakdown(provider) : null),
    [provider],
  );
  const visible = useMemo(
    () =>
      filter === ALL
        ? reviews
        : reviews.filter(r => String(r.rating) === filter),
    [reviews, filter],
  );

  if (!provider || !breakdown) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.empty}>This provider could not be found.</Text>
      </View>
    );
  }

  const maxCount = Math.max(...STAR_LEVELS.map(s => breakdown[s]), 1);
  const chips = [
    { id: ALL, label: 'All' },
    ...STAR_LEVELS.map(s => ({ id: String(s), label: `${s} ★` })),
  ];

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.review}>
      <View style={styles.reviewTop}>
        <Avatar emoji={item.avatar} size={38} background={colors.primarySoft} />
        <View style={styles.reviewMeta}>
          <Text style={styles.author}>{item.author}</Text>
          <View style={styles.reviewRating}>
            <Stars rating={item.rating} size={12} />
            <Text style={styles.date}>{timeAgo(item.daysAgo)}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Ratings & reviews</Text>
          <Text style={styles.subheading} numberOfLines={1}>
            {provider.name} · {provider.title}
          </Text>
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        renderItem={renderReview}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.summary}>
              <View style={styles.score}>
                <Text style={styles.scoreValue}>
                  {provider.rating.toFixed(1)}
                </Text>
                <Stars rating={provider.rating} size={16} />
                <Text style={styles.scoreCount}>
                  {provider.reviews} reviews
                </Text>
              </View>
              <View style={styles.bars}>
                {STAR_LEVELS.map(stars => {
                  const active = filter === String(stars);
                  return (
                    <Pressable
                      key={stars}
                      style={styles.barRow}
                      onPress={() => setFilter(active ? ALL : String(stars))}
                      accessibilityRole="button"
                      accessibilityLabel={`${stars} stars: ${breakdown[stars]} reviews`}
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={styles.barLabel}>{stars}</Text>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${(breakdown[stars] / maxCount) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.barCount}>{breakdown[stars]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <FilterChips
              chips={chips}
              selectedId={filter}
              onSelect={setFilter}
              horizontalInset={0}
            />
            <Text style={styles.showing}>
              {filter === ALL
                ? `Showing ${visible.length} most recent reviews`
                : `Showing ${visible.length} recent ${filter}-star reviews`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No recent reviews with this rating.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    experimental_backgroundImage: gradients.screen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: GUTTER,
    marginBottom: 8,
  },
  back: {
    height: 44,
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  heading: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subheading: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: GUTTER,
    gap: 12,
  },
  listHeader: {
    gap: 14,
    paddingTop: 8,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  score: {
    alignItems: 'center',
    gap: 4,
    minWidth: 92,
  },
  scoreValue: {
    fontSize: 40,
    lineHeight: 46,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  scoreCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  bars: {
    flex: 1,
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 10,
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.star,
  },
  barCount: {
    width: 28,
    textAlign: 'right',
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  showing: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  review: {
    padding: 14,
    gap: 10,
    borderRadius: 16,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewMeta: {
    flex: 1,
    gap: 2,
  },
  author: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  reviewText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
