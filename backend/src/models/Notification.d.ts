import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'alert' | 'info' | 'success' | 'warning';
    category: 'general' | 'announcement' | 'deadline' | 'exam' | 'priority';
    actionUrl?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map