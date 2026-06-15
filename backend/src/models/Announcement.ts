import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  description: string;
  badge: string; // 'New', 'Hurry Up', 'Important'
  date: Date;
  image: string;
  color: string; // Tailwind class like 'bg-red-500'
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  badge: { type: String, default: 'New' },
  date: { type: Date, required: true },
  image: { type: String, required: true },
  color: { type: String, default: 'bg-emerald-500' }
}, { timestamps: true });

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
