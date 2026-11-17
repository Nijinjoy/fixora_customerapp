import { useState } from 'react';
import {
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
import { Avatar } from '../components/Avatar';
import { Toggle } from '../components/Toggle';
import { user } from '../data/home';
import type { TabScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';

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
  const [notifications, setNotifications] = useState(true);

  const comingSoon = () => {};

  const confirmLogout = () =>
    Alert.alert(
      'Log out?',
      'You will need to sign in again to book services.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive' },
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
          <Avatar emoji={user.avatar} size={64} background="#C9D3E3" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.userMeta}>
              <Phone size={13} color={colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.userMetaText}>{user.phone}</Text>
            </View>
            <View style={styles.userMeta}>
              <MapPin size={13} color={colors.textMuted} strokeWidth={1.8} />
              <Text style={styles.userMetaText}>{user.location}</Text>
            </View>
          </View>
          <Pressable
            style={styles.edit}
            onPress={comingSoon}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <Pencil size={16} color="#FFFFFF" strokeWidth={2} />
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
          <LogOut size={18} color="#E5484D" strokeWidth={2} />
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
    fontWeight: '700',
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
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userMetaText: {
    fontSize: 13,
    color: '#4B5263',
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
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
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
    fontWeight: '600',
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
    color: colors.text,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FDECEC',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5484D',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
});
