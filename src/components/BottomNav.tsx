import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  CalendarDays,
  House,
  MessageSquareText,
  UserRound,
} from 'lucide-react-native';
import { colors, gradients, shadow } from '../theme/colors';

const tabs = [
  { key: 'home', Icon: House, label: 'Home' },
  { key: 'messages', Icon: MessageSquareText, label: 'Messages' },
  { key: 'bookings', Icon: CalendarDays, label: 'Bookings' },
  { key: 'profile', Icon: UserRound, label: 'Profile' },
] as const;

type Props = {
  bottomInset: number;
};

export function BottomNav({ bottomInset }: Props) {
  const [active, setActive] = useState<string>('home');

  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(bottomInset, 12) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {tabs.map(({ key, Icon, label }) => {
          const isActive = key === active;
          return (
            <Pressable
              key={key}
              onPress={() => setActive(key)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive ? styles.active : styles.inactive]}
            >
              <Icon
                size={22}
                color={isActive ? '#FFFFFF' : colors.primary}
                fill={isActive ? '#FFFFFF' : 'transparent'}
                strokeWidth={isActive ? 1.6 : 1.8}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: 10,
    padding: 8,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    boxShadow: shadow.nav,
  },
  tab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    experimental_backgroundImage: gradients.primaryButton,
    boxShadow: shadow.fab,
  },
  inactive: {
    backgroundColor: colors.primarySoft,
  },
});
