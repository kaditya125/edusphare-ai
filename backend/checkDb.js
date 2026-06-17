"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
mongoose_1.default.connect(process.env.MONGODB_URI).then(async () => {
    const Student = require('./src/models/Student').default;
    const Enrollment = require('./src/models/Enrollment').default;
    const Schedule = require('./src/models/Schedule').default;
    const Course = require('./src/models/Course').default;
    const s = await Student.findOne();
    console.log('Student ID:', s._id);
    const e = await Enrollment.find({ studentId: s._id });
    console.log('Enrollments:', e.length);
    const cIds = e.map(x => x.courseId);
    const sch = await Schedule.find({ courseId: { $in: cIds } });
    console.log('Schedules:', sch);
    process.exit(0);
});
//# sourceMappingURL=checkDb.js.map