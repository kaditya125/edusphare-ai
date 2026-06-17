import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyRoom extends Document {
  name: string;
  hostId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  theme: string;
  isActive: boolean;
  createdAt: Date;
}

const StudyRoomSchema = new Schema({
  name: { type: String, required: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
  theme: { type: String, default: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.StudyRoom || mongoose.model<IStudyRoom>('StudyRoom', StudyRoomSchema);
