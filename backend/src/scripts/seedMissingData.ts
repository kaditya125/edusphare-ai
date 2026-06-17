import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

import Notice from '../models/Notice';
import { Document } from '../models/Document';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const seedMissingData = async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    console.log('Seeding Notices...');
    const notices = [];
    for (let i = 0; i < 15; i++) {
        notices.push({
            title: faker.company.catchPhrase(),
            category: faker.helpers.arrayElement(['Academic', 'Administrative', 'Event', 'General']),
            date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
            description: faker.lorem.paragraph(),
            priority: faker.helpers.arrayElement(['high', 'medium', 'low']),
            pinned: faker.datatype.boolean()
        });
    }
    await Notice.deleteMany({});
    await Notice.insertMany(notices);

    console.log('Seeding Documents Hub...');
    const documents = [];
    for (let i = 0; i < 10; i++) {
        documents.push({
            filename: `doc_${faker.string.uuid()}.pdf`,
            originalName: `${faker.system.fileName()}.pdf`,
            mimeType: 'application/pdf',
            sizeBytes: faker.number.int({ min: 10240, max: 5242880 }),
            status: faker.helpers.arrayElement(['ready', 'ready', 'processing']),
            extractedText: faker.lorem.paragraphs(3),
            pages: faker.number.int({ min: 1, max: 20 })
        });
    }
    await Document.deleteMany({});
    await Document.insertMany(documents);

    console.log('🎉 Missing data seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedMissingData();
