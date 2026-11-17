import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  onViewAll?: () => void;
};

export function SectionHeader({ title, onViewAll }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onViewAll} hitSlop={8}>
        <Text style={styles.link}>View all</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  link: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
