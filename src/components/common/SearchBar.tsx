import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { colors, shadow } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function SearchBar() {
  return (
    <View style={styles.row}>
      <View style={styles.input}>
        <TextInput
          placeholder="Search for any service..."
          placeholderTextColor={colors.textMuted}
          style={styles.text}
        />
        <Search size={20} color={colors.text} strokeWidth={1.8} />
      </View>
      <Pressable style={styles.filter} accessibilityLabel="Filters">
        <SlidersHorizontal size={19} color={colors.text} strokeWidth={1.8} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    boxShadow: shadow.card,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    paddingVertical: 0,
  },
  filter: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.card,
  },
});
