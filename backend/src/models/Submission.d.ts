import mongoose, { Document } from 'mongoose';
export interface ISubmission extends Document {
    assignmentId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    fileUrl: string;
    submittedAt: Date;
    marksObtained?: number;
    feedback?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISubmission, {}, {}, {}, mongoose.Document<unknown, {}, ISubmission, {}, mongoose.DefaultSchemaOptions> & ISubmission & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubmission>;
export default _default;
//# sourceMappingURL=Submission.d.ts.map