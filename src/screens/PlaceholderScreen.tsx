import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients } from '../theme/colors';

type Props = {
  title: string;
  message: string;
};

export function PlaceholderScreen({ title, message }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.center}>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    experimental_backgroundImage: gradients.screen,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
