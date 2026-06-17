import mongoose, { Document } from 'mongoose';
export interface IAudioCache extends Document {
    textHash: string;
    voiceId: string;
    s3Url: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IAudioCache, {}, {}, {}, mongoose.Document<unknown, {}, IAudioCache, {}, mongoose.DefaultSchemaOptions> & IAudioCache & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAudioCache>;
export default _default;
//# sourceMappingURL=AudioCache.d.ts.map