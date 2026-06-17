"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Notice_1 = __importDefault(require("./src/models/Notice"));
dotenv_1.default.config();
const noticesData = [
    {
        title: 'Fall Semester MCA Examination Schedule',
        category: 'Academic',
        date: 'Oct 24, 2024',
        description: 'The final examination schedule for all MCA batches has been published. Examinations will commence on November 15th, 2024. Please review your respective timetables on the university portal. Admit cards will be available for download starting November 5th. Strict adherence to examination hall guidelines is expected.',
        priority: 'high',
        pinned: true
    },
    {
        title: 'Campus Wi-Fi Maintenance Notice',
        category: 'Admin',
        date: 'Oct 22, 2024',
        description: 'The IT Department will be conducting scheduled maintenance on the campus-wide Wi-Fi network this weekend (Oct 26-27). Intermittent connectivity issues may be experienced across all academic blocks and hostels between 10 PM and 4 AM. Please plan your online activities accordingly.',
        priority: 'medium',
        pinned: false
    },
    {
        title: 'Annual Tech Symposium Registration Open',
        category: 'Student Life',
        date: 'Oct 20, 2024',
        description: 'Registrations for the Annual Tech Symposium "Innovate 2024" are now open! Participate in hackathons, coding challenges, and robotics competitions. Exciting cash prizes to be won. Last date for early-bird registration is October 31st. Contact the Student Council for more details.',
        priority: 'medium',
        pinned: true
    },
    {
        title: 'Diwali Holidays Announcement',
        category: 'General',
        date: 'Oct 15, 2024',
        description: 'The University will remain closed from October 31st to November 3rd, 2024, on account of Diwali. All academic and administrative activities will be suspended during this period. Hostels will remain open, and mess facilities will operate on a restricted schedule. Wishing everyone a happy and safe Diwali!',
        priority: 'low',
        pinned: false
    },
    {
        title: 'Mandatory Library Book Return',
        category: 'Academic',
        date: 'Oct 10, 2024',
        description: 'All final year students are required to return any books issued from the Central Library by November 10th. Failure to return the books by the deadline will result in a daily fine and withholding of the final semester grade card. Ensure you clear all library dues.',
        priority: 'high',
        pinned: false
    }
];
const seedNotices = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        await Notice_1.default.collection.drop().catch(() => console.log('Notice collection not found, skipping drop'));
        console.log('Dropped existing notices collection');
        await Notice_1.default.insertMany(noticesData);
        console.log('Seeded notices data successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding notices data:', error);
        process.exit(1);
    }
};
seedNotices();
//# sourceMappingURL=seedNotices.js.map