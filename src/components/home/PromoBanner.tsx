import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarCheck } from 'lucide-react-native';
import { colors, gradients } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function PromoBanner({ onBook }: { onBook: () => void }) {
  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Text style={styles.kicker}>Save 25% Today!</Text>
        <Text style={styles.title}>Exclusive discounts on home service</Text>
        <Pressable
          style={styles.button}
          onPress={onBook}
          accessibilityRole="button"
          accessibilityLabel="Book a service"
        >
          <CalendarCheck size={15} color={colors.onPrimary} strokeWidth={2} />
          <Text style={styles.buttonText}>Book Now</Text>
        </Pressable>
      </View>
      <View style={styles.art} pointerEvents="none">
        <Text style={styles.worker}>👷🏻‍♂️</Text>
        <Text style={styles.toolbox}>🧰</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    height: 152,
    borderRadius: 18,
    overflow: 'hidden',
    experimental_backgroundImage: gradients.banner,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.accent,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.text,
    lineHeight: 24,
    marginTop: 6,
    maxWidth: 170,
  },
  button: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 10,
    experimental_backgroundImage: gradients.accentButton,
  },
  buttonText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  art: {
    width: 130,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  worker: {
    fontSize: 104,
    fontFamily: fonts.regular,
    lineHeight: 128,
    marginBottom: -10,
  },
  toolbox: {
    position: 'absolute',
    right: 8,
    bottom: 10,
    fontSize: 36,
    fontFamily: fonts.regular,
  },
});
