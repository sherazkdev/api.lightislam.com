import mongoose from 'mongoose';
import { syncDatabaseIndexes } from './indexes.js';

export async function connectMongo(uri: string): Promise<void> {
  const autoIndex = process.env.NODE_ENV !== 'production';
  await mongoose.connect(uri, { autoIndex });
  await syncDatabaseIndexes();
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
