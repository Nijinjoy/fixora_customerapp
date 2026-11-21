import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  CalendarX2,
  Clock,
  MapPin,
  MessageSquareText,
  RotateCcw,
  Star,
} from 'lucide-react-native';
import { Avatar } from '../components/common/Avatar';
import { FilterChips, type Chip } from '../components/common/FilterChips';
import {
  type Booking,
  type BookingStatus,
  cancelBooking,
  formatBookingDates,
  rateBooking,
  useBookings,
} from '../data/bookings';
import { formatClock } from '../data/messages';
import { findProvider, type Provider } from '../data/home';
import type { TabScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

const GUTTER = 18;

const TABS: Chip[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const EMPTY: Record<BookingStatus, string> = {
  upcoming: 'No upcoming bookings. Find a pro and book a service.',
  completed: 'Completed jobs will show up here.',
  cancelled: 'No cancelled bookings.',
};

type StatusStyle = { label: string; color: string; background: string };

function statusStyle(booking: Booking): StatusStyle {
  switch (booking.status) {
    case 'upcoming':
      return booking.confirmed
        ? {
            label: 'Confirmed',
            color: colors.primary,
            background: colors.primarySoft,
          }
        : { label: 'Pending', color: colors.accent, background: colors.accentSoft };
    case 'completed':
      return { label: 'Completed', color: colors.successText, background: colors.successSoft };
    case 'cancelled':
      return { label: 'Cancelled', color: colors.dangerText, background: colors.dangerSoft };
  }
}

export function BookingsScreen({
  navigation,
  route,
}: TabScreenProps<'Bookings'>) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<BookingStatus>('upcoming');
  const bookings = useBookings();
  const requestedTab = route.params?.tab;

  useEffect(() => {
    if (requestedTab) {
      setTab(requestedTab);
      navigation.setParams({ tab: undefined });
    }
  }, [requestedTab, navigation]);

  const rows = useMemo(
    () =>
      bookings
        .filter(booking => booking.status === tab)
        .flatMap(booking => {
          const provider = findProvider(booking.providerId);
          return provider ? [{ booking, provider }] : [];
        })
        .sort((a, b) =>
          tab === 'upcoming'
            ? a.booking.scheduledAt - b.booking.scheduledAt
            : b.booking.scheduledAt - a.booking.scheduledAt,
        ),
    [bookings, tab],
  );

  const confirmCancel = (booking: Booking, provider: Provider) =>
    Alert.alert(
      'Cancel booking?',
      `${booking.service} with ${provider.name} on ${formatBookingDates(
        booking.scheduledAt,
        booking.days,
      )} will be cancelled.`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => cancelBooking(booking.id),
        },
      ],
    );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookings</Text>
      </View>

      <View style={styles.tabs}>
        <FilterChips
          chips={TABS}
          selectedId={tab}
          onSelect={id => setTab(id as BookingStatus)}
          horizontalInset={GUTTER}
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={row => row.booking.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: { booking, provider } }) => {
          const status = statusStyle(booking);
          return (
            <Pressable
              style={styles.card}
              onPress={() =>
                navigation.navigate('Profile', { providerId: provider.id })
              }
              accessibilityRole="button"
              accessibilityLabel={`${booking.service} with ${provider.name}, ${status.label}`}
            >
              <View style={styles.cardTop}>
                <Avatar
                  emoji={provider.avatar}
                  size={48}
                  background={provider.avatarBg}
                  verified
                />
                <View style={styles.cardTitle}>
                  <Text style={styles.service} numberOfLines={1}>
                    {booking.service}
                  </Text>
                  <Text style={styles.provider} numberOfLines={1}>
                    {provider.name} · {provider.category}
                  </Text>
                </View>
                <View
                  style={[
                    styles.status,
                    { backgroundColor: status.background },
                  ]}
                >
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.details,
                  booking.status === 'cancelled' && styles.detailsMuted,
                ]}
              >
                <View style={styles.detailRow}>
                  <View style={styles.detail}>
                    <CalendarDays
                      size={15}
                      color={colors.primary}
                      strokeWidth={1.8}
                    />
                    <Text style={styles.detailText}>
                      {formatBookingDates(booking.scheduledAt, booking.days)}
                    </Text>
                  </View>
                  <View style={styles.detail}>
                    <Clock size={15} color={colors.primary} strokeWidth={1.8} />
                    <Text style={styles.detailText}>
                      {formatClock(booking.scheduledAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.detail}>
                  <MapPin size={15} color={colors.primary} strokeWidth={1.8} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {booking.address}
                  </Text>
                </View>
              </View>

              <View style={styles.footer}>
                <View>
                  <Text style={styles.amountLabel}>
                    {booking.status === 'completed' ? 'Paid' : 'Estimate'}
                  </Text>
                  <Text style={styles.amount}>{booking.amount}</Text>
                </View>

                <View style={styles.actions}>
                  {booking.status === 'upcoming' && (
                    <>
                      <IconButton
                        label={`Cancel booking with ${provider.name}`}
                        onPress={() => confirmCancel(booking, provider)}
                      >
                        <CalendarX2
                          size={18}
                          color={colors.textMuted}
                          strokeWidth={1.8}
                        />
                      </IconButton>
                      <PrimaryButton
                        label="Message"
                        onPress={() =>
                          navigation.navigate('Chat', {
                            providerId: provider.id,
                          })
                        }
                        icon={
                          <MessageSquareText
                            size={16}
                            color={colors.onPrimary}
                            strokeWidth={1.8}
                          />
                        }
                      />
                    </>
                  )}

                  {booking.status === 'completed' &&
                    (booking.rating ? (
                      <Stars value={booking.rating} />
                    ) : (
                      <RatePrompt
                        onRate={value => rateBooking(booking.id, value)}
                      />
                    ))}

                  {booking.status !== 'upcoming' && (
                    <PrimaryButton
                      label="Rebook"
                      onPress={() =>
                        navigation.navigate('Profile', {
                          providerId: provider.id,
                        })
                      }
                      icon={
                        <RotateCcw
                          size={16}
                          color={colors.onPrimary}
                          strokeWidth={1.8}
                        />
                      }
                    />
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <CalendarDays
                size={30}
                color={colors.primary}
                strokeWidth={1.6}
              />
            </View>
            <Text style={styles.emptyText}>{EMPTY[tab]}</Text>
            {tab === 'upcoming' && (
              <PrimaryButton
                label="Browse services"
                onPress={() => navigation.navigate('Services')}
              />
            )}
          </View>
        }
      />
    </View>
  );
}

function PrimaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      style={styles.primaryButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function IconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      style={styles.iconButton}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
    >
      {children}
    </Pressable>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <View style={styles.stars} accessibilityLabel={`You rated ${value} stars`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={14}
          color={colors.star}
          fill={n <= value ? colors.star : 'transparent'}
          strokeWidth={1.6}
        />
      ))}
    </View>
  );
}

function RatePrompt({ onRate }: { onRate: (value: number) => void }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(n => (
        <Pressable
          key={n}
          onPress={() => onRate(n)}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`Rate ${n} ${n === 1 ? 'star' : 'stars'}`}
        >
          <Star size={18} color={colors.star} strokeWidth={1.6} />
        </Pressable>
      ))}
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
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  tabs: {
    marginTop: 10,
  },
  list: {
    paddingHorizontal: GUTTER,
    paddingTop: 10,
    gap: 14,
  },
  card: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
  },
  service: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  provider: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
  },
  details: {
    marginTop: 12,
    padding: 12,
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  detailsMuted: {
    opacity: 0.6,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 18,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  detailText: {
    flexShrink: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  footer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  amountLabel: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  amount: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButton: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    experimental_backgroundImage: gradients.primaryButton,
  },
  primaryText: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 3,
  },
  empty: {
    marginTop: 60,
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
});
