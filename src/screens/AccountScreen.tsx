import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Bookmark,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Languages,
  LogOut,
  type LucideIcon,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { Avatar } from '../components/common/Avatar';
import { Toggle } from '../components/common/Toggle';
import { user } from '../data/home';
import {
  locationLabel,
  locationNeedsAction,
  useCurrentLocation,
} from '../services/currentLocation';
import type { TabScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useSessionStore } from '../store/sessionStore';

const GUTTER = 18;

type RowProps = {
  Icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  last?: boolean;
};

function MenuRow({ Icon, label, value, onPress, right, last }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
    >
      <View style={styles.rowIcon}>
        <Icon size={18} color={colors.primary} strokeWidth={1.9} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right ?? (
        <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.8} />
      )}
    </Pressable>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function AccountScreen({ navigation }: TabScreenProps<'Account'>) {
  const insets = useSafeAreaInsets();
  const location = useCurrentLocation();
  const locationText = locationLabel(location.state);
  const locationIsAction = locationNeedsAction(location.state);
  const [notifications, setNotifications] = useState(true);

  const comingSoon = () => {};

  const signOut = useSessionStore(s => s.signOut);

  const confirmLogout = () =>
    Alert.alert(
      'Log out?',
      'You will need to sign in again to book services.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: signOut },
      ],
    );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 110 },
        ]}
      >
        <View style={styles.userCard}>
          <Avatar emoji={user.avatar} size={64} background={colors.primarySoft} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.userMeta}>
              <Phone size={13} color={colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.userMetaText}>{user.phone}</Text>
            </View>
            <Pressable
              style={styles.userMeta}
              onPress={
                location.state.status === 'ready'
                  ? location.refresh
                  : location.retry
              }
              disabled={location.state.status === 'loading'}
              accessibilityRole="button"
              accessibilityLabel={`Current location: ${locationText}`}
            >
              {location.state.status === 'loading' ? (
                <ActivityIndicator
                  size="small"
                  color={colors.textMuted}
                  style={styles.locationSpinner}
                />
              ) : (
                <MapPin
                  size={13}
                  color={locationIsAction ? colors.primary : colors.textMuted}
                  strokeWidth={1.8}
                />
              )}
              <Text
                style={[
                  styles.userMetaText,
                  styles.locationText,
                  locationIsAction && styles.locationAction,
                ]}
                numberOfLines={1}
              >
                {locationText}
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.edit}
            onPress={comingSoon}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Pencil size={16} color={colors.onPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.stats}>
          <Pressable
            style={styles.stat}
            onPress={() => navigation.navigate('Bookings')}
            accessibilityRole="button"
          >
            <Text style={styles.statValue}>{user.stats.bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </Pressable>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.stats.saved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.stats.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <Section title="Account">
          <MenuRow
            Icon={UserRound}
            label="Personal details"
            onPress={comingSoon}
          />
          <MenuRow Icon={MapPin} label="Saved addresses" onPress={comingSoon} />
          <MenuRow
            Icon={Bookmark}
            label="Saved providers"
            onPress={comingSoon}
          />
          <MenuRow
            Icon={CreditCard}
            label="Payment methods"
            value="UPI"
            onPress={comingSoon}
            last
          />
        </Section>

        <Section title="Preferences">
          <MenuRow
            Icon={Bell}
            label="Notifications"
            right={
              <Toggle
                value={notifications}
                onValueChange={setNotifications}
                accessibilityLabel="Notifications"
              />
            }
          />
          <MenuRow
            Icon={Languages}
            label="Language"
            value="English"
            onPress={comingSoon}
            last
          />
        </Section>

        <Section title="Support">
          <MenuRow
            Icon={CircleHelp}
            label="Help & support"
            onPress={comingSoon}
          />
          <MenuRow
            Icon={ShieldCheck}
            label="Privacy policy"
            onPress={comingSoon}
          />
          <MenuRow
            Icon={FileText}
            label="Terms & conditions"
            onPress={comingSoon}
            last
          />
        </Section>

        <Pressable
          style={styles.logout}
          onPress={confirmLogout}
          accessibilityRole="button"
        >
          <LogOut size={18} color={colors.danger} strokeWidth={2} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>Fixora · Version 0.0.1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    experimental_backgroundImage: gradients.screen,
  },
  header: {
    paddingHorizontal: GUTTER,
    paddingBottom: 12,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 6,
    gap: 18,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    experimental_backgroundImage: gradients.banner,
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    flexShrink: 1,
  },
  locationAction: {
    color: colors.primary,
    fontFamily: fonts.medium,
  },
  locationSpinner: {
    transform: [{ scale: 0.6 }],
    width: 13,
    height: 13,
  },
  userMetaText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  edit: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    experimental_backgroundImage: gradients.accentButton,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  card: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    boxShadow: shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.danger,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
