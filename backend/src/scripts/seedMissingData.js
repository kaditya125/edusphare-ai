"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const faker_1 = require("@faker-js/faker");
const Notice_1 = __importDefault(require("../models/Notice"));
const Document_1 = require("../models/Document");
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
const seedMissingData = async () => {
    try {
        if (!MONGODB_URI)
            throw new Error('MONGODB_URI is not defined');
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('Seeding Notices...');
        const notices = [];
        for (let i = 0; i < 15; i++) {
            notices.push({
                title: faker_1.faker.company.catchPhrase(),
                category: faker_1.faker.helpers.arrayElement(['Academic', 'Administrative', 'Event', 'General']),
                date: faker_1.faker.date.recent({ days: 30 }).toISOString().split('T')[0],
                description: faker_1.faker.lorem.paragraph(),
                priority: faker_1.faker.helpers.arrayElement(['high', 'medium', 'low']),
                pinned: faker_1.faker.datatype.boolean()
            });
        }
        await Notice_1.default.deleteMany({});
        await Notice_1.default.insertMany(notices);
        console.log('Seeding Documents Hub...');
        const documents = [];
        for (let i = 0; i < 10; i++) {
            documents.push({
                filename: `doc_${faker_1.faker.string.uuid()}.pdf`,
                originalName: `${faker_1.faker.system.fileName()}.pdf`,
                mimeType: 'application/pdf',
                sizeBytes: faker_1.faker.number.int({ min: 10240, max: 5242880 }),
                status: faker_1.faker.helpers.arrayElement(['ready', 'ready', 'processing']),
                extractedText: faker_1.faker.lorem.paragraphs(3),
                pages: faker_1.faker.number.int({ min: 1, max: 20 })
            });
        }
        await Document_1.Document.deleteMany({});
        await Document_1.Document.insertMany(documents);
        console.log('🎉 Missing data seeding completed!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};
seedMissingData();
//# sourceMappingURL=seedMissingData.js.map