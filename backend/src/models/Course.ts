import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  courseCode: string;
  title: string;
  description: string;
  credits: number;
  department: string;
  facultyId: mongoose.Types.ObjectId;
  semester: number;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema({
  courseCode: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  credits: { type: Number, required: true },
  department: { type: String, required: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty', required: true },
  semester: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<ICourse>('Course', CourseSchema);
