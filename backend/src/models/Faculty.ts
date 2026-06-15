import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty extends Document {
  userId?: mongoose.Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  designation: string;
  researchInterests: string[];
  email: string;
  location: string;
  status: string;
  avatar: string;
  bio: string;
  officeHours: { day: string; startTime: string; endTime: string }[];
  coursesTaught: string[];
  endorsements: { trait: string; count: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  employeeId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  researchInterests: { type: [String], default: [] },
  email: { type: String, required: true },
  location: { type: String, default: "" },
  status: { type: String, default: "available" },
  avatar: { type: String, default: "" },
  bio: { type: String, default: "" },
  officeHours: { type: [{ day: String, startTime: String, endTime: String }], default: [] },
  coursesTaught: { type: [String], default: [] },
  endorsements: { type: [{ trait: String, count: Number }], default: [] },
}, { timestamps: true });

export default mongoose.model<IFaculty>('Faculty', FacultySchema);
