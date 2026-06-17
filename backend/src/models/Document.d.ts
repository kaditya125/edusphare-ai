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
export declare const Document: mongoose.Model<IDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDocument, {}, mongoose.DefaultSchemaOptions> & IDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDocument>;
//# sourceMappingURL=Document.d.ts.map