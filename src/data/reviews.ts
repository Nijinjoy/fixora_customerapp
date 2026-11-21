import type { Provider } from './home';

export type Review = {
  id: string;
  author: string;
  avatar: string;
  rating: 1 | 2 | 3 | 4 | 5;
  daysAgo: number;
  text: string;
};

export type RatingBreakdown = Record<1 | 2 | 3 | 4 | 5, number>;

const AUTHORS: [string, string][] = [
  ['Anjali M', '👩🏽'],
  ['Rahul K', '👨🏽'],
  ['Divya S', '👩🏻'],
  ['Arun P', '🧔🏽'],
  ['Meera T', '👩🏾'],
  ['Vishnu R', '👨🏻'],
  ['Lakshmi N', '👵🏽'],
  ['Nikhil J', '🧑🏽'],
  ['Sneha V', '👩🏽‍🦱'],
  ['Kiran B', '👨🏾'],
  ['Fathima A', '🧕🏽'],
  ['Jose C', '👴🏽'],
];

const TEXTS: Record<1 | 2 | 3 | 4 | 5, string[]> = {
  5: [
    'Came on time, explained the problem clearly and fixed it quickly. Very professional.',
    'Excellent work and a very fair price. Cleaned up afterwards too. Highly recommend!',
    'Polite, skilled and honest. Will definitely book again.',
    'Booked in the morning and the job was done by afternoon. Great service.',
  ],
  4: [
    'Good work overall. Arrived a little late but called ahead to let me know.',
    'Did a neat job. Price was slightly higher than expected but worth it.',
    'Knowledgeable and friendly. Took a bit longer than estimated.',
  ],
  3: [
    'Job got done, but communication could have been better.',
    'Average experience. Had to follow up once to finish the work.',
  ],
  2: ['Arrived late and the work needed a second visit.'],
  1: ['Did not turn up at the agreed time. Had to reschedule.'],
};

function seeded(seed: string) {
  let state = 1;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  state = (state % 2147483646) + 1;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function ratingBreakdown(provider: Provider): RatingBreakdown {
  const m = Math.min(5, Math.max(3.5, provider.rating));
  const low = (5 - m) * 0.25;
  const share = {
    1: low * 0.15,
    2: low * 0.25,
    3: low * 0.6,
    5: m - 4 + 1.55 * low,
    4: 0,
  };
  share[4] = Math.max(0, 1 - share[1] - share[2] - share[3] - share[5]);

  const total = provider.reviews;
  const counts = {
    1: Math.round(share[1] * total),
    2: Math.round(share[2] * total),
    3: Math.round(share[3] * total),
    4: Math.round(share[4] * total),
    5: 0,
  } as RatingBreakdown;
  counts[5] = Math.max(
    0,
    total - counts[1] - counts[2] - counts[3] - counts[4],
  );
  return counts;
}

export function getReviews(provider: Provider): Review[] {
  const rand = seeded(provider.id);
  const breakdown = ratingBreakdown(provider);
  const total = provider.reviews || 1;
  const count = Math.min(12, provider.reviews);

  const pickRating = (): Review['rating'] => {
    let roll = rand() * total;
    for (const stars of [5, 4, 3, 2, 1] as const) {
      roll -= breakdown[stars];
      if (roll < 0) {
        return stars;
      }
    }
    return 5;
  };

  const authors = [...AUTHORS];
  for (let i = authors.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [authors[i], authors[j]] = [authors[j], authors[i]];
  }
  const textIndex: Record<number, number> = {
    1: Math.floor(rand() * 4),
    2: Math.floor(rand() * 4),
    3: Math.floor(rand() * 4),
    4: Math.floor(rand() * 4),
    5: Math.floor(rand() * 4),
  };

  let day = 1;
  return Array.from({ length: count }, (_, i) => {
    const rating = pickRating();
    const [author, avatar] = authors[i % authors.length];
    const options = TEXTS[rating];
    day += Math.floor(rand() * 9);
    return {
      id: `${provider.id}-${i}`,
      author,
      avatar,
      rating,
      daysAgo: day,
      text: options[textIndex[rating]++ % options.length],
    };
  });
}

export function timeAgo(days: number): string {
  if (days <= 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days} days ago`;
  }
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}
