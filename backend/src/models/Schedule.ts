import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  courseId: mongoose.Types.ObjectId;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "10:30"
  endTime: string; // "11:30"
  room: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);
