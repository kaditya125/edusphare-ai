import mongoose, { Document } from 'mongoose';
export interface IMessage extends Document {
    chatId: mongoose.Types.ObjectId;
    sender: 'user' | 'ai';
    content: string;
    timestamp: Date;
}
declare const _default: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, mongoose.DefaultSchemaOptions> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMessage>;
export default _default;
//# sourceMappingURL=Message.d.ts.map