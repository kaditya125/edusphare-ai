import mongoose, { Schema, Document } from 'mongoose';

export interface IEmbeddingMetadata extends Document {
  mongoId: string;
  sourceType: string;
  lastEmbedded: Date;
  status: 'success' | 'failed';
}

const EmbeddingMetadataSchema: Schema = new Schema({
  mongoId: { type: String, required: true, index: true },
  sourceType: { type: String, required: true },
  lastEmbedded: { type: Date, required: true },
  status: { type: String, enum: ['success', 'failed'], default: 'success' }
});

export default mongoose.model<IEmbeddingMetadata>('EmbeddingMetadata', EmbeddingMetadataSchema);
