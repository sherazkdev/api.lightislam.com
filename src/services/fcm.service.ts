import admin from 'firebase-admin';
import { getFirebaseServiceAccountFromEnv } from '../config/firebase-env.js';
import type { PrayerName } from './aladhan.service.js';

let initialized = false;

export function initFirebase(): void {
  if (initialized) return;

  if (admin.apps.length > 0) {
    initialized = true;
    return;
  }

  const serviceAccount = getFirebaseServiceAccountFromEnv();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  initialized = true;
}

export async function sendAzanReminder(
  fcmToken: string,
  prayerName: PrayerName,
  time: string,
): Promise<void> {
  await admin.messaging().send({
    token: fcmToken,
    data: {
      type: 'azan_reminder',
      title: prayerName,
      body: `Time for ${prayerName} prayer`,
      prayerName,
      time,
    },
    android: {
      priority: 'high',
    },
    apns: {
      headers: { 'apns-priority': '10' },
    },
  });
}

export async function sendAzanReminderSafe(
  fcmToken: string,
  prayerName: PrayerName,
  time: string,
): Promise<'sent' | 'invalid_token'> {
  try {
    await sendAzanReminder(fcmToken, prayerName, time);
    return 'sent';
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
      return 'invalid_token';
    }
    throw err;
  }
}
