const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const updateSarahData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const sarahUser = await db.collection('users').findOne({ email: 'sarah@university.edu' });
    if (!sarahUser) {
      console.log('Sarah not found');
      process.exit(1);
    }
    const sarahStudent = await db.collection('students').findOne({ userId: sarahUser._id });

    console.log('Creating Business Faculty...');
    await db.collection('users').deleteMany({ email: { $in: ['dr.smith@university.edu', 'dr.doe@university.edu'] } });
    await db.collection('faculties').deleteMany({ employeeId: { $in: ['FAC005', 'FAC006'] } });
    
    const fac1 = await db.collection('users').insertOne({ email: 'dr.smith@university.edu', role: 'faculty', createdAt: new Date() });
    const bizFac1 = await db.collection('faculties').insertOne({
      userId: fac1.insertedId, employeeId: 'FAC005', firstName: 'John', lastName: 'Smith', department: 'Business', designation: 'Professor', profilePicture: 'https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=f4e1b6', createdAt: new Date()
    });

    const fac2 = await db.collection('users').insertOne({ email: 'dr.doe@university.edu', role: 'faculty', createdAt: new Date() });
    const bizFac2 = await db.collection('faculties').insertOne({
      userId: fac2.insertedId, employeeId: 'FAC006', firstName: 'Jane', lastName: 'Doe', department: 'Economics', designation: 'Associate Professor', profilePicture: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane&backgroundColor=f4b6b6', createdAt: new Date()
    });

    console.log('Creating Business Courses...');
    await db.collection('courses').deleteMany({ courseCode: { $in: ['BUS101', 'ECO102', 'ACC103'] } });
    const course1 = await db.collection('courses').insertOne({
      courseCode: 'BUS101', title: 'Principles of Management', description: 'Intro to business.', credits: 3, department: 'Business', facultyId: bizFac1.insertedId, semester: 2, createdAt: new Date()
    });
    const course2 = await db.collection('courses').insertOne({
      courseCode: 'ECO102', title: 'Microeconomics', description: 'Supply and demand.', credits: 4, department: 'Economics', facultyId: bizFac2.insertedId, semester: 2, createdAt: new Date()
    });
    const course3 = await db.collection('courses').insertOne({
      courseCode: 'ACC103', title: 'Financial Accounting', description: 'Balance sheets.', credits: 4, department: 'Business', facultyId: bizFac1.insertedId, semester: 2, createdAt: new Date()
    });

    console.log('Replacing Enrollments...');
    await db.collection('enrollments').deleteMany({ studentId: sarahStudent._id });
    await db.collection('attendances').deleteMany({ studentId: sarahStudent._id });
    await db.collection('results').deleteMany({ studentId: sarahStudent._id });
    await db.collection('schedules').deleteMany({ room: 'Business Hall' });

    // Enroll Sarah in new courses
    const newCourseIds = [course1.insertedId, course2.insertedId, course3.insertedId];
    for (const cId of newCourseIds) {
      await db.collection('enrollments').insertOne({ studentId: sarahStudent._id, courseId: cId, semester: 2, status: 'Enrolled', createdAt: new Date() });
      await db.collection('attendances').insertOne({ studentId: sarahStudent._id, courseId: cId, date: new Date(), status: 'Present' });
      await db.collection('results').insertOne({ examId: new mongoose.Types.ObjectId(), studentId: sarahStudent._id, marksObtained: 75, grade: 'B' });
    }

    await db.collection('schedules').insertOne({ courseId: course1.insertedId, dayOfWeek: new Date().getDay(), startTime: '09:00', endTime: '10:30', room: 'Business Hall' });
    await db.collection('schedules').insertOne({ courseId: course2.insertedId, dayOfWeek: new Date().getDay(), startTime: '11:00', endTime: '12:30', room: 'Econ Wing' });

    console.log('Sarah now has Business courses and Business faculty!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateSarahData();
