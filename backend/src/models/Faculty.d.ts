import mongoose, { Document } from 'mongoose';
export interface IFaculty extends Document {
    userId?: mongoose.Types.ObjectId;
    employeeId: string;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
    researchInterests: string[];
    email: string;
    location: string;
    status: string;
    avatar: string;
    bio: string;
    officeHours: {
        day: string;
        startTime: string;
        endTime: string;
    }[];
    coursesTaught: string[];
    endorsements: {
        trait: string;
        count: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IFaculty, {}, {}, {}, mongoose.Document<unknown, {}, IFaculty, {}, mongoose.DefaultSchemaOptions> & IFaculty & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IFaculty>;
export default _default;
//# sourceMappingURL=Faculty.d.ts.map