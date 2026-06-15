import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
import Document from '../models/Document';
import Notification from '../models/Notification';
import Schedule from '../models/Schedule';
import Announcement from '../models/Announcement';
import Roadmap from '../models/Roadmap';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

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

    console.log('Seeding Faculty...');
    const faculty1User = await new User({ email: 'dr.rajesh@university.edu', passwordHash, role: 'faculty' }).save();
    const faculty1 = await new Faculty({
      userId: faculty1User._id,
      employeeId: 'FAC001',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      department: 'Computer Science',
      designation: 'Professor',
      profilePicture: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rajesh&backgroundColor=b6e3f4'
    }).save();

    const faculty2User = await new User({ email: 'dr.priya@university.edu', passwordHash, role: 'faculty' }).save();
    const faculty2 = await new Faculty({
      userId: faculty2User._id,
      employeeId: 'FAC002',
      firstName: 'Priya',
      lastName: 'Sharma',
      department: 'Mathematics',
      designation: 'Assistant Professor',
      profilePicture: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya&backgroundColor=f4b6d4'
    }).save();

    const faculty3User = await new User({ email: 'dr.anil@university.edu', passwordHash, role: 'faculty' }).save();
    const faculty3 = await new Faculty({
      userId: faculty3User._id,
      employeeId: 'FAC003',
      firstName: 'Anil',
      lastName: 'Desai',
      department: 'Physics',
      designation: 'Associate Professor',
      profilePicture: 'https://api.dicebear.com/7.x/notionists/svg?seed=Anil&backgroundColor=b6f4c8'
    }).save();

    const faculty4User = await new User({ email: 'dr.meena@university.edu', passwordHash, role: 'faculty' }).save();
    const faculty4 = await new Faculty({
      userId: faculty4User._id,
      employeeId: 'FAC004',
      firstName: 'Meena',
      lastName: 'Iyer',
      department: 'Chemistry',
      designation: 'Lecturer',
      profilePicture: 'https://api.dicebear.com/7.x/notionists/svg?seed=Meena&backgroundColor=e6e6fa'
    }).save();

    console.log('Seeding Student...');
    const studentUser = await new User({ email: 'student@university.edu', passwordHash, role: 'student' }).save();
    const student = await new Student({
      userId: studentUser._id,
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

    console.log('Seeding Courses...');
    const course1 = await new Course({
      courseCode: 'CS501',
      title: 'Advanced Machine Learning',
      description: 'Deep learning, neural networks, and advanced predictive modeling.',
      credits: 4,
      department: 'Computer Science',
      facultyId: faculty1._id,
      semester: 3
    }).save();

    const course2 = await new Course({
      courseCode: 'MA502',
      title: 'Discrete Mathematics',
      description: 'Logic, set theory, and combinatorics.',
      credits: 3,
      department: 'Mathematics',
      facultyId: faculty2._id,
      semester: 3
    }).save();

    const course3 = await new Course({
      courseCode: 'PH503',
      title: 'Quantum Computing',
      description: 'Qubits, quantum gates, and algorithms.',
      credits: 4,
      department: 'Physics',
      facultyId: faculty3._id,
      semester: 3
    }).save();

    const course4 = await new Course({
      courseCode: 'CH504',
      title: 'Materials Chemistry',
      description: 'Solid state chemistry and materials.',
      credits: 3,
      department: 'Chemistry',
      facultyId: faculty4._id,
      semester: 3
    }).save();

    console.log('Seeding Enrollments...');
    await new Enrollment({ studentId: student._id, courseId: course1._id, semester: 3 }).save();
    await new Enrollment({ studentId: student._id, courseId: course2._id, semester: 3 }).save();
    await new Enrollment({ studentId: student._id, courseId: course3._id, semester: 3 }).save();
    await new Enrollment({ studentId: student._id, courseId: course4._id, semester: 3 }).save();

    console.log('Seeding Attendance...');
    // Present for some, Absent for others
    await new Attendance({ studentId: student._id, courseId: course1._id, facultyId: faculty1._id, date: new Date(), status: 'Present' }).save();
    await new Attendance({ studentId: student._id, courseId: course2._id, facultyId: faculty2._id, date: new Date(), status: 'Absent' }).save();

    console.log('Seeding Assignments and Submissions...');
    const assignment1 = await new Assignment({
      courseId: course1._id,
      title: 'Neural Network Implementation',
      description: 'Build a CNN from scratch using NumPy.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      totalMarks: 100
    }).save();

    await new Submission({
      assignmentId: assignment1._id,
      studentId: student._id,
      fileUrl: 'https://s3.amazonaws.com/bucket/submission1.zip',
      submittedAt: new Date(),
      marksObtained: 95,
      feedback: 'Excellent work!'
    }).save();

    console.log('Seeding Exams and Results...');
    const midterm = await new Exam({
      courseId: course1._id,
      title: 'Midterm Examination',
      examDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      totalMarks: 100,
      type: 'Midterm'
    }).save();

    await new Result({
      examId: midterm._id,
      studentId: student._id,
      marksObtained: 88,
      grade: 'A'
    }).save();

    console.log('Seeding Initial Chat...');
    const chat = await new Chat({ userId: studentUser._id, title: 'General Inquiry' }).save();
    await new Message({ chatId: chat._id, sender: 'user', content: 'Hello!' }).save();
    await new Message({ chatId: chat._id, sender: 'ai', content: 'Hello Sahanbaaz! I am EduSphere AI. How can I help you today?' }).save();

    console.log('Seeding Notifications...');
    await new Notification({ userId: studentUser._id, title: 'New Assignment', message: 'Neural Network Implementation assignment has been posted.', type: 'info', category: 'announcement', isRead: false }).save();
    await new Notification({ userId: studentUser._id, title: 'Exam Scheduled', message: 'Midterm Examination is scheduled for next week.', type: 'alert', category: 'exam', isRead: false }).save();
    await new Notification({ userId: studentUser._id, title: 'Welcome', message: 'Welcome to EduSphere Student Portal.', type: 'success', category: 'general', isRead: true }).save();

    console.log('Seeding Schedule...');
    const currentDayOfWeek = new Date().getDay();
    await new Schedule({ courseId: course1._id, dayOfWeek: currentDayOfWeek, startTime: '10:30', endTime: '12:00', room: 'Lab 402' }).save();
    await new Schedule({ courseId: course2._id, dayOfWeek: currentDayOfWeek, startTime: '14:00', endTime: '15:30', room: 'Room 305' }).save();
    await new Schedule({ courseId: course3._id, dayOfWeek: currentDayOfWeek, startTime: '16:00', endTime: '17:30', room: 'Physics Lab' }).save();

    const nextDay = (currentDayOfWeek + 1) % 7;
    await new Schedule({ courseId: course4._id, dayOfWeek: nextDay, startTime: '09:00', endTime: '10:30', room: 'Chem Lab' }).save();

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
    await new Announcement({
      title: 'AI Workshop',
      description: 'Hands-on workshop on Generative AI and LLMs.',
      badge: 'New',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
      color: 'bg-emerald-500'
    }).save();

    console.log('Seeding Roadmap...');
    await new Roadmap({ studentId: student._id, title: 'Year 1 Basics', status: 'Complete', statusLabel: 'Complete', order: 1 }).save();
    await new Roadmap({ studentId: student._id, title: 'Core Subjects', status: 'Complete', statusLabel: 'Complete', order: 2 }).save();
    await new Roadmap({ studentId: student._id, title: 'Advanced Modules', status: 'In Progress', statusLabel: 'In Progress', order: 3 }).save();
    await new Roadmap({ studentId: student._id, title: 'Final Project', status: 'Upcoming', statusLabel: 'Upcoming', order: 4 }).save();
    await new Roadmap({ studentId: student._id, title: 'Graduation', status: 'Upcoming', statusLabel: 'May 2027', order: 5 }).save();

    console.log('Seeding Knowledge Base Documents...');
    const documents = [
      {
        title: 'MCA Data Science Curriculum Overview',
        content: 'The Master of Computer Applications (MCA) in Data Science is a 2-year postgraduate program.',
        category: 'academic',
      },
      {
        title: 'Grading and CGPA Policy',
        content: 'The university follows a 10-point grading system. A CGPA of 8.0 or above is considered First Class with Distinction.',
        category: 'academic',
      }
    ].map(doc => ({ ...doc, embedding: new Array(1536).fill(0.1) }));
    await Document.insertMany(documents);

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
