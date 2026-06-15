import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmap extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  status: 'Complete' | 'In Progress' | 'Upcoming';
  statusLabel?: string; // e.g. "Jan 2025"
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoadmapSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['Complete', 'In Progress', 'Upcoming'], required: true },
  statusLabel: { type: String },
  order: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);
