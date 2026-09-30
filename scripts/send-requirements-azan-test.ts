/**
 * Requirements doc exact payload — data-only, no notification key.
 * Timing = current clock (Asia/Karachi) at send time, not Aladhan.
 */
import 'dotenv/config';
import { DateTime } from 'luxon';
import { initFirebase, sendAzanReminder } from '../src/services/fcm.service.js';
import type { PrayerName } from '../src/services/aladhan.service.js';

const FCM_TOKEN = process.env.TEST_FCM_TOKEN?.trim() ?? process.argv[2]?.trim();
if (!FCM_TOKEN) {
  console.error('Set TEST_FCM_TOKEN or pass token as argv[2]');
  process.exit(1);
}

const TZ = 'Asia/Karachi';
const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const GAP_MS = 60_000;

async function main() {
  initFirebase();
  console.log('Requirements payload: data-only, type=azan_reminder, all strings');
  console.log('No top-level notification key.\n');

  for (let i = 0; i < PRAYERS.length; i++) {
    const prayerName = PRAYERS[i]!;
    const time = DateTime.now().setZone(TZ).toFormat('HH:mm');

    await sendAzanReminder(FCM_TOKEN, prayerName, time);

    console.log(
      JSON.stringify({
        data: {
          type: 'azan_reminder',
          title: prayerName,
          body: `Time for ${prayerName} prayer`,
          prayerName,
          time,
        },
      }),
    );
    console.log(`→ sent [${i + 1}/5]\n`);

    if (i < PRAYERS.length - 1) {
      await new Promise((r) => setTimeout(r, GAP_MS));
    }
  }

  console.log('Done. App should use data.type === "azan_reminder" for azan channel.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
