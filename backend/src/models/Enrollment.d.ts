import mongoose, { Document } from 'mongoose';
export interface IEnrollment extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    semester: number;
    grade?: string;
    status: 'Enrolled' | 'Completed' | 'Dropped';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEnrollment, {}, {}, {}, mongoose.Document<unknown, {}, IEnrollment, {}, mongoose.DefaultSchemaOptions> & IEnrollment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEnrollment>;
export default _default;
//# sourceMappingURL=Enrollment.d.ts.map