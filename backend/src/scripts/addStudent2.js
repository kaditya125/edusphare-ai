const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

const addStudent2 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Check if Sarah already exists
    const existing = await db.collection('users').findOne({ email: 'sarah@university.edu' });
    if (existing) {
      console.log('Sarah already exists');
      process.exit(0);
    }
    
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const userResult = await db.collection('users').insertOne({
      email: 'sarah@university.edu',
      passwordHash,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    
    const userId = userResult.insertedId;
    
    const studentResult = await db.collection('students').insertOne({
      userId,
      enrollmentNumber: 'STU2026002',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      department: 'BBA Business Administration',
      program: 'Bachelor of Business Administration',
      currentSemester: 2,
      cgpa: 7.2,
      sgpa: 6.8,
      creditsEarned: 24,
      creditsRemaining: 96,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    
    const studentId = studentResult.insertedId;
    
    // Get all courses
    const courses = await db.collection('courses').find().toArray();
    
    // Create enrollments for Sarah
    for (const course of courses) {
      await db.collection('enrollments').insertOne({
        studentId,
        courseId: course._id,
        semester: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      });
      
      // Attendance
      await db.collection('attendances').insertOne({
        studentId,
        courseId: course._id,
        facultyId: course.facultyId,
        date: new Date(),
        status: 'Absent'
      });
    }

    // Schedule
    const currentDayOfWeek = new Date().getDay();
    await db.collection('schedules').insertOne({
        courseId: courses[0]._id, dayOfWeek: currentDayOfWeek, startTime: '10:30', endTime: '12:00', room: 'Business Hall'
    });
    
    // Roadmap
    await db.collection('roadmaps').insertMany([
        { studentId, title: 'Year 1 Basics', status: 'Complete', statusLabel: 'Complete', order: 1 },
        { studentId, title: 'Core Subjects', status: 'In Progress', statusLabel: 'In Progress', order: 2 },
        { studentId, title: 'Advanced Modules', status: 'Upcoming', statusLabel: 'Upcoming', order: 3 },
        { studentId, title: 'Final Project', status: 'Upcoming', statusLabel: 'Upcoming', order: 4 },
        { studentId, title: 'Graduation', status: 'Upcoming', statusLabel: 'May 2028', order: 5 }
    ]);
    
    console.log('Successfully added Sarah Jenkins (sarah@university.edu)');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

addStudent2();
