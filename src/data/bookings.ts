import { useSyncExternalStore } from 'react';

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export type Booking = {
  id: string;
  providerId: string;
  service: string;
  // Start time on the first day.
  scheduledAt: number;
  // Number of consecutive days, same start time each day. Defaults to 1.
  days?: number;
  address: string;
  landmark?: string;
  location?: { latitude: number; longitude: number };
  amount: string;
  status: BookingStatus;
  // Only set for upcoming bookings: has the provider accepted yet?
  confirmed?: boolean;
  // Only set for completed bookings the customer has rated.
  rating?: number;
  // What the customer described when booking.
  note?: string;
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function at(daysFromToday: number, hour: number, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.getTime() + daysFromToday * DAY;
}

// In-memory sample data. Replace with your bookings API later.
let bookings: Booking[] = [
  {
    id: 'BK-1042',
    providerId: '2',
    service: 'Kitchen switch repair',
    scheduledAt: at(1, 10),
    address: '12/4 Marine Drive, Kochi',
    amount: '₹900',
    status: 'upcoming',
    confirmed: true,
  },
  {
    id: 'BK-1045',
    providerId: '3',
    service: 'Bedroom repainting',
    scheduledAt: at(4, 9, 30),
    address: '12/4 Marine Drive, Kochi',
    amount: '₹1,700',
    status: 'upcoming',
    confirmed: false,
  },
  {
    id: 'BK-1031',
    providerId: '5',
    service: 'Coconut harvest · 40 trees',
    scheduledAt: at(-1, 7),
    address: 'Thottathil House, Alappuzha',
    amount: '₹2,000',
    status: 'completed',
  },
  {
    id: 'BK-1018',
    providerId: '1',
    service: 'Bathroom leak fix',
    scheduledAt: at(-9, 15),
    address: '12/4 Marine Drive, Kochi',
    amount: '₹500',
    status: 'completed',
    rating: 5,
  },
  {
    id: 'BK-1027',
    providerId: '7',
    service: 'Sliding gate fabrication',
    scheduledAt: at(-3, 11),
    address: '12/4 Marine Drive, Kochi',
    amount: '₹1,000',
    status: 'cancelled',
  },
];

const listeners = new Set<() => void>();

function update(next: Booking[]) {
  bookings = next;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getBookings() {
  return bookings;
}

export function useBookings() {
  return useSyncExternalStore(subscribe, getBookings);
}

let nextId = 1050;

export function addBooking(
  input: Pick<
    Booking,
    | 'providerId'
    | 'service'
    | 'scheduledAt'
    | 'days'
    | 'address'
    | 'landmark'
    | 'location'
    | 'amount'
    | 'note'
  >,
): Booking {
  const booking: Booking = {
    ...input,
    id: `BK-${nextId++}`,
    status: 'upcoming',
    confirmed: false,
  };
  update([...bookings, booking]);
  return booking;
}

export function cancelBooking(id: string) {
  update(
    bookings.map(booking =>
      booking.id === id ? { ...booking, status: 'cancelled' } : booking,
    ),
  );
}

export function rateBooking(id: string, rating: number) {
  update(
    bookings.map(booking =>
      booking.id === id ? { ...booking, rating } : booking,
    ),
  );
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatBookingDate(timestamp: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDiff = Math.round(
    (new Date(timestamp).setHours(0, 0, 0, 0) - today.getTime()) / DAY,
  );
  if (dayDiff === 0) {
    return 'Today';
  }
  if (dayDiff === 1) {
    return 'Tomorrow';
  }
  if (dayDiff === -1) {
    return 'Yesterday';
  }
  return formatShortDate(timestamp);
}

export function formatShortDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${
    MONTHS[date.getMonth()]
  }`;
}

export function addDays(timestamp: number, days: number) {
  const date = new Date(timestamp);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

// "Tomorrow" for one day, "Tue, 18 Nov – Thu, 20 Nov" for several.
export function formatBookingDates(scheduledAt: number, days = 1) {
  if (days <= 1) {
    return formatBookingDate(scheduledAt);
  }
  return `${formatShortDate(scheduledAt)} – ${formatShortDate(
    addDays(scheduledAt, days - 1),
  )}`;
}
