import mongoose, { Document } from 'mongoose';
export interface IFile extends Document {
    s3Key: string;
    url: string;
    originalName: string;
    contentType: string;
    size: number;
    uploader: mongoose.Types.ObjectId;
    uploadTimestamp: Date;
}
declare const _default: mongoose.Model<IFile, {}, {}, {}, mongoose.Document<unknown, {}, IFile, {}, mongoose.DefaultSchemaOptions> & IFile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFile>;
export default _default;
//# sourceMappingURL=File.d.ts.map