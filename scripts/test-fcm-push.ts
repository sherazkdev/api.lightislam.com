import 'dotenv/config';
import { initFirebase, sendAzanReminder } from '../src/services/fcm.service.js';

const token = process.env.TEST_FCM_TOKEN?.trim();
if (!token) {
  console.error('Set TEST_FCM_TOKEN in environment');
  process.exit(1);
}

async function main() {
  initFirebase();
  await sendAzanReminder(token, 'Fajr', '05:12');
  console.log('FCM sent successfully');
  console.log(JSON.stringify({ prayer: 'Fajr', location: 'Rawalpindi', timezone: 'Asia/Karachi' }));
}

main().catch((err) => {
  console.error('FCM test failed:', err);
  process.exit(1);
});
