"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
dotenv_1.default.config();
const updateToAditya = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        const user = await User_1.default.findOneAndUpdate({ email: 'student@university.edu' }, { email: 'aditya@university.edu' }, { new: true });
        if (user) {
            await Student_1.default.findOneAndUpdate({ userId: user._id }, { firstName: 'Aditya', lastName: 'Kumar' }, { new: true });
            console.log('Successfully updated student to Aditya Kumar (aditya@university.edu)');
        }
        else {
            console.log('Student user not found! Please run npm run seed first.');
        }
        process.exit(0);
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
};
updateToAditya();
//# sourceMappingURL=updateStudent.js.map