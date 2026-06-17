"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
dotenv_1.default.config();
const updateFaculty = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const faculty = await Faculty_1.default.find();
        const sampleCourses = ['CS101: Intro to Programming', 'CS302: Data Structures', 'CS404: Machine Learning', 'MAT201: Calculus II', 'PHY101: Physics I', 'CS505: Cyber Security'];
        const sampleEndorsements = ['Great Mentor', 'Industry Expert', 'Simplifies Complex Topics', 'Very Approachable', 'Research Innovator'];
        for (const f of faculty) {
            // Add 2 random courses
            const shuffledCourses = sampleCourses.sort(() => 0.5 - Math.random());
            f.coursesTaught = shuffledCourses.slice(0, 2);
            // Add 2 random endorsements with random counts
            const shuffledEndorsements = sampleEndorsements.sort(() => 0.5 - Math.random());
            f.endorsements = [
                { trait: shuffledEndorsements[0], count: Math.floor(Math.random() * 20) + 5 },
                { trait: shuffledEndorsements[1], count: Math.floor(Math.random() * 15) + 2 }
            ];
            // Add office hours
            f.officeHours = [
                { day: 'Monday', startTime: '10:00 AM', endTime: '11:30 AM' },
                { day: 'Wednesday', startTime: '02:00 PM', endTime: '04:00 PM' }
            ];
            await f.save();
            console.log(`Updated faculty: ${f.firstName} ${f.lastName}`);
        }
        console.log('Successfully updated all faculty!');
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};
updateFaculty();
//# sourceMappingURL=updateFacultyFeatures.js.map