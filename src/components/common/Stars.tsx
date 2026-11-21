import { StyleSheet, View } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type Props = {
  rating: number;
  size?: number;
};

export function Stars({ rating, size = 14 }: Props) {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(i => {
        const full = i <= rounded;
        const half = !full && i - 0.5 === rounded;
        return (
          <View key={i} style={{ width: size, height: size }}>
            <Star
              size={size}
              color={full ? colors.star : colors.border}
              fill={full ? colors.star : colors.border}
              strokeWidth={0}
            />
            {half && (
              <StarHalf
                size={size}
                color={colors.star}
                fill={colors.star}
                strokeWidth={0}
                style={StyleSheet.absoluteFill}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
  },
});
