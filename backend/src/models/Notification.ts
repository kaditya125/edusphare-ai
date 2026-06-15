import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  category: 'general' | 'announcement' | 'deadline' | 'exam' | 'priority';
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'info', 'success', 'warning'], default: 'info' },
  category: { type: String, enum: ['general', 'announcement', 'deadline', 'exam', 'priority'], default: 'general' },
  actionUrl: { type: String },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
