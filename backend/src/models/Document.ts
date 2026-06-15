import mongoose, { Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadDate: Date;
  status: "processing" | "ready" | "error";
  extractedText?: string;
  pages?: number;
}

const documentSchema = new mongoose.Schema<IDocument>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["processing", "ready", "error"],
      default: "processing",
    },
    extractedText: { type: String },
    pages: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const Document = mongoose.model<IDocument>("Document", documentSchema);
