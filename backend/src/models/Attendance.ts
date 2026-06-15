import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  facultyId: mongoose.Types.ObjectId;
  date: Date;
  status: 'Present' | 'Absent' | 'Excused';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Excused'], required: true },
}, { timestamps: true });

// Prevent duplicate attendance records for the same student, course, and date
AttendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
