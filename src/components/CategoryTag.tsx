import { StyleSheet, Text, View } from 'react-native';
import { gradients } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function CategoryTag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    experimental_backgroundImage: gradients.accentButton,
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: '#FFFFFF',
  },
});
