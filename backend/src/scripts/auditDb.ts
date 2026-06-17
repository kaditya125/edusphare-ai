import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';
import Student from '../models/Student';
import Faculty from '../models/Faculty';
import Course from '../models/Course';
import Attendance from '../models/Attendance';
import Assignment from '../models/Assignment';
import Result from '../models/Result';
import Exam from '../models/Exam';
import Notice from '../models/Notice';
import Announcement from '../models/Announcement';
import Chat from '../models/Chat';
import { Document as DocModel } from '../models/Document';

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edusphere');
  console.log("Connected to MongoDB.");

  const models = [
    { name: 'User', model: User },
    { name: 'Student', model: Student },
    { name: 'Faculty', model: Faculty },
    { name: 'Course', model: Course },
    { name: 'Attendance', model: Attendance },
    { name: 'Assignment', model: Assignment },
    { name: 'Result', model: Result },
    { name: 'Exam', model: Exam },
    { name: 'Notice', model: Notice },
    { name: 'Announcement', model: Announcement },
    { name: 'Chat', model: Chat },
    { name: 'Document', model: DocModel },
  ];

  for (const { name, model } of models) {
    try {
      const count = await (model as any).countDocuments();
      const sample = await (model as any).findOne();
      console.log(`\nCollection: ${name}`);
      console.log(`Count: ${count}`);
      if (sample) {
        console.log(`Sample Fields: ${Object.keys(sample.toObject()).join(', ')}`);
      } else {
        console.log(`Sample: null`);
      }
    } catch (e: any) {
      console.log(`Collection: ${name} - Error: ${e.message}`);
    }
  }

  process.exit(0);
}

runAudit();
