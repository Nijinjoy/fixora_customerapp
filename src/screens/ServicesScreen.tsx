import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { FilterChips } from '../components/FilterChips';
import { ProviderCard } from '../components/ProviderCard';
import { providers, services } from '../data/home';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme/colors';

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
    navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home');

  const visibleProviders = useMemo(
    () =>
      selected === ALL
        ? providers
        : providers.filter(provider => provider.serviceId === selected),
    [selected],
  );

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

      <FlatList
        data={visibleProviders}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ProviderCard provider={item} />}
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
    fontWeight: '600',
    color: colors.text,
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
    color: colors.textMuted,
  },
});
