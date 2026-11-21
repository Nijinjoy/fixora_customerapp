import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  CalendarDays,
  House,
  type LucideIcon,
  MessageSquareText,
  UserRound,
} from 'lucide-react-native';
import { colors, gradients, shadow } from '../../theme/colors';

const tabMeta: Record<string, { Icon: LucideIcon; label: string }> = {
  Home: { Icon: House, label: 'Home' },
  Messages: { Icon: MessageSquareText, label: 'Messages' },
  Bookings: { Icon: CalendarDays, label: 'Bookings' },
  Account: { Icon: UserRound, label: 'Profile' },
};

export function BottomNav({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const meta = tabMeta[route.name];
          if (!meta) {
            return null;
          }
          const { Icon, label } = meta;
          const isActive = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive ? styles.active : styles.inactive]}
            >
              <Icon
                size={22}
                color={isActive ? colors.onPrimary : colors.primary}
                fill={isActive ? colors.onPrimary : 'transparent'}
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
