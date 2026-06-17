import mongoose, { Document } from 'mongoose';
export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, mongoose.DefaultSchemaOptions> & IChat & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChat>;
export default _default;
//# sourceMappingURL=Chat.d.ts.map