import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeHeader } from '../components/home/HomeHeader';
import { PromoBanner } from '../components/home/PromoBanner';
import { ProviderCard } from '../components/provider/ProviderCard';
import { SearchBar } from '../components/common/SearchBar';
import { SectionHeader } from '../components/common/SectionHeader';
import { ServiceGrid } from '../components/home/ServiceGrid';
import { popularProviders, services, user } from '../data/home';
import type { TabScreenProps } from '../navigation/types';
import { colors, gradients } from '../theme/colors';

export function HomeScreen({ navigation, route }: TabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);
  const openServices = (serviceId?: string) =>
    navigation.navigate('Services', serviceId ? { serviceId } : undefined);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
          scrolled && styles.headerScrolled,
        ]}
      >
        <HomeHeader
          unread={user.unreadNotifications}
          selected={route.params?.location}
          onPickLocation={initial =>
            navigation.navigate('LocationPicker', { initial })
          }
        />
      </View>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={e => setScrolled(e.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={32}
      >
        <SearchBar />
        <PromoBanner onBook={() => navigation.navigate('Services')} />

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
              onBook={providerId =>
                navigation.navigate('BookService', { providerId })
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
  header: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    zIndex: 1,
  },
  headerScrolled: {
    backgroundColor: colors.background,
    boxShadow: '0px 6px 12px -8px rgba(1, 80, 78, 0.25)',
  },
  content: {
    paddingTop: 8,
    paddingHorizontal: 18,
    gap: 20,
  },
  section: {
    gap: 16,
  },
});
