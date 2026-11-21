import { useSyncExternalStore } from 'react';

export type ChatMessage = {
  id: string;
  fromMe: boolean;
  text: string;
  sentAt: number;
};

export type Thread = {
  providerId: string;
  messages: ChatMessage[];
  unread: number;
};

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function seed(
  providerId: string,
  unread: number,
  lines: [fromMe: boolean, text: string, minutesAgo: number][],
): Thread {
  const now = Date.now();
  return {
    providerId,
    unread,
    messages: lines.map(([fromMe, text, minutesAgo], index) => ({
      id: `${providerId}-${index}`,
      fromMe,
      text,
      sentAt: now - minutesAgo * MINUTE,
    })),
  };
}

let threads: Record<string, Thread> = {
  '2': seed('2', 2, [
    [true, 'Hi Anil, two switches in my kitchen stopped working.', 75],
    [false, 'Hello! Is the breaker tripping, or just those switches?', 70],
    [true, 'Only those two. The rest of the kitchen is fine.', 65],
    [false, 'Sounds like a loose connection.', 40],
    [false, 'I can come tomorrow at 10 AM to check the wiring.', 38],
  ]),
  '5': seed('5', 0, [
    [
      true,
      'Can you come on Saturday for the coconut harvest?',
      DAY / MINUTE + 300,
    ],
    [false, 'Yes, I will be there by 7 AM.', DAY / MINUTE + 280],
    [
      false,
      'Harvested 40 trees today. Payment can be done by UPI.',
      DAY / MINUTE + 60,
    ],
  ]),
  '7': seed('7', 1, [
    [true, 'I need a new front gate, around 12 feet wide.', (3 * DAY) / MINUTE],
    [
      false,
      'Sure. Do you want a sliding or swing gate?',
      (3 * DAY) / MINUTE - 20,
    ],
    [true, 'Sliding, with a simple design.', (3 * DAY) / MINUTE - 40],
    [
      false,
      'The gate design is ready, please take a look.',
      (2 * DAY) / MINUTE,
    ],
  ]),
};

const listeners = new Set<() => void>();

function update(next: Record<string, Thread>) {
  threads = next;
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getThreads() {
  return threads;
}

export function useThreads() {
  return useSyncExternalStore(subscribe, getThreads);
}

export function sendMessage(providerId: string, text: string) {
  const thread = threads[providerId] ?? { providerId, messages: [], unread: 0 };
  const message: ChatMessage = {
    id: `${providerId}-${Date.now()}`,
    fromMe: true,
    text,
    sentAt: Date.now(),
  };
  update({
    ...threads,
    [providerId]: { ...thread, messages: [...thread.messages, message] },
  });
}

export function markRead(providerId: string) {
  const thread = threads[providerId];
  if (thread && thread.unread > 0) {
    update({ ...threads, [providerId]: { ...thread, unread: 0 } });
  }
}

export function formatClock(timestamp: number) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 || 12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatListTime(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - date.getTime()) / DAY) + 1;

  if (date.getTime() >= today.getTime()) {
    return formatClock(timestamp);
  }
  if (diffDays <= 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return WEEKDAYS[date.getDay()];
  }
  return `${date.getDate()}/${date.getMonth() + 1}`;
}
