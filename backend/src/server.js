"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/courseRoutes"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const scheduleRoutes_1 = __importDefault(require("./routes/scheduleRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const todoRoutes_1 = __importDefault(require("./routes/todoRoutes"));
const documents_1 = __importDefault(require("./routes/documents"));
const facultyRoutes_1 = __importDefault(require("./routes/facultyRoutes"));
const noticeRoutes_1 = __importDefault(require("./routes/noticeRoutes"));
const aiTipsRoutes_1 = __importDefault(require("./routes/aiTipsRoutes"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const scheduler_1 = require("./jobs/scheduler");
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'EduSphere AI Backend is running' });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
app.use('/api/students', studentRoutes_1.default);
app.use('/api/courses', courseRoutes_1.default);
app.use('/api/files', fileRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/schedule', scheduleRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/todos', todoRoutes_1.default);
app.use('/api/documents', documents_1.default);
app.use('/api/faculty', facultyRoutes_1.default);
app.use('/api/notices', noticeRoutes_1.default);
app.use('/api/tips', aiTipsRoutes_1.default);
app.use('/api/calendar', calendarRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Database connection & Server start
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
}
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Start Cron jobs
    (0, scheduler_1.initSchedulers)();
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
})
    .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map