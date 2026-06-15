import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  contactNumber?: string;
  department: string;
  program: string;
  currentSemester: number;
  status: 'Active' | 'Graduated' | 'Suspended';
  cgpa: number;
  sgpa: number;
  creditsEarned: number;
  creditsRemaining: number;
  dob?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  advisor?: string;
  enrollmentDate?: string;
  studyPreferences?: {
    focusModeHours: number;
    preferredTime: string;
    limitNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  enrollmentNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactNumber: { type: String },
  department: { type: String, required: true },
  program: { type: String, required: true },
  currentSemester: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ['Active', 'Graduated', 'Suspended'], default: 'Active' },
  cgpa: { type: Number, default: 0 },
  sgpa: { type: Number, default: 0 },
  creditsEarned: { type: Number, default: 0 },
  creditsRemaining: { type: Number, default: 0 },
  dob: { type: String },
  address: { type: String },
  bio: { type: String },
  skills: [{ type: String }],
  advisor: { type: String },
  enrollmentDate: { type: String },
  studyPreferences: {
    focusModeHours: { type: Number, default: 2 },
    preferredTime: { type: String, default: 'Evening' },
    limitNotifications: { type: Boolean, default: false }
  }
}, { timestamps: true });

export default mongoose.model<IStudent>('Student', StudentSchema);
