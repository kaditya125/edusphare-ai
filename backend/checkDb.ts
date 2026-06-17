import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const Student = require('./src/models/Student').default;
  const Enrollment = require('./src/models/Enrollment').default;
  const Schedule = require('./src/models/Schedule').default;
  const Course = require('./src/models/Course').default;
  
  const s = await Student.findOne();
  console.log('Student ID:', s._id);
  
  const e = await Enrollment.find({studentId: s._id});
  console.log('Enrollments:', e.length);
  
  const cIds = e.map((x: any) => x.courseId);
  const sch = await Schedule.find({courseId: {$in: cIds}});
  console.log('Schedules:', sch);
  process.exit(0);
});
