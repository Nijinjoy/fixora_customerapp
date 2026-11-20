import { addDays, type Booking } from './bookings';

// Start hours (24h) of the slots a provider can work in a day.
export const SLOT_HOURS = [8, 10, 12, 14, 16, 18];

// How far ahead customers can book.
export const BOOKING_WINDOW_DAYS = 60;

// Longest multi-day booking allowed.
export const MAX_RANGE_DAYS = 14;

export type Slot = {
  hour: number;
  startsAt: number;
  available: boolean;
};

export function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// Small deterministic hash so the sample availability is stable between
// renders and app launches.
function hash(text: string) {
  let value = 0;
  for (let i = 0; i < text.length; i++) {
    value = (value * 31 + text.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(value);
}

function dayKey(day: number) {
  const date = new Date(day);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Sample schedule. Replace with the provider's real calendar from your API.
function providerWorks(providerId: string, day: number) {
  const date = new Date(day);
  const weeklyOff = Number(providerId) % 7;
  if (date.getDay() === weeklyOff) {
    return false;
  }
  // Roughly one extra day off in ten (leave, holidays).
  return hash(`${providerId}:${dayKey(day)}:off`) % 10 !== 0;
}

function sampleTaken(providerId: string, day: number, hour: number) {
  return hash(`${providerId}:${dayKey(day)}:${hour}`) % 5 === 0;
}

export function getSlots(
  providerId: string,
  day: number,
  bookings: Booking[],
  now = Date.now(),
): Slot[] {
  const dayStart = startOfDay(day);
  const works = providerWorks(providerId, dayStart);
  // A multi-day booking blocks its start time on every day it covers.
  const taken = new Set(
    bookings
      .filter(b => b.providerId === providerId && b.status === 'upcoming')
      .flatMap(b =>
        Array.from({ length: b.days ?? 1 }, (_, i) =>
          addDays(b.scheduledAt, i),
        ),
      ),
  );

  return SLOT_HOURS.map(hour => {
    const date = new Date(dayStart);
    date.setHours(hour);
    const startsAt = date.getTime();
    const available =
      works &&
      // Leave the provider at least an hour to get there.
      startsAt > now + 60 * 60 * 1000 &&
      !taken.has(startsAt) &&
      !sampleTaken(providerId, dayStart, hour);
    return { hour, startsAt, available };
  });
}

// Slots for a run of days: a slot is free only if it is free on every day.
// `startsAt` is the slot's time on the first day.
export function getRangeSlots(
  providerId: string,
  firstDay: number,
  days: number,
  bookings: Booking[],
  now = Date.now(),
): Slot[] {
  const first = getSlots(providerId, firstDay, bookings, now);
  return first.map((slot, index) => ({
    ...slot,
    available: Array.from({ length: days }, (_, i) =>
      i === 0
        ? slot.available
        : getSlots(providerId, addDays(firstDay, i), bookings, now)[index]
            .available,
    ).every(Boolean),
  }));
}

export function isDayAvailable(
  providerId: string,
  day: number,
  bookings: Booking[],
  now = Date.now(),
) {
  const dayStart = startOfDay(day);
  const today = startOfDay(now);
  const last = today + BOOKING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  if (dayStart < today || dayStart > last) {
    return false;
  }
  return getSlots(providerId, dayStart, bookings, now).some(s => s.available);
}

export function firstAvailableDay(
  providerId: string,
  bookings: Booking[],
  now = Date.now(),
) {
  const today = new Date(startOfDay(now));
  for (let i = 0; i <= BOOKING_WINDOW_DAYS; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    if (isDayAvailable(providerId, day.getTime(), bookings, now)) {
      return day.getTime();
    }
  }
  return undefined;
}
