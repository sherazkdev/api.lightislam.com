import 'dotenv/config';
import { initFirebase, sendAzanReminder } from '../src/services/fcm.service.js';
import { fetchPrayerSlotsForDate } from '../src/services/aladhan.service.js';
import { DateTime } from 'luxon';
import type { PrayerName } from '../src/services/aladhan.service.js';

const FCM_TOKEN = process.env.TEST_FCM_TOKEN?.trim() ?? process.argv[2]?.trim();
if (!FCM_TOKEN) {
  console.error('Set TEST_FCM_TOKEN or pass token as argv[2]');
  process.exit(1);
}

const GAP_MS = 60_000;
const LAT = 33.6007;
const LNG = 73.0679;
const TZ = 'Asia/Karachi';

async function main() {
  initFirebase();
  const day = DateTime.now().setZone(TZ).startOf('day');
  const slots = await fetchPrayerSlotsForDate(LAT, LNG, TZ, day);

  const order: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const byName = new Map(slots.map((s) => [s.prayerName, s]));

  console.log(`Sending 5 alarms, 1 minute apart, to test device…`);

  for (let i = 0; i < order.length; i++) {
    const name = order[i]!;
    const slot = byName.get(name);
    const time = slot?.time ?? '--:--';
    await sendAzanReminder(FCM_TOKEN, name, time);
    console.log(`[${i + 1}/5] Sent ${name} (${time})`);
    if (i < order.length - 1) {
      console.log(`Waiting 1 minute…`);
      await new Promise((r) => setTimeout(r, GAP_MS));
    }
  }

  console.log('All 5 alarms sent.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
