import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bookmark,
  CalendarCheck,
  MapPin,
  MessageSquareText,
  Star,
} from 'lucide-react-native';
import { CategoryTag } from '../components/CategoryTag';
import { SectionHeader } from '../components/SectionHeader';
import { findProvider } from '../data/home';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';

const GUTTER = 20;

export function ProfileScreen({
  navigation,
  route,
}: RootScreenProps<'Profile'>) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const provider = findProvider(route.params.providerId);

  const goBack = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Tabs', { screen: 'Home' });

  if (!provider) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top }]}>
        <Text style={styles.about}>This provider could not be found.</Text>
      </View>
    );
  }

  const priceNote = provider.unit
    ? `(per ${provider.unit.replace('/', '')})`
    : '(per visit)';

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.heroBar}>
            <Pressable
              onPress={goBack}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
            >
              <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
            </Pressable>
            <Pressable
              onPress={() => setSaved(value => !value)}
              style={styles.bookmark}
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remove from saved' : 'Save provider'}
              accessibilityState={{ selected: saved }}
            >
              <Bookmark
                size={20}
                color={saved ? colors.primary : colors.text}
                fill={saved ? colors.primary : 'transparent'}
                strokeWidth={1.8}
              />
            </Pressable>
          </View>
          <Text style={styles.portrait}>{provider.avatar}</Text>
        </View>

        <View style={styles.sheet}>
          <View style={styles.nameRow}>
            <View style={styles.nameGroup}>
              <Text style={styles.name}>{provider.name}</Text>
              <CategoryTag label={provider.category} />
            </View>
            <View style={styles.rating}>
              <Star
                size={16}
                color={colors.star}
                fill={colors.star}
                strokeWidth={0}
              />
              <Text style={styles.ratingText}>
                {provider.rating} ({provider.reviews})
              </Text>
            </View>
          </View>

          <View style={styles.location}>
            <MapPin size={15} color={colors.textMuted} strokeWidth={1.8} />
            <Text style={styles.muted}>{provider.location}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>{provider.price}</Text>
            <Text style={styles.muted}>{priceNote}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.heading}>About Me</Text>
          <Text style={styles.about}>{provider.about}</Text>

          <View style={styles.gallery}>
            <SectionHeader title="Gallery" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryRow}
            >
              {provider.gallery.map((source, index) => (
                <Image
                  key={index}
                  source={source}
                  style={styles.photo}
                  resizeMode="cover"
                  accessibilityLabel={`${provider.category} work photo ${
                    index + 1
                  }`}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View
        style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Pressable
          style={[styles.button, styles.outline]}
          onPress={() =>
            navigation.navigate('Chat', { providerId: provider.id })
          }
          accessibilityRole="button"
          accessibilityLabel={`Message ${provider.name}`}
        >
          <MessageSquareText size={18} color={colors.text} strokeWidth={1.8} />
          <Text style={styles.outlineText}>Message</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primary]}>
          <CalendarCheck size={18} color="#FFFFFF" strokeWidth={1.8} />
          <Text style={styles.primaryText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  hero: {
    height: 360,
    experimental_backgroundImage:
      'linear-gradient(180deg, #DCD6F7 0%, #D7E3FA 60%, #E9F0FC 100%)',
    paddingHorizontal: GUTTER,
    alignItems: 'center',
  },
  heroBar: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    height: 44,
    justifyContent: 'center',
  },
  bookmark: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.card,
  },
  portrait: {
    marginTop: 'auto',
    marginBottom: 6,
    fontSize: 190,
    lineHeight: 230,
  },
  sheet: {
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: GUTTER,
    paddingTop: 24,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  nameGroup: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  muted: {
    fontSize: 13,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 14,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },
  heading: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  about: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  gallery: {
    marginTop: 24,
    gap: 14,
  },
  galleryRow: {
    gap: 12,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 14,
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingTop: 14,
    backgroundColor: colors.surface,
    boxShadow: '0px -6px 20px rgba(31, 52, 102, 0.08)',
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  outlineText: {
    fontSize: 15,
    color: colors.text,
  },
  primary: {
    experimental_backgroundImage: gradients.primaryButton,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
