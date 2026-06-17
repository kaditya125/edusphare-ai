import mongoose, { Document } from 'mongoose';
export interface INotice extends Document {
    title: string;
    category: string;
    date: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    pinned: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INotice, {}, {}, {}, mongoose.Document<unknown, {}, INotice, {}, mongoose.DefaultSchemaOptions> & INotice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotice>;
export default _default;
//# sourceMappingURL=Notice.d.ts.map