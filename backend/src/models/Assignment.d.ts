import mongoose, { Document } from 'mongoose';
export interface IAssignment extends Document {
    courseId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    dueDate: Date;
    totalMarks: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAssignment, {}, {}, {}, mongoose.Document<unknown, {}, IAssignment, {}, mongoose.DefaultSchemaOptions> & IAssignment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssignment>;
export default _default;
//# sourceMappingURL=Assignment.d.ts.map