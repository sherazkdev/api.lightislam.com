import { DateTime } from 'luxon';

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
export type PrayerName = (typeof PRAYER_KEYS)[number];

export type PrayerSlot = {
  prayerName: PrayerName;
  time: string;
  at: Date;
};

type AladhanTimingsResponse = {
  data?: {
    timings?: Record<string, string>;
  };
};

function cleanTime(raw: string): string {
  return raw.split(' ')[0]!.trim();
}

export async function fetchPrayerSlotsForDate(
  latitude: number,
  longitude: number,
  timezone: string,
  day: DateTime,
): Promise<PrayerSlot[]> {
  const dateStr = day.toFormat('dd-MM-yyyy');
  const url = new URL(`https://api.aladhan.com/v1/timings/${dateStr}`);
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('method', '1');
  url.searchParams.set('timezonestring', timezone);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Aladhan API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as AladhanTimingsResponse;
  const timings = json.data?.timings;
  if (!timings) {
    throw new Error('Aladhan API returned no timings');
  }

  const slots: PrayerSlot[] = [];
  for (const prayerName of PRAYER_KEYS) {
    const raw = timings[prayerName];
    if (!raw) continue;
    const time = cleanTime(raw);
    const at = DateTime.fromFormat(`${day.toFormat('yyyy-MM-dd')} ${time}`, 'yyyy-MM-dd HH:mm', {
      zone: timezone,
    });
    if (!at.isValid) continue;
    slots.push({ prayerName, time, at: at.toJSDate() });
  }
  return slots;
}

/** Today + tomorrow prayers still in the future (for reliable scheduling). */
export async function fetchSlotsToSchedule(
  latitude: number,
  longitude: number,
  timezone: string,
  now = DateTime.now().setZone(timezone),
): Promise<PrayerSlot[]> {
  const today = await fetchPrayerSlotsForDate(latitude, longitude, timezone, now.startOf('day'));
  const tomorrow = await fetchPrayerSlotsForDate(
    latitude,
    longitude,
    timezone,
    now.plus({ days: 1 }).startOf('day'),
  );
  const cutoff = now.toMillis();
  return [...today, ...tomorrow].filter((s) => s.at.getTime() > cutoff);
}
