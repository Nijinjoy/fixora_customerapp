import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BadgeIndianRupee,
  Star,
  ThumbsUp,
} from 'lucide-react-native';
import { Avatar } from '../components/Avatar';
import { FilterChips } from '../components/FilterChips';
import { priceValue, providers, services } from '../data/home';
import type { Provider } from '../data/home';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

const GUTTER = 18;

type SortKey = 'price' | 'rating' | 'value';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'price', label: 'Lowest price' },
  { id: 'rating', label: 'Top rated' },
  { id: 'value', label: 'Best value' },
];

const rupees = (value: number) =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;

/** Rating per ₹100 — higher means more quality for the money. */
const valueScore = (p: Provider) => p.rating / (priceValue(p) / 100);

export function ComparePricesScreen({
  navigation,
  route,
}: RootScreenProps<'ComparePrices'>) {
  const { serviceId } = route.params;
  const insets = useSafeAreaInsets();
  const [sort, setSort] = useState<SortKey>('price');

  const service = services.find(s => s.id === serviceId);
  const list = useMemo(
    () => providers.filter(p => p.serviceId === serviceId),
    [serviceId],
  );

  const stats = useMemo(() => {
    const prices = list.map(priceValue);
    const byValue = [...list].sort((a, b) => valueScore(b) - valueScore(a));
    const byRating = [...list].sort(
      (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    );
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, p) => sum + p, 0) / (prices.length || 1),
      cheapestId: list.find(p => priceValue(p) === Math.min(...prices))?.id,
      topRatedId: byRating[0]?.id,
      bestValueId: byValue[0]?.id,
    };
  }, [list]);

  const sorted = useMemo(() => {
    const copy = [...list];
    if (sort === 'price') {
      copy.sort((a, b) => priceValue(a) - priceValue(b));
    } else if (sort === 'rating') {
      copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else {
      copy.sort((a, b) => valueScore(b) - valueScore(a));
    }
    return copy;
  }, [list, sort]);

  const unit = list[0]?.unit ?? '/visit';

  const renderItem = ({ item }: { item: Provider }) => {
    const price = priceValue(item);
    const diff = price - stats.avg;
    const barWidth = stats.max > 0 ? Math.max(0.12, price / stats.max) : 1;
    const badges = [
      item.id === stats.cheapestId && {
        key: 'cheap',
        label: 'Lowest price',
        Icon: BadgeIndianRupee,
        color: colors.success,
        bg: '#E3F6EA',
      },
      item.id === stats.topRatedId && {
        key: 'top',
        label: 'Top rated',
        Icon: Star,
        color: '#B7791F',
        bg: '#FFF4D6',
      },
      item.id === stats.bestValueId && {
        key: 'value',
        label: 'Best value',
        Icon: ThumbsUp,
        color: colors.primary,
        bg: colors.primarySoft,
      },
    ].filter(Boolean) as {
      key: string;
      label: string;
      Icon: typeof Star;
      color: string;
      bg: string;
    }[];

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Avatar
            emoji={item.avatar}
            size={46}
            background={item.avatarBg}
            verified
          />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Pressable
              style={styles.rating}
              onPress={() =>
                navigation.navigate('Reviews', { providerId: item.id })
              }
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`See reviews for ${item.name}`}
            >
              <Star
                size={13}
                color={colors.star}
                fill={colors.star}
                strokeWidth={0}
              />
              <Text style={styles.ratingText}>
                {item.rating} ({item.reviews})
              </Text>
              <Text style={styles.reviewsLink}>Reviews</Text>
            </Pressable>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.price}>
              {item.price}
              <Text style={styles.unit}>{item.unit ?? ''}</Text>
            </Text>
            <Text
              style={[
                styles.diff,
                diff < 0 ? styles.diffLow : diff > 0 ? styles.diffHigh : null,
              ]}
            >
              {Math.abs(diff) < 1
                ? 'Average'
                : `${rupees(Math.abs(diff))} ${
                    diff < 0 ? 'below' : 'above'
                  } avg`}
            </Text>
          </View>
        </View>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${barWidth * 100}%` }]} />
        </View>

        {badges.length > 0 && (
          <View style={styles.badges}>
            {badges.map(({ key, label, Icon, color, bg }) => (
              <View key={key} style={[styles.badge, { backgroundColor: bg }]}>
                <Icon size={12} color={color} strokeWidth={2.2} />
                <Text style={[styles.badgeText, { color }]}>{label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            style={styles.outline}
            onPress={() =>
              navigation.navigate('Profile', { providerId: item.id })
            }
            accessibilityRole="button"
            accessibilityLabel={`View ${item.name}`}
          >
            <Text style={styles.outlineText}>View profile</Text>
          </Pressable>
          <Pressable
            style={styles.primary}
            onPress={() =>
              navigation.navigate('BookService', { providerId: item.id })
            }
            accessibilityRole="button"
            accessibilityLabel={`Book ${item.name}`}
          >
            <Text style={styles.primaryText}>Book</Text>
          </Pressable>
        </View>
      </View>
    );
  };

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
        <View>
          <Text style={styles.heading}>Compare prices</Text>
          <Text style={styles.subheading}>
            {service?.label ?? 'Service'} · {list.length} technicians
          </Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.summary}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Lowest</Text>
                <Text style={[styles.statValue, styles.statLow]}>
                  {rupees(stats.min)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Average</Text>
                <Text style={styles.statValue}>{rupees(stats.avg)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Highest</Text>
                <Text style={styles.statValue}>{rupees(stats.max)}</Text>
              </View>
            </View>
            <Text style={styles.unitNote}>
              Prices are {unit.replace('/', 'per ')}
            </Text>
            <FilterChips
              chips={SORTS}
              selectedId={sort}
              onSelect={id => setSort(id as SortKey)}
              horizontalInset={0}
            />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No technicians for this service yet.</Text>
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
    gap: 14,
  },
  listHeader: {
    gap: 12,
    paddingTop: 8,
    marginBottom: 2,
  },
  summary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    boxShadow: shadow.card,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  statValue: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  statLow: {
    color: colors.success,
  },
  unitNote: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    boxShadow: shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 1,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  title: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  reviewsLink: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.primary,
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  unit: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  diff: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  diffLow: {
    color: colors.success,
  },
  diffHigh: {
    color: colors.accent,
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    experimental_backgroundImage: gradients.primaryButton,
    backgroundColor: colors.primary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  outline: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  primary: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: gradients.primaryButton,
    backgroundColor: colors.primary,
  },
  primaryText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: '#FFFFFF',
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
