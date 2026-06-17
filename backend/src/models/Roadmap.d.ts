import mongoose, { Document } from 'mongoose';
export interface IRoadmap extends Document {
    studentId: mongoose.Types.ObjectId;
    title: string;
    status: 'Complete' | 'In Progress' | 'Upcoming';
    statusLabel?: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRoadmap, {}, {}, {}, mongoose.Document<unknown, {}, IRoadmap, {}, mongoose.DefaultSchemaOptions> & IRoadmap & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRoadmap>;
export default _default;
//# sourceMappingURL=Roadmap.d.ts.map