import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { colors, shadow } from '../theme/colors';

type Props = {
  name: string;
  avatar: string;
  unread: number;
};

export function HomeHeader({ name, avatar, unread }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.user}>
        <Avatar emoji={avatar} size={46} background="#C9D3E3" />
        <View>
          <Text style={styles.hello}>Hello👋</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
      </View>
      <Pressable style={styles.bell} accessibilityLabel="Notifications">
        <Bell size={20} color={colors.text} strokeWidth={1.8} />
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
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
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hello: {
    fontSize: 13,
    color: colors.textMuted,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 2,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadow.card,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
