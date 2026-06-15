import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  s3Key: string;
  url: string;
  originalName: string;
  contentType: string;
  size: number;
  uploader: mongoose.Types.ObjectId;
  uploadTimestamp: Date;
}

const FileSchema: Schema = new Schema({
  s3Key: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  uploadTimestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IFile>('File', FileSchema);
