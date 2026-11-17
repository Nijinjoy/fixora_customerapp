import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeHeader } from '../components/HomeHeader';
import { PromoBanner } from '../components/PromoBanner';
import { ProviderCard } from '../components/ProviderCard';
import { SearchBar } from '../components/SearchBar';
import { SectionHeader } from '../components/SectionHeader';
import { ServiceGrid } from '../components/ServiceGrid';
import { popularProviders, services, user } from '../data/home';
import type { TabScreenProps } from '../navigation/types';
import { gradients } from '../theme/colors';

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const openServices = (serviceId?: string) =>
    navigation.navigate('Services', serviceId ? { serviceId } : undefined);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HomeHeader
          name={user.name}
          avatar={user.avatar}
          unread={user.unreadNotifications}
        />
        <SearchBar />
        <PromoBanner />

        <View style={styles.section}>
          <SectionHeader
            title="Most Booked Services"
            onViewAll={() => openServices()}
          />
          <ServiceGrid
            services={services}
            onSelect={openServices}
            onMore={() => openServices()}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Popular Near You"
            onViewAll={() => openServices()}
          />
          {popularProviders.map(provider => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onViewProfile={providerId =>
                navigation.navigate('Profile', { providerId })
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    experimental_backgroundImage: gradients.screen,
  },
  content: {
    paddingHorizontal: 18,
    gap: 20,
  },
  section: {
    gap: 16,
  },
});
