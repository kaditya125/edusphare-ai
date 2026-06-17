"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const faker_1 = require("@faker-js/faker");
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const Course_1 = __importDefault(require("../models/Course"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Assignment_1 = __importDefault(require("../models/Assignment"));
const Submission_1 = __importDefault(require("../models/Submission"));
const Exam_1 = __importDefault(require("../models/Exam"));
const Result_1 = __importDefault(require("../models/Result"));
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = __importDefault(require("../models/Message"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Announcement_1 = __importDefault(require("../models/Announcement"));
const Roadmap_1 = __importDefault(require("../models/Roadmap"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI;
const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'MCA Data Science', 'Information Technology', 'Artificial Intelligence'];
const seedDatabase = async () => {
    try {
        if (!MONGODB_URI)
            throw new Error('MONGODB_URI is not defined');
        console.log('Connecting to MongoDB...');
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('Clearing old data and indexes...');
        await mongoose_1.default.connection.db?.dropDatabase();
        const salt = await bcrypt_1.default.genSalt(10);
        const passwordHash = await bcrypt_1.default.hash('password123', salt);
        console.log('Seeding 30 Faculties...');
        const faculties = [];
        for (let i = 0; i < 30; i++) {
            const firstName = faker_1.faker.person.firstName();
            const lastName = faker_1.faker.person.lastName();
            const email = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;
            const user = await new User_1.default({ email, passwordHash, role: 'faculty' }).save();
            const faculty = await new Faculty_1.default({
                userId: user._id,
                employeeId: `FAC${(i + 1).toString().padStart(3, '0')}`,
                firstName,
                lastName,
                department: faker_1.faker.helpers.arrayElement(DEPARTMENTS),
                designation: faker_1.faker.helpers.arrayElement(['Professor', 'Assistant Professor', 'Associate Professor', 'Lecturer']),
                email: email,
                avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=${faker_1.faker.color.rgb().replace('#', '')}`
            }).save();
            faculties.push(faculty);
        }
        console.log('Seeding 30 Courses...');
        const courses = [];
        for (let i = 0; i < 30; i++) {
            const coursePrefix = faker_1.faker.helpers.arrayElement(['CS', 'MA', 'PH', 'CH', 'IT', 'AI']);
            const courseCode = `${coursePrefix}${faker_1.faker.number.int({ min: 100, max: 999 })}`;
            const department = DEPARTMENTS.find(d => d.startsWith(coursePrefix === 'CS' ? 'Comp' : coursePrefix === 'MA' ? 'Math' : 'A')) || DEPARTMENTS[0];
            const randomFaculty = faker_1.faker.helpers.arrayElement(faculties);
            const course = await new Course_1.default({
                courseCode,
                title: faker_1.faker.company.catchPhrase(),
                description: faker_1.faker.lorem.paragraph(),
                credits: faker_1.faker.number.int({ min: 2, max: 4 }),
                department: randomFaculty.department, // Ensure faculty matches department roughly
                facultyId: randomFaculty._id,
                semester: faker_1.faker.number.int({ min: 1, max: 8 })
            }).save();
            courses.push(course);
        }
        console.log('Seeding 30 Students...');
        const students = [];
        // Always include our primary test student
        const mainStudentUser = await new User_1.default({ email: 'student@university.edu', passwordHash, role: 'student' }).save();
        const mainStudent = await new Student_1.default({
            userId: mainStudentUser._id,
            enrollmentNumber: 'STU2026001',
            firstName: 'Sahanbaaz',
            lastName: 'Ahmed',
            department: 'MCA Data Science',
            program: 'Master of Computer Applications',
            currentSemester: 3,
            cgpa: 8.5,
            sgpa: 8.2,
            creditsEarned: 45,
            creditsRemaining: 15
        }).save();
        students.push(mainStudent);
        // Generate 29 more realistic students
        for (let i = 0; i < 29; i++) {
            const firstName = faker_1.faker.person.firstName();
            const lastName = faker_1.faker.person.lastName();
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.university.edu`;
            const user = await new User_1.default({ email, passwordHash, role: 'student' }).save();
            const student = await new Student_1.default({
                userId: user._id,
                enrollmentNumber: `STU2026${(i + 2).toString().padStart(3, '0')}`,
                firstName,
                lastName,
                department: faker_1.faker.helpers.arrayElement(DEPARTMENTS),
                program: faker_1.faker.helpers.arrayElement(['B.Tech', 'M.Tech', 'BCA', 'MCA Data Science']),
                currentSemester: faker_1.faker.number.int({ min: 1, max: 8 }),
                cgpa: faker_1.faker.number.float({ min: 6.0, max: 9.8, fractionDigits: 2 }),
                sgpa: faker_1.faker.number.float({ min: 6.0, max: 9.8, fractionDigits: 2 }),
                creditsEarned: faker_1.faker.number.int({ min: 20, max: 120 }),
                creditsRemaining: faker_1.faker.number.int({ min: 10, max: 60 }),
                profilePicture: `https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=${faker_1.faker.color.rgb().replace('#', '')}`
            }).save();
            students.push(student);
        }
        console.log('Seeding Enrollments, Attendance, Assignments, Exams...');
        for (const student of students) {
            // Enroll each student in 4-6 random courses
            const numCourses = faker_1.faker.number.int({ min: 4, max: 6 });
            const studentCourses = faker_1.faker.helpers.arrayElements(courses, numCourses);
            for (const course of studentCourses) {
                await new Enrollment_1.default({ studentId: student._id, courseId: course._id, semester: student.currentSemester }).save();
                // Add random attendance
                const status = faker_1.faker.helpers.arrayElement(['Present', 'Absent']);
                await new Attendance_1.default({ studentId: student._id, courseId: course._id, facultyId: course.facultyId, date: faker_1.faker.date.recent({ days: 30 }), status }).save();
                // Add Assignment
                const assignment = await new Assignment_1.default({
                    courseId: course._id,
                    title: `Assignment: ${faker_1.faker.lorem.words(3)}`,
                    description: faker_1.faker.lorem.sentence(),
                    dueDate: faker_1.faker.date.soon({ days: 14 }),
                    totalMarks: 100
                }).save();
                // Maybe submission
                if (faker_1.faker.datatype.boolean()) {
                    await new Submission_1.default({
                        assignmentId: assignment._id,
                        studentId: student._id,
                        fileUrl: 'https://s3.amazonaws.com/bucket/submission1.zip',
                        submittedAt: faker_1.faker.date.recent(),
                        marksObtained: faker_1.faker.number.int({ min: 50, max: 100 }),
                        feedback: faker_1.faker.lorem.sentence()
                    }).save();
                }
                // Add Exam
                const exam = await new Exam_1.default({
                    courseId: course._id,
                    title: `${faker_1.faker.helpers.arrayElement(['Midterm', 'Final', 'Quiz'])} Examination`,
                    examDate: faker_1.faker.date.recent({ days: 45 }),
                    totalMarks: 100,
                    type: faker_1.faker.helpers.arrayElement(['Midterm', 'Final', 'Quiz'])
                }).save();
                await new Result_1.default({
                    examId: exam._id,
                    studentId: student._id,
                    marksObtained: faker_1.faker.number.int({ min: 40, max: 98 }),
                    grade: faker_1.faker.helpers.arrayElement(['A', 'B', 'C', 'D'])
                }).save();
            }
        }
        console.log('Seeding Initial Chat for main student...');
        const chat = await new Chat_1.default({ userId: mainStudentUser._id, title: 'General Inquiry' }).save();
        await new Message_1.default({ chatId: chat._id, sender: 'user', content: 'Hello!' }).save();
        await new Message_1.default({ chatId: chat._id, sender: 'ai', content: 'Hello Sahanbaaz! I am EduSphere AI. How can I help you today?' }).save();
        console.log('Seeding Notifications for main student...');
        await new Notification_1.default({ userId: mainStudentUser._id, title: 'New Assignment', message: 'Neural Network Implementation assignment has been posted.', type: 'info', category: 'announcement', isRead: false }).save();
        await new Notification_1.default({ userId: mainStudentUser._id, title: 'Exam Scheduled', message: 'Midterm Examination is scheduled for next week.', type: 'alert', category: 'exam', isRead: false }).save();
        await new Notification_1.default({ userId: mainStudentUser._id, title: 'Welcome', message: 'Welcome to EduSphere Student Portal.', type: 'success', category: 'general', isRead: true }).save();
        console.log('Seeding Schedule (Global)...');
        for (let i = 0; i < 15; i++) {
            const randomCourse = faker_1.faker.helpers.arrayElement(courses);
            await new Schedule_1.default({
                courseId: randomCourse._id,
                dayOfWeek: faker_1.faker.number.int({ min: 1, max: 5 }),
                startTime: `${faker_1.faker.number.int({ min: 8, max: 15 })}:00`,
                endTime: `${faker_1.faker.number.int({ min: 9, max: 16 })}:30`,
                room: `Room ${faker_1.faker.number.int({ min: 100, max: 999 })}`
            }).save();
        }
        console.log('Seeding Announcements...');
        await new Announcement_1.default({
            title: 'Tech Symposium 2026',
            description: 'Join us for the annual technology symposium featuring industry leaders.',
            badge: 'Important',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
            color: 'bg-red-500'
        }).save();
        await new Announcement_1.default({
            title: 'Hackathon Registration',
            description: 'Registrations are open for the upcoming 48-hour hackathon.',
            badge: 'Hurry Up',
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
            color: 'bg-amber-500'
        }).save();
        console.log('Seeding Roadmap...');
        await new Roadmap_1.default({ studentId: mainStudent._id, title: 'Year 1 Basics', status: 'Complete', statusLabel: 'Complete', order: 1 }).save();
        await new Roadmap_1.default({ studentId: mainStudent._id, title: 'Core Subjects', status: 'Complete', statusLabel: 'Complete', order: 2 }).save();
        await new Roadmap_1.default({ studentId: mainStudent._id, title: 'Advanced Modules', status: 'In Progress', statusLabel: 'In Progress', order: 3 }).save();
        console.log('🎉 Seeding completed successfully with 30 realistic entries each!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seedData.js.map