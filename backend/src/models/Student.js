"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const StudentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    enrollmentNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactNumber: { type: String },
    department: { type: String, required: true },
    program: { type: String, required: true },
    currentSemester: { type: Number, required: true, default: 1 },
    status: { type: String, enum: ['Active', 'Graduated', 'Suspended'], default: 'Active' },
    cgpa: { type: Number, default: 0 },
    sgpa: { type: Number, default: 0 },
    creditsEarned: { type: Number, default: 0 },
    creditsRemaining: { type: Number, default: 0 },
    dob: { type: String },
    address: { type: String },
    bio: { type: String },
    profilePicture: { type: String },
    skills: [{ type: String }],
    advisor: { type: String },
    enrollmentDate: { type: String },
    studyPreferences: {
        focusModeHours: { type: Number, default: 2 },
        preferredTime: { type: String, default: 'Evening' },
        limitNotifications: { type: Boolean, default: false }
    }
}, { timestamps: true });
exports.default = mongoose_1.default.model('Student', StudentSchema);
//# sourceMappingURL=Student.js.map