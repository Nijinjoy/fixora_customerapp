import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarCheck, Eye, Star } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { CategoryTag } from './CategoryTag';
import type { Provider } from '../data/home';
import { colors, gradients, shadow } from '../theme/colors';

type Props = {
  provider: Provider;
  onViewProfile: (providerId: string) => void;
};

export function ProviderCard({ provider, onViewProfile }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Avatar
          emoji={provider.avatar}
          size={50}
          background={provider.avatarBg}
          verified
        />
        <View style={styles.info}>
          <Text style={styles.title}>{provider.title}</Text>
          <Text style={styles.price}>
            {provider.price}
            {provider.unit && <Text style={styles.unit}>{provider.unit}</Text>}
          </Text>
          <View style={styles.rating}>
            <Star
              size={14}
              color={colors.star}
              fill={colors.star}
              strokeWidth={0}
            />
            <Text style={styles.ratingText}>
              {provider.rating} ({provider.reviews} reviews)
            </Text>
          </View>
        </View>
        <CategoryTag label={provider.category} />
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.outline]}
          onPress={() => onViewProfile(provider.id)}
          accessibilityRole="button"
          accessibilityLabel={`View ${provider.name}'s profile`}
        >
          <Eye size={15} color={colors.text} strokeWidth={1.8} />
          <Text style={styles.outlineText}>View Profile</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.primary]}>
          <CalendarCheck size={15} color="#FFFFFF" strokeWidth={1.8} />
          <Text style={styles.primaryText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    boxShadow: shadow.card,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  unit: {
    fontWeight: '400',
  },
  rating: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  outlineText: {
    fontSize: 13,
    color: colors.text,
  },
  primary: {
    experimental_backgroundImage: gradients.primaryButton,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});
