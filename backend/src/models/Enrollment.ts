import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  semester: number;
  grade?: string;
  status: 'Enrolled' | 'Completed' | 'Dropped';
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  semester: { type: Number, required: true },
  grade: { type: String },
  status: { type: String, enum: ['Enrolled', 'Completed', 'Dropped'], default: 'Enrolled' },
}, { timestamps: true });

// A student can only enroll in a course once per semester
EnrollmentSchema.index({ studentId: 1, courseId: 1, semester: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
