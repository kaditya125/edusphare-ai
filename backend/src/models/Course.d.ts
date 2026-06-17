import mongoose, { Document } from 'mongoose';
export interface ICourse extends Document {
    courseCode: string;
    title: string;
    description: string;
    credits: number;
    department: string;
    facultyId: mongoose.Types.ObjectId;
    semester: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICourse, {}, {}, {}, mongoose.Document<unknown, {}, ICourse, {}, mongoose.DefaultSchemaOptions> & ICourse & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICourse>;
export default _default;
//# sourceMappingURL=Course.d.ts.map