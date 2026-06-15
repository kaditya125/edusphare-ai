import mongoose from "mongoose";
import dotenv from "dotenv";
import { Document } from "./src/models/Document";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined.");
  process.exit(1);
}

const dummyDocuments = [
  {
    filename: "dummy-syllabus.pdf",
    originalName: "Computer_Science_Syllabus_2025.pdf",
    mimeType: "application/pdf",
    sizeBytes: 2500000,
    uploadDate: new Date(),
    status: "ready",
    pages: 12,
    extractedText: "This is the official Computer Science syllabus for 2025. Course 101 covers introduction to programming using Python. Course 102 covers Data Structures and Algorithms including Binary Search Trees, Hash Maps, and Graphs. The final exam counts for 50% of your grade. Plagiarism is strictly prohibited."
  },
  {
    filename: "dummy-guidelines.pdf",
    originalName: "Student_Handbook_and_Guidelines.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1200000,
    uploadDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    status: "ready",
    pages: 45,
    extractedText: "Welcome to EduSphere. The student handbook outlines the code of conduct. Library hours are from 8 AM to 10 PM. Dress code is smart casual. All students must maintain at least 75% attendance to be eligible for final exams."
  },
  {
    filename: "dummy-research.pdf",
    originalName: "AI_Research_Paper_Draft.pdf",
    mimeType: "application/pdf",
    sizeBytes: 4800000,
    uploadDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
    status: "ready",
    pages: 8,
    extractedText: "Abstract: This paper explores the use of large language models in educational environments. We found that AI mentors increase student engagement by 40%. Introduction: The rapid advancement of generative AI has opened new frontiers in personalized learning..."
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // Clear existing dummy documents if necessary or just insert
    await Document.deleteMany({ filename: { $regex: /^dummy-/ } });

    await Document.insertMany(dummyDocuments);
    console.log("Successfully seeded dummy documents!");

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
