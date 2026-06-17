import mongoose, { Document } from 'mongoose';
export interface IAttendance extends Document {
    studentId: mongoose.Types.ObjectId;
    courseId: mongoose.Types.ObjectId;
    facultyId: mongoose.Types.ObjectId;
    date: Date;
    status: 'Present' | 'Absent' | 'Excused';
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAttendance, {}, {}, {}, mongoose.Document<unknown, {}, IAttendance, {}, mongoose.DefaultSchemaOptions> & IAttendance & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAttendance>;
export default _default;
//# sourceMappingURL=Attendance.d.ts.map