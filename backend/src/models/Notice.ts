import mongoose, { Schema, Document } from 'mongoose';

export interface INotice extends Document {
  title: string;
  category: string;
  date: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['high', 'medium', 'low'], 
    default: 'medium' 
  },
  pinned: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<INotice>('Notice', NoticeSchema);
