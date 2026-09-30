import 'dotenv/config';
import { initFirebase, sendAzanReminder } from '../src/services/fcm.service.js';
import { fetchPrayerSlotsForDate } from '../src/services/aladhan.service.js';
import { DateTime } from 'luxon';

const FCM_TOKEN =
  process.env.TEST_FCM_TOKEN?.trim() ??
  process.argv[2]?.trim();

const LAT = 33.6007;
const LNG = 73.0679;
const TZ = 'Asia/Karachi';
const API_BASE = process.env.API_BASE ?? 'http://127.0.0.1:3000';

async function testApis(): Promise<void> {
  console.log('\n--- HTTP API tests ---');

  try {
    const health = await fetch(`${API_BASE}/health`);
    const healthBody = await health.json();
    console.log(`GET /health → ${health.status}`, healthBody);
  } catch {
    console.log('GET /health → skipped (API not running)');
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fcm_token: FCM_TOKEN,
        latitude: LAT,
        longitude: LNG,
        timezone: TZ,
      }),
    });
    const body = await res.json().catch(() => ({}));
    console.log(`POST /api/v1/devices → ${res.status}`, body);
  } catch {
    console.log('POST /api/v1/devices → skipped (API not running or Redis 5+ required)');
  }
}

async function sendAllPrayerReminders(): Promise<void> {
  if (!FCM_TOKEN) {
    throw new Error('Set TEST_FCM_TOKEN or pass token as first argument');
  }

  console.log('\n--- FCM azan reminders (Rawalpindi, today) ---');
  initFirebase();

  const day = DateTime.now().setZone(TZ).startOf('day');
  const slots = await fetchPrayerSlotsForDate(LAT, LNG, TZ, day);

  if (slots.length === 0) {
    throw new Error('No prayer slots from Aladhan');
  }

  for (const slot of slots) {
    await sendAzanReminder(FCM_TOKEN, slot.prayerName, slot.time);
    console.log(`Sent: ${slot.prayerName} (${slot.time})`);
    await new Promise((r) => setTimeout(r, 2500));
  }

  console.log(`\nDone: ${slots.length} reminders sent.`);
}

async function main() {
  await testApis();
  await sendAllPrayerReminders();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
