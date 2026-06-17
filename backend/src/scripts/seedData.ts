import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

import User from '../models/User';
import Student from '../models/Student';
import Faculty from '../models/Faculty';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Attendance from '../models/Attendance';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Exam from '../models/Exam';
import Result from '../models/Result';
import Chat from '../models/Chat';
import Message from '../models/Message';
import Notification from '../models/Notification';
import Schedule from '../models/Schedule';
import Announcement from '../models/Announcement';
import Roadmap from '../models/Roadmap';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'MCA Data Science', 'Information Technology', 'Artificial Intelligence'];

const seedDatabase = async () => {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    console.log('Clearing old data and indexes...');
    await mongoose.connection.db?.dropDatabase();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Seeding 30 Faculties...');
    const faculties: any[] = [];
    for (let i = 0; i < 30; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}@university.edu`;
      
      const user = await new User({ email, passwordHash, role: 'faculty' }).save();
      const faculty = await new Faculty({
        userId: user._id,
        employeeId: `FAC${(i+1).toString().padStart(3, '0')}`,
        firstName,
        lastName,
        department: faker.helpers.arrayElement(DEPARTMENTS),
        designation: faker.helpers.arrayElement(['Professor', 'Assistant Professor', 'Associate Professor', 'Lecturer']),
        email: email,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=${faker.color.rgb().replace('#', '')}`
      }).save();
      faculties.push(faculty);
    }

    console.log('Seeding 30 Courses...');
    const courses: any[] = [];
    for (let i = 0; i < 30; i++) {
      const coursePrefix = faker.helpers.arrayElement(['CS', 'MA', 'PH', 'CH', 'IT', 'AI']);
      const courseCode = `${coursePrefix}${faker.number.int({ min: 100, max: 999 })}`;
      const department = DEPARTMENTS.find(d => d.startsWith(coursePrefix === 'CS' ? 'Comp' : coursePrefix === 'MA' ? 'Math' : 'A')) || DEPARTMENTS[0];
      const randomFaculty = faker.helpers.arrayElement(faculties);
      
      const course = await new Course({
        courseCode,
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        credits: faker.number.int({ min: 2, max: 4 }),
        department: randomFaculty.department, // Ensure faculty matches department roughly
        facultyId: randomFaculty._id,
        semester: faker.number.int({ min: 1, max: 8 })
      }).save();
      courses.push(course);
    }

    console.log('Seeding 30 Students...');
    const students: any[] = [];
    
    // Always include our primary test student
    const mainStudentUser = await new User({ email: 'student@university.edu', passwordHash, role: 'student' }).save();
    const mainStudent = await new Student({
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
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.university.edu`;
      
      const user = await new User({ email, passwordHash, role: 'student' }).save();
      const student = await new Student({
        userId: user._id,
        enrollmentNumber: `STU2026${(i+2).toString().padStart(3, '0')}`,
        firstName,
        lastName,
        department: faker.helpers.arrayElement(DEPARTMENTS),
        program: faker.helpers.arrayElement(['B.Tech', 'M.Tech', 'BCA', 'MCA Data Science']),
        currentSemester: faker.number.int({ min: 1, max: 8 }),
        cgpa: faker.number.float({ min: 6.0, max: 9.8, fractionDigits: 2 }),
        sgpa: faker.number.float({ min: 6.0, max: 9.8, fractionDigits: 2 }),
        creditsEarned: faker.number.int({ min: 20, max: 120 }),
        creditsRemaining: faker.number.int({ min: 10, max: 60 }),
        profilePicture: `https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}&backgroundColor=${faker.color.rgb().replace('#', '')}`
      }).save();
      students.push(student);
    }

    console.log('Seeding Enrollments, Attendance, Assignments, Exams...');
    for (const student of students) {
      // Enroll each student in 4-6 random courses
      const numCourses = faker.number.int({ min: 4, max: 6 });
      const studentCourses = faker.helpers.arrayElements(courses, numCourses);
      
      for (const course of studentCourses) {
        await new Enrollment({ studentId: student._id, courseId: course._id, semester: student.currentSemester }).save();
        
        // Add random attendance
        const status = faker.helpers.arrayElement(['Present', 'Absent']);
        await new Attendance({ studentId: student._id, courseId: course._id, facultyId: course.facultyId, date: faker.date.recent({ days: 30 }), status }).save();
        
        // Add Assignment
        const assignment = await new Assignment({
          courseId: course._id,
          title: `Assignment: ${faker.lorem.words(3)}`,
          description: faker.lorem.sentence(),
          dueDate: faker.date.soon({ days: 14 }),
          totalMarks: 100
        }).save();

        // Maybe submission
        if (faker.datatype.boolean()) {
           await new Submission({
             assignmentId: assignment._id,
             studentId: student._id,
             fileUrl: 'https://s3.amazonaws.com/bucket/submission1.zip',
             submittedAt: faker.date.recent(),
             marksObtained: faker.number.int({ min: 50, max: 100 }),
             feedback: faker.lorem.sentence()
           }).save();
        }

        // Add Exam
        const exam = await new Exam({
          courseId: course._id,
          title: `${faker.helpers.arrayElement(['Midterm', 'Final', 'Quiz'])} Examination`,
          examDate: faker.date.recent({ days: 45 }),
          totalMarks: 100,
          type: faker.helpers.arrayElement(['Midterm', 'Final', 'Quiz'])
        }).save();

        await new Result({
          examId: exam._id,
          studentId: student._id,
          marksObtained: faker.number.int({ min: 40, max: 98 }),
          grade: faker.helpers.arrayElement(['A', 'B', 'C', 'D'])
        }).save();
      }
    }

    console.log('Seeding Initial Chat for main student...');
    const chat = await new Chat({ userId: mainStudentUser._id, title: 'General Inquiry' }).save();
    await new Message({ chatId: chat._id, sender: 'user', content: 'Hello!' }).save();
    await new Message({ chatId: chat._id, sender: 'ai', content: 'Hello Sahanbaaz! I am EduSphere AI. How can I help you today?' }).save();

    console.log('Seeding Notifications for main student...');
    await new Notification({ userId: mainStudentUser._id, title: 'New Assignment', message: 'Neural Network Implementation assignment has been posted.', type: 'info', category: 'announcement', isRead: false }).save();
    await new Notification({ userId: mainStudentUser._id, title: 'Exam Scheduled', message: 'Midterm Examination is scheduled for next week.', type: 'alert', category: 'exam', isRead: false }).save();
    await new Notification({ userId: mainStudentUser._id, title: 'Welcome', message: 'Welcome to EduSphere Student Portal.', type: 'success', category: 'general', isRead: true }).save();

    console.log('Seeding Schedule (Global)...');
    for (let i = 0; i < 15; i++) {
        const randomCourse = faker.helpers.arrayElement(courses);
        await new Schedule({ 
            courseId: randomCourse._id, 
            dayOfWeek: faker.number.int({ min: 1, max: 5 }), 
            startTime: `${faker.number.int({ min: 8, max: 15 })}:00`, 
            endTime: `${faker.number.int({ min: 9, max: 16 })}:30`, 
            room: `Room ${faker.number.int({ min: 100, max: 999 })}` 
        }).save();
    }

    console.log('Seeding Announcements...');
    await new Announcement({
      title: 'Tech Symposium 2026',
      description: 'Join us for the annual technology symposium featuring industry leaders.',
      badge: 'Important',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
      color: 'bg-red-500'
    }).save();
    await new Announcement({
      title: 'Hackathon Registration',
      description: 'Registrations are open for the upcoming 48-hour hackathon.',
      badge: 'Hurry Up',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=300&fit=crop',
      color: 'bg-amber-500'
    }).save();

    console.log('Seeding Roadmap...');
    await new Roadmap({ studentId: mainStudent._id, title: 'Year 1 Basics', status: 'Complete', statusLabel: 'Complete', order: 1 }).save();
    await new Roadmap({ studentId: mainStudent._id, title: 'Core Subjects', status: 'Complete', statusLabel: 'Complete', order: 2 }).save();
    await new Roadmap({ studentId: mainStudent._id, title: 'Advanced Modules', status: 'In Progress', statusLabel: 'In Progress', order: 3 }).save();

    console.log('🎉 Seeding completed successfully with 30 realistic entries each!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
