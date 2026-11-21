import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LayoutGridPlus } from 'lucide-react-native';
import type { Service } from '../../data/home';
import { colors, shadow } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const VISIBLE_COUNT = 7;

type Props = {
  services: Service[];
  onSelect: (serviceId: string) => void;
  onMore: () => void;
};

export function ServiceGrid({ services, onSelect, onMore }: Props) {
  return (
    <View style={styles.grid}>
      {services.slice(0, VISIBLE_COUNT).map(service => (
        <Pressable
          key={service.id}
          style={styles.item}
          onPress={() => onSelect(service.id)}
          accessibilityRole="button"
          accessibilityLabel={service.label}
        >
          <View style={styles.tile}>
            <Image
              source={service.image}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.label}>{service.label}</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.item}
        onPress={onMore}
        accessibilityRole="button"
        accessibilityLabel="More services"
      >
        <View style={[styles.tile, styles.iconTile]}>
          <LayoutGridPlus
            size={28}
            color={colors.primaryLight}
            fill={colors.primaryLight}
            strokeWidth={1.5}
          />
        </View>
        <Text style={styles.label}>More</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  item: {
    width: '25%',
    alignItems: 'center',
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  iconTile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  label: {
    marginTop: 8,
    paddingHorizontal: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 15,
    textAlign: 'center',
    color: colors.text,
  },
});
