import 'dotenv/config';
import { DateTime } from 'luxon';
import { initFirebase, sendAzanReminder } from '../src/services/fcm.service.js';
import type { PrayerName } from '../src/services/aladhan.service.js';

const FCM_TOKEN = process.env.TEST_FCM_TOKEN?.trim() ?? process.argv[2]?.trim();
if (!FCM_TOKEN) {
  console.error('Set TEST_FCM_TOKEN or pass token as argv[2]');
  process.exit(1);
}

const PRAYERS: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const TZ = 'Asia/Karachi';
const GAP_MS = 60_000;

async function main() {
  initFirebase();
  console.log(`Sending 5 test alarms (1 min apart), timezone ${TZ}…`);

  for (let i = 0; i < PRAYERS.length; i++) {
    const prayer = PRAYERS[i]!;
    const now = DateTime.now().setZone(TZ);
    const time = now.toFormat('HH:mm');
    await sendAzanReminder(FCM_TOKEN, prayer, time);
    console.log(`[${i + 1}/5] ${prayer} sent at ${now.toFormat('HH:mm:ss')}`);
    if (i < PRAYERS.length - 1) {
      await new Promise((r) => setTimeout(r, GAP_MS));
    }
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('FCM failed:', err);
  process.exit(1);
});
