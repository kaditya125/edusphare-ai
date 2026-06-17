import mongoose, { Document } from 'mongoose';
export interface IStudent extends Document {
    userId: mongoose.Types.ObjectId;
    enrollmentNumber: string;
    firstName: string;
    lastName: string;
    contactNumber?: string;
    department: string;
    program: string;
    currentSemester: number;
    status: 'Active' | 'Graduated' | 'Suspended';
    cgpa: number;
    sgpa: number;
    creditsEarned: number;
    creditsRemaining: number;
    dob?: string;
    address?: string;
    bio?: string;
    profilePicture?: string;
    skills?: string[];
    advisor?: string;
    enrollmentDate?: string;
    studyPreferences?: {
        focusModeHours: number;
        preferredTime: string;
        limitNotifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IStudent, {}, {}, {}, mongoose.Document<unknown, {}, IStudent, {}, mongoose.DefaultSchemaOptions> & IStudent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IStudent>;
export default _default;
//# sourceMappingURL=Student.d.ts.map