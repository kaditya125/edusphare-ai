import mongoose, { Document } from 'mongoose';
export interface IResult extends Document {
    examId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    marksObtained: number;
    grade?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IResult, {}, {}, {}, mongoose.Document<unknown, {}, IResult, {}, mongoose.DefaultSchemaOptions> & IResult & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IResult>;
export default _default;
//# sourceMappingURL=Result.d.ts.map