import mongoose, { Document } from 'mongoose';
export interface IExam extends Document {
    courseId: mongoose.Types.ObjectId;
    title: string;
    examDate: Date;
    totalMarks: number;
    type: 'Midterm' | 'Final' | 'Quiz' | 'Practical';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IExam, {}, {}, {}, mongoose.Document<unknown, {}, IExam, {}, mongoose.DefaultSchemaOptions> & IExam & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExam>;
export default _default;
//# sourceMappingURL=Exam.d.ts.map