import mongoose, { Document, Schema } from 'mongoose';

export interface IAudioCache extends Document {
  textHash: string;
  voiceId: string;
  s3Url: string;
  createdAt: Date;
}

const AudioCacheSchema = new Schema({
  textHash: {
    type: String,
    required: true,
    index: true
  },
  voiceId: {
    type: String,
    required: true
  },
  s3Url: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // Optionally expire cache after 30 days
  }
});

// Compound index for quick lookups
AudioCacheSchema.index({ textHash: 1, voiceId: 1 }, { unique: true });

export default mongoose.model<IAudioCache>('AudioCache', AudioCacheSchema);
