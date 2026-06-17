import mongoose, { Document } from 'mongoose';
export interface IAnnouncement extends Document {
    title: string;
    description: string;
    badge: string;
    date: Date;
    image: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAnnouncement, {}, {}, {}, mongoose.Document<unknown, {}, IAnnouncement, {}, mongoose.DefaultSchemaOptions> & IAnnouncement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAnnouncement>;
export default _default;
//# sourceMappingURL=Announcement.d.ts.map