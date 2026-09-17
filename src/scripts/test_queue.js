import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { onboardingService } from '../services/onboardingService.js';
dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://admin:bhumicred2026@cluster0.p0q7n.mongodb.net/bhumicred?retryWrites=true&w=majority';

async function testQueue() {
  await mongoose.connect(mongoUri);
  console.log('Connected to DB');

  const items = await onboardingService.getAdminQueue({});
  console.log(`Total queue items: ${items.length}`);
  items.forEach(it => {
    console.log(`- [${it.type}] ${it.title} | Applicant: ${it.applicantName} | Status: ${it.status} | ID: ${it.applicationId || it.id}`);
  });

  await mongoose.disconnect();
}

testQueue().catch(console.error);
