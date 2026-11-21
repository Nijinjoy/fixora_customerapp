import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { Avatar } from '../components/common/Avatar';
import {
  BOOKING_WINDOW_DAYS,
  MAX_RANGE_DAYS,
  firstAvailableDay,
  getRangeSlots,
  isDayAvailable,
  startOfDay,
} from '../data/availability';
import {
  addBooking,
  addDays,
  formatBookingDate,
  formatBookingDates,
  formatShortDate,
  useBookings,
} from '../data/bookings';
import { findProvider } from '../data/home';
import { formatClock } from '../data/messages';
import type { RootScreenProps } from '../navigation/types';
import { colors, gradients, shadow } from '../theme/colors';
import { fonts } from '../theme/fonts';

const GUTTER = 20;
const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 500;

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type DateMode = 'single' | 'range';

const PER_DAY_UNITS = [undefined, '/day', '/visit'];

function parseRupees(price: string) {
  return Number(price.replace(/[^\d]/g, ''));
}

function formatRupees(amount: number) {
  const digits = String(Math.round(amount));
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${rest ? `${rest},${last3}` : last3}`;
}

function daysBetween(start: number, end: number) {
  return Math.round((end - start) / (24 * 60 * 60 * 1000)) + 1;
}

function monthStart(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

function addMonths(month: number, delta: number) {
  const date = new Date(month);
  return new Date(date.getFullYear(), date.getMonth() + delta, 1).getTime();
}

function monthCells(month: number): (number | null)[] {
  const date = new Date(month);
  const year = date.getFullYear();
  const index = date.getMonth();
  const daysInMonth = new Date(year, index + 1, 0).getDate();
  const cells: (number | null)[] = Array(date.getDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, index, day).getTime());
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function BookServiceScreen({
  navigation,
  route,
}: RootScreenProps<'BookService'>) {
  const insets = useSafeAreaInsets();
  const provider = findProvider(route.params.providerId);
  const bookings = useBookings();

  const [now] = useState(() => Date.now());
  const today = startOfDay(now);
  const lastMonth = monthStart(
    today + BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );

  const [initialDay] = useState(() =>
    provider ? firstAvailableDay(provider.id, bookings, now) : undefined,
  );
  const [mode, setMode] = useState<DateMode>('single');
  const [rangeStart, setRangeStart] = useState(initialDay);
  const [rangeEnd, setRangeEnd] = useState(initialDay);
  const [notice, setNotice] = useState('');
  const [month, setMonth] = useState(() => monthStart(initialDay ?? today));
  const [selectedSlot, setSelectedSlot] = useState<number>();
  const location = route.params.location;
  const [house, setHouse] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const days =
    rangeStart !== undefined && rangeEnd !== undefined
      ? daysBetween(rangeStart, rangeEnd)
      : 0;

  useEffect(() => {
    if (location) {
      setArea(location.area ?? '');
    }
  }, [location]);

  const cells = useMemo(() => monthCells(month), [month]);
  const slots = useMemo(
    () =>
      provider && rangeStart !== undefined
        ? getRangeSlots(provider.id, rangeStart, days, bookings, now)
        : [],
    [provider, rangeStart, days, bookings, now],
  );

  const goBack = () =>
    navigation.canGoBack()
      ? navigation.goBack()
      : navigation.navigate('Tabs', { screen: 'Home' });

  if (!provider) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>This provider could not be found.</Text>
      </View>
    );
  }

  const slotStillFree = slots.some(
    s => s.startsAt === selectedSlot && s.available,
  );

  const errors = {
    slot: !slotStillFree ? 'Choose a date and an available time slot.' : '',
    location: !location ? 'Pick the service location on the map.' : '',
    house: !house.trim() ? 'Enter your house name or flat number.' : '',
    area: !area.trim() ? 'Enter the area or street.' : '',
    description:
      description.trim().length < MIN_DESCRIPTION
        ? `Describe the work in at least ${MIN_DESCRIPTION} characters.`
        : '',
  };
  const valid = Object.values(errors).every(error => !error);

  const startOver = (day: number, message = '') => {
    setRangeStart(day);
    setRangeEnd(day);
    setNotice(message);
  };

  const selectDay = (day: number) => {
    setSelectedSlot(undefined);
    const extending =
      mode === 'range' &&
      rangeStart !== undefined &&
      rangeStart === rangeEnd &&
      day > rangeStart;
    if (!extending) {
      startOver(day);
      return;
    }
    if (daysBetween(rangeStart, day) > MAX_RANGE_DAYS) {
      startOver(day, `You can book up to ${MAX_RANGE_DAYS} days at a time.`);
      return;
    }
    for (let d = addDays(rangeStart, 1); d < day; d = addDays(d, 1)) {
      if (!isDayAvailable(provider.id, d, bookings, now)) {
        startOver(
          day,
          `${provider.name} isn't available on ${formatShortDate(
            d,
          )}, so the range can't include it.`,
        );
        return;
      }
    }
    setRangeEnd(day);
    setNotice('');
  };

  const changeMode = (next: DateMode) => {
    setMode(next);
    setNotice('');
    if (next === 'single' && rangeStart !== rangeEnd) {
      setRangeEnd(rangeStart);
      setSelectedSlot(undefined);
    }
  };

  const confirm = () => {
    setSubmitted(true);
    if (!valid || selectedSlot === undefined || !location) {
      return;
    }
    const city =
      location.city && location.city !== area.trim() ? location.city : '';
    const address = [house.trim(), area.trim(), city]
      .filter(Boolean)
      .join(', ');
    addBooking({
      providerId: provider.id,
      service: provider.title,
      scheduledAt: selectedSlot,
      days,
      address,
      landmark: landmark.trim() || undefined,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      amount: total,
      note: description.trim(),
    });
    navigation.navigate('Tabs', {
      screen: 'Bookings',
      params: { tab: 'upcoming' },
    });
  };

  const priceNote = provider.unit ?? '/visit';
  const freeCount = slots.filter(s => s.available).length;
  const perDay = PER_DAY_UNITS.includes(provider.unit);
  const total =
    perDay && days > 1
      ? formatRupees(parseRupees(provider.price) * days)
      : provider.price;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={goBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.title}>Book Service</Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, styles.providerCard]}>
          <Avatar
            emoji={provider.avatar}
            size={52}
            background={provider.avatarBg}
            verified
          />
          <View style={styles.providerBody}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerMeta}>{provider.title}</Text>
          </View>
          <Text style={styles.price}>
            {provider.price}
            <Text style={styles.priceUnit}>{priceNote}</Text>
          </Text>
        </View>

        <Text style={styles.heading}>Select Date</Text>
        <View style={styles.modes} accessibilityRole="tablist">
          {(['single', 'range'] as const).map(option => {
            const active = mode === option;
            return (
              <Pressable
                key={option}
                onPress={() => changeMode(option)}
                style={[styles.mode, active && styles.modeActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.modeText, active && styles.modeTextActive]}
                >
                  {option === 'single' ? 'Single day' : 'Multiple days'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.card}>
          <View style={styles.monthBar}>
            <MonthArrow
              direction="prev"
              disabled={month <= monthStart(today)}
              onPress={() => setMonth(m => addMonths(m, -1))}
            />
            <Text style={styles.monthLabel}>
              {MONTHS[new Date(month).getMonth()]}{' '}
              {new Date(month).getFullYear()}
            </Text>
            <MonthArrow
              direction="next"
              disabled={month >= lastMonth}
              onPress={() => setMonth(m => addMonths(m, 1))}
            />
          </View>

          <View style={styles.week}>
            {WEEKDAYS.map((label, index) => (
              <Text key={index} style={styles.weekday}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`blank-${index}`} style={styles.cell} />;
              }
              const available = isDayAvailable(provider.id, day, bookings, now);
              const selected = day === rangeStart || day === rangeEnd;
              const inRange =
                rangeStart !== undefined &&
                rangeEnd !== undefined &&
                day > rangeStart &&
                day < rangeEnd;
              const isToday = day === today;
              const date = new Date(day).getDate();
              return (
                <View key={day} style={styles.cell}>
                  <Pressable
                    disabled={!available}
                    onPress={() => selectDay(day)}
                    accessibilityRole="button"
                    accessibilityLabel={`${formatBookingDate(day)}${
                      available ? '' : ', unavailable'
                    }`}
                    accessibilityState={{
                      selected: selected || inRange,
                      disabled: !available,
                    }}
                    style={[
                      styles.day,
                      isToday && !selected && styles.today,
                      inRange && styles.dayInRange,
                      selected && styles.daySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !available && styles.dayDisabled,
                        inRange && styles.dayInRangeText,
                        selected && styles.daySelectedText,
                      ]}
                    >
                      {date}
                    </Text>
                    {available && !selected && !inRange && (
                      <View style={styles.dot} />
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {mode === 'range' && rangeStart !== undefined && (
            <Text style={[styles.rangeHint, notice ? styles.notice : null]}>
              {notice ||
                (days > 1
                  ? `${days} days selected · tap any date to start over`
                  : 'Now tap an end date')}
            </Text>
          )}
          {mode === 'single' && notice ? (
            <Text style={[styles.rangeHint, styles.notice]}>{notice}</Text>
          ) : null}

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.dot} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={[styles.legendText, styles.dayDisabled]}>12</Text>
              <Text style={styles.legendText}>Unavailable</Text>
            </View>
          </View>
        </View>

        <View style={styles.headingRow}>
          <Text style={styles.heading}>
            {days > 1 ? 'Start Time (each day)' : 'Select Time'}
          </Text>
          {rangeStart !== undefined && (
            <Text style={styles.headingNote}>
              {days > 1 ? `${days} days` : formatBookingDate(rangeStart)} ·{' '}
              {freeCount} free
            </Text>
          )}
        </View>
        {days > 1 && freeCount === 0 && (
          <Text style={[styles.muted, styles.slotNote]}>
            No time slot is free on all {days} days. Try a shorter range.
          </Text>
        )}
        {rangeStart === undefined ? (
          <Text style={styles.muted}>
            {provider.name} has no free slots in the next {BOOKING_WINDOW_DAYS}{' '}
            days.
          </Text>
        ) : (
          <View style={styles.slots}>
            {slots.map(slot => {
              const selected = slot.startsAt === selectedSlot;
              return (
                <Pressable
                  key={slot.hour}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot.startsAt)}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatClock(slot.startsAt)}${
                    slot.available ? '' : ', booked'
                  }`}
                  accessibilityState={{ selected, disabled: !slot.available }}
                  style={[
                    styles.slot,
                    !slot.available && styles.slotBooked,
                    selected && styles.slotSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.slotText,
                      !slot.available && styles.slotBookedText,
                      selected && styles.slotSelectedText,
                    ]}
                  >
                    {formatClock(slot.startsAt)}
                  </Text>
                  {!slot.available && (
                    <Text style={styles.slotTag}>Booked</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
        {submitted && errors.slot ? (
          <Text style={styles.error}>{errors.slot}</Text>
        ) : null}

        <Text style={styles.heading}>Address</Text>
        <Pressable
          onPress={() =>
            navigation.navigate('LocationPicker', {
              providerId: provider.id,
              initial: location,
            })
          }
          style={[
            styles.card,
            styles.locationCard,
            submitted && errors.location ? styles.inputError : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            location
              ? `Service location: ${location.formattedAddress}. Change`
              : 'Search location on map'
          }
        >
          {location ? (
            <>
              <View style={styles.miniMap} pointerEvents="none">
                <MapView
                  style={StyleSheet.absoluteFill}
                  region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }}
                  liteMode
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                  toolbarEnabled={false}
                >
                  <Marker coordinate={location} pinColor={colors.primary} />
                </MapView>
              </View>
              <View style={styles.locationRow}>
                <MapPin size={18} color={colors.primary} strokeWidth={1.8} />
                <View style={styles.locationBody}>
                  <Text style={styles.locationMain} numberOfLines={1}>
                    {location.area ?? location.city ?? 'Selected location'}
                  </Text>
                  <Text style={styles.locationSub} numberOfLines={2}>
                    {location.formattedAddress}
                  </Text>
                </View>
                <Text style={styles.change}>Change</Text>
              </View>
            </>
          ) : (
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Search size={18} color={colors.primary} strokeWidth={1.8} />
              </View>
              <View style={styles.locationBody}>
                <Text style={styles.locationMain}>Search location on map</Text>
                <Text style={styles.locationSub}>
                  Pin the exact place where the work is
                </Text>
              </View>
              <ChevronRight
                size={18}
                color={colors.textMuted}
                strokeWidth={2}
              />
            </View>
          )}
        </Pressable>
        {submitted && errors.location ? (
          <Text style={styles.error}>{errors.location}</Text>
        ) : null}

        <Field
          label="House Name / Flat No."
          required
          value={house}
          onChangeText={setHouse}
          placeholder="E.g. Thottathil House, Flat 4B"
          error={submitted ? errors.house : ''}
        />
        <Field
          label="Area / Street"
          required
          value={area}
          onChangeText={setArea}
          placeholder="E.g. Marine Drive"
          error={submitted ? errors.area : ''}
        />
        <Field
          label="Landmark"
          value={landmark}
          onChangeText={setLandmark}
          placeholder="E.g. Opposite St. Mary's Church (optional)"
        />

        <View style={styles.headingRow}>
          <Text style={styles.heading}>
            Describe the work <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.headingNote}>
            {description.length}/{MAX_DESCRIPTION}
          </Text>
        </View>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="E.g. Two kitchen switches stopped working, the rest of the room is fine."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_DESCRIPTION}
          textAlignVertical="top"
          style={[
            styles.input,
            styles.description,
            submitted && errors.description ? styles.inputError : null,
          ]}
          accessibilityLabel="Describe the work, required"
        />
        {submitted && errors.description ? (
          <Text style={styles.error}>{errors.description}</Text>
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>
            {slotStillFree && selectedSlot !== undefined
              ? `${formatBookingDates(selectedSlot, days)}, ${formatClock(
                  selectedSlot,
                )}`
              : 'No slot selected'}
          </Text>
          <View style={styles.summaryRight}>
            {perDay && days > 1 && (
              <Text style={styles.summaryBreakdown}>
                {provider.price} × {days} days
              </Text>
            )}
            <Text style={styles.summaryPrice}>{total}</Text>
          </View>
        </View>
        <Pressable
          onPress={confirm}
          style={[styles.confirm, !valid && styles.confirmDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Confirm booking"
          accessibilityState={{ disabled: !valid }}
        >
          <CalendarCheck size={18} color={colors.onPrimary} strokeWidth={1.8} />
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  required = false,
  error = '',
  ...input
}: {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        {...input}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          styles.fieldInput,
          error ? styles.inputError : null,
        ]}
        accessibilityLabel={`${label}${required ? ', required' : ''}`}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function MonthArrow({
  direction,
  disabled,
  onPress,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onPress: () => void;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.arrow, disabled && styles.arrowDisabled]}
      accessibilityRole="button"
      accessibilityLabel={
        direction === 'prev' ? 'Previous month' : 'Next month'
      }
      accessibilityState={{ disabled }}
      hitSlop={8}
    >
      <Icon size={18} color={colors.text} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GUTTER,
    paddingBottom: 8,
  },
  back: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  content: {
    paddingHorizontal: GUTTER,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerBody: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  providerMeta: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.accent,
  },
  price: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  priceUnit: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  heading: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  headingNote: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  required: {
    color: colors.accent,
  },
  muted: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.textMuted,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  day: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  daySelected: {
    experimental_backgroundImage: gradients.primaryButton,
    boxShadow: shadow.fab,
  },
  dayText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  dayDisabled: {
    color: colors.textDisabled,
    textDecorationLine: 'line-through',
  },
  dayInRange: {
    backgroundColor: colors.primarySoft,
  },
  dayInRangeText: {
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
  daySelectedText: {
    color: colors.onPrimary,
    fontFamily: fonts.bold,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
    backgroundColor: colors.success,
  },
  modes: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  mode: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeActive: {
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
  },
  modeText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textMuted,
  },
  modeTextActive: {
    color: colors.primary,
    fontFamily: fonts.semibold,
  },
  rangeHint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary,
  },
  notice: {
    color: colors.accent,
  },
  slotNote: {
    marginBottom: 10,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryBreakdown: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slot: {
    width: '31%',
    flexGrow: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: {
    borderColor: 'transparent',
    experimental_backgroundImage: gradients.primaryButton,
  },
  slotBooked: {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
  },
  slotText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  slotSelectedText: {
    color: colors.onPrimary,
  },
  slotBookedText: {
    color: colors.textDisabled,
  },
  slotTag: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  input: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    boxShadow: shadow.card,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.danger,
  },
  locationCard: {
    padding: 0,
    overflow: 'hidden',
  },
  miniMap: {
    height: 120,
    backgroundColor: colors.background,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBody: {
    flex: 1,
  },
  locationMain: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  locationSub: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: fonts.regular,
    lineHeight: 17,
    color: colors.textMuted,
  },
  change: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  field: {
    marginTop: 14,
  },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  fieldInput: {
    height: 50,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  description: {
    minHeight: 120,
    padding: 14,
    lineHeight: 20,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.danger,
  },
  footer: {
    paddingHorizontal: GUTTER,
    paddingTop: 12,
    gap: 10,
    backgroundColor: colors.surface,
    boxShadow: shadow.bottomBar,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textMuted,
  },
  summaryPrice: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  confirm: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    experimental_backgroundImage: gradients.primaryButton,
  },
  confirmDisabled: {
    opacity: 0.55,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.onPrimary,
  },
});
