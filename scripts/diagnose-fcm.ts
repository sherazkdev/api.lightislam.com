import 'dotenv/config';
import admin from 'firebase-admin';
import { getFirebaseServiceAccountFromEnv } from '../src/config/firebase-env.js';

const token = process.env.TEST_FCM_TOKEN?.trim() ?? process.argv[2]?.trim();
if (!token) {
  console.error('Set TEST_FCM_TOKEN');
  process.exit(1);
}

function init(): void {
  if (admin.apps.length === 0) {
    admin.initializeApp({ credential: admin.credential.cert(getFirebaseServiceAccountFromEnv()) });
  }
}

async function sendDataOnly(): Promise<string> {
  return admin.messaging().send({
    token,
    data: {
      type: 'azan_reminder',
      title: 'Fajr',
      body: 'Data-only test from API',
      prayerName: 'Fajr',
      time: '12:31',
    },
    android: { priority: 'high' },
  });
}

/** Diagnostic only — shows system tray if token + Firebase project match the app */
async function sendWithNotification(): Promise<string> {
  return admin.messaging().send({
    token,
    notification: {
      title: 'Light of Islam test',
      body: 'Agar yeh dikhe to token + Firebase project sahi hai',
    },
    data: { type: 'diagnostic' },
    android: { priority: 'high' },
  });
}

async function main() {
  init();
  const projectId = getFirebaseServiceAccountFromEnv().projectId;
  console.log('Firebase project:', projectId);
  console.log('Token prefix:', token.slice(0, 12) + '…');

  try {
    const id1 = await sendDataOnly();
    console.log('DATA-ONLY send OK, messageId:', id1);
  } catch (e) {
    console.error('DATA-ONLY FAILED:', e);
  }

  try {
    const id2 = await sendWithNotification();
    console.log('NOTIFICATION test OK, messageId:', id2);
    console.log('Phone par "Light of Islam test" dikhna chahiye (1 notification).');
  } catch (e) {
    console.error('NOTIFICATION test FAILED:', e);
    console.error('Yeh usually galat token ya galat Firebase project hota hai.');
  }
}

main();
