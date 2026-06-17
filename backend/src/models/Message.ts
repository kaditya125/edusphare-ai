import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  sender: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model<IMessage>('Message', MessageSchema);
