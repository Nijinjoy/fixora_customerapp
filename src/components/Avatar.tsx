import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '../theme/colors';

type Props = {
  emoji: string;
  size?: number;
  background?: string;
  verified?: boolean;
};

export function Avatar({
  emoji,
  size = 44,
  background = '#DCE8F7',
  verified = false,
}: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: background,
          },
        ]}
      >
        <Text style={{ fontSize: size * 0.6 }}>{emoji}</Text>
      </View>
      {verified && (
        <View style={styles.badge}>
          <Check size={9} color="#FFFFFF" strokeWidth={4} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
