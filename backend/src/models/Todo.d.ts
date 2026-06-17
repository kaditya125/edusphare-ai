import mongoose, { Document } from 'mongoose';
export interface ITodo extends Document {
    studentId: mongoose.Types.ObjectId;
    text: string;
    isCompleted: boolean;
    priority?: string;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITodo, {}, {}, {}, mongoose.Document<unknown, {}, ITodo, {}, mongoose.DefaultSchemaOptions> & ITodo & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITodo>;
export default _default;
//# sourceMappingURL=Todo.d.ts.map