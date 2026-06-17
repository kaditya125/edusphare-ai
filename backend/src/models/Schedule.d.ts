import mongoose, { Document } from 'mongoose';
export interface ISchedule extends Document {
    courseId: mongoose.Types.ObjectId;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISchedule, {}, {}, {}, mongoose.Document<unknown, {}, ISchedule, {}, mongoose.DefaultSchemaOptions> & ISchedule & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISchedule>;
export default _default;
//# sourceMappingURL=Schedule.d.ts.map