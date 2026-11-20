import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, Scale } from 'lucide-react-native';
import { FilterChips } from '../components/FilterChips';
import { ProviderCard } from '../components/ProviderCard';
import { priceValue, providers, services } from '../data/home';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';

const ALL = 'all';
const GUTTER = 18;

const chips = [
  { id: ALL, label: 'All' },
  ...services.map(service => ({ id: service.id, label: service.label })),
];

export function ServicesScreen({
  navigation,
  route,
}: RootScreenProps<'Services'>) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(route.params?.serviceId ?? ALL);

  const goBack = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Tabs', { screen: 'Home' });

  const visibleProviders = useMemo(
    () =>
      selected === ALL
        ? providers
        : providers.filter(provider => provider.serviceId === selected),
    [selected],
  );

  const priceRange = useMemo(() => {
    if (selected === ALL || visibleProviders.length < 2) {
      return null;
    }
    const prices = visibleProviders.map(priceValue);
    const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
    return `${fmt(Math.min(...prices))} – ${fmt(Math.max(...prices))}`;
  }, [selected, visibleProviders]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Most Popular Services</Text>
      </View>

      <FilterChips
        chips={chips}
        selectedId={selected}
        onSelect={setSelected}
        horizontalInset={GUTTER}
      />

      {priceRange && (
        <Pressable
          style={({ pressed }) => [
            styles.compare,
            pressed && styles.comparePressed,
          ]}
          onPress={() =>
            navigation.navigate('ComparePrices', { serviceId: selected })
          }
          accessibilityRole="button"
          accessibilityLabel={`Compare prices, ${priceRange}`}
        >
          <View style={styles.compareIcon}>
            <Scale size={18} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.compareInfo}>
            <Text style={styles.compareTitle}>
              Compare {visibleProviders.length} technicians
            </Text>
            <Text style={styles.compareRange}>Prices from {priceRange}</Text>
          </View>
          <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
        </Pressable>
      )}

      <FlatList
        data={visibleProviders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProviderCard
            provider={item}
            onViewProfile={providerId =>
              navigation.navigate('Profile', { providerId })
            }
            onBook={providerId =>
              navigation.navigate('BookService', { providerId })
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No providers for this service yet.</Text>
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
    marginBottom: 18,
  },
  back: {
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  compare: {
    marginHorizontal: GUTTER,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
  },
  comparePressed: {
    backgroundColor: colors.primarySoft,
  },
  compareIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareInfo: {
    flex: 1,
  },
  compareTitle: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  compareRange: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: 18,
    gap: 16,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
