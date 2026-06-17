import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pdfParse from "pdf-parse";
import { Document } from "../models/Document";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import { generateEmbedding } from '../ai/embeddingService';
import { queryKnowledge } from '../services/pineconeService';

dotenv.config();

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/documents
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { filename, originalname, mimetype, size } = req.file;

    // Create document in DB as 'processing'
    const document = new Document({
      filename,
      originalName: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      status: "processing",
    });
    await document.save();

    res.status(201).json(document);

    // Process file asynchronously
    processFile(document.id, req.file.path).catch(console.error);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload document" });
  }
});

async function processFile(docId: string, filePath: string) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    let extractedText = "";
    let pages = 1;

    // We only support PDF text extraction for now
    if (filePath.toLowerCase().endsWith(".pdf")) {
      const data = await (pdfParse as any)(dataBuffer);
      extractedText = data.text;
      pages = data.numpages || 1;
    } else {
      // For text files or others, just convert buffer to string
      extractedText = dataBuffer.toString("utf-8");
    }

    await Document.findByIdAndUpdate(docId, {
      status: "ready",
      extractedText,
      pages,
    });
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    await Document.findByIdAndUpdate(docId, { status: "error" });
  }
}

// GET /api/documents
router.get("/", async (req, res) => {
  try {
    // Select all fields except extractedText (too large)
    const documents = await Document.find().select("-extractedText").sort({ uploadDate: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// GET /api/documents/:id
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Not found" });
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Not found" });

    const filePath = path.join(__dirname, "../../uploads", document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete document" });
  }
});

// POST /api/documents/:id/chat
router.post("/:id/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    if (!document.extractedText) {
      return res.status(400).json({ error: "Document text not extracted yet" });
    }

    const queryEmbedding = await generateEmbedding(prompt);
    const pineconeMatches = await queryKnowledge(queryEmbedding, 3);
    const knowledgeContext = pineconeMatches
      .map((match: any) => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
      .join('\n\n');

    const systemMessage = `You are a helpful AI assistant representing the document named "${document.originalName}".
Answer the user's questions using the document content below. You may also refer to the general university context to supplement your answers if necessary.

UNIVERSITY CONTEXT:
${knowledgeContext}

DOCUMENT CONTENT:
${document.extractedText.substring(0, 15000)} // truncate to avoid token limits for this basic implementation`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
    });

    const response = chatCompletion.choices[0]?.message?.content || "I could not generate a response.";
    res.json({ response });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

// POST /api/documents/:id/analyze-text
router.post("/:id/analyze-text", async (req, res) => {
  try {
    const { selectedText, action } = req.body;
    if (!selectedText || !action) {
      return res.status(400).json({ error: "Missing selectedText or action" });
    }

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const queryEmbedding = await generateEmbedding(selectedText);
    const pineconeMatches = await queryKnowledge(queryEmbedding, 3);
    const knowledgeContext = pineconeMatches
      .map((match: any) => `[${match.metadata?.sourceType}]: ${match.metadata?.content}`)
      .join('\n\n');

    let systemMessage = "";
    if (action === "summarize") {
      systemMessage = `You are a helpful AI assistant. Summarize the following text selected from a document in a concise and clear manner. Do not include introductory conversational phrases, just provide the summary directly.\n\nUniversity Context:\n${knowledgeContext}`;
    } else if (action === "explain") {
      systemMessage = `You are a helpful AI assistant. Explain the following text selected from a document. Break down complex concepts so they are easy to understand. You can use the provided University Context if it helps clarify university-specific terms.\n\nUniversity Context:\n${knowledgeContext}\n\nDo not include introductory conversational phrases, just provide the explanation directly.`;
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: selectedText },
      ],
      model: "llama-3.1-8b-instant",
    });

    const response = chatCompletion.choices[0]?.message?.content || "I could not generate a response.";
    res.json({ response });
  } catch (error: any) {
    console.error("Groq Error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

export default router;
