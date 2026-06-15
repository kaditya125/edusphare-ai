import mongoose, { Schema, Document } from 'mongoose';

export interface IExam extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  examDate: Date;
  totalMarks: number;
  type: 'Midterm' | 'Final' | 'Quiz' | 'Practical';
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  examDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  type: { type: String, enum: ['Midterm', 'Final', 'Quiz', 'Practical'], required: true },
}, { timestamps: true });

export default mongoose.model<IExam>('Exam', ExamSchema);
