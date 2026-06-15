import mongoose, { Schema, Document } from 'mongoose';

export interface ITodo extends Document {
  studentId: mongoose.Types.ObjectId;
  text: string;
  isCompleted: boolean;
  priority?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema: Schema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<ITodo>('Todo', TodoSchema);
