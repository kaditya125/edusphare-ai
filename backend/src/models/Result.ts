import mongoose, { Schema, Document } from 'mongoose';

export interface IResult extends Document {
  examId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  marksObtained: number;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema: Schema = new Schema({
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  marksObtained: { type: Number, required: true },
  grade: { type: String },
}, { timestamps: true });

// A student can only have one result per exam
ResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IResult>('Result', ResultSchema);
