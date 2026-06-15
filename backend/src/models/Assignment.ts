import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
