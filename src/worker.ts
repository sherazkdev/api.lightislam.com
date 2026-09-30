import 'dotenv/config';
import cron from 'node-cron';
import { connectMongo, disconnectMongo } from './db/mongoose.js';
import { initFirebase } from './services/fcm.service.js';
import { dispatchDuePrayerPushes } from './services/push-dispatcher.service.js';
import { SchedulerService } from './services/scheduler.service.js';

const scheduler = new SchedulerService();

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  initFirebase();
  await connectMongo(mongoUri);

  cron.schedule('* * * * *', () => {
    void dispatchDuePrayerPushes().catch((err) => console.error('[dispatcher]', err));
  });

  cron.schedule(
    '1 0 * * *',
    () => {
      void scheduler.scheduleAllDevices().catch((err) => console.error('[daily-schedule]', err));
    },
    { timezone: 'Asia/Karachi' },
  );

  console.log('Azan worker running (MongoDB scheduler, no Redis)');

  const shutdown = async () => {
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
