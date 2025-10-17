import express from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const upload = multer();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Store uploaded files URIs per session (in production, use Redis/DB)
const uploadedFiles = new Map();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

// Upload file to Gemini File API
app.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File required" });
    }

    const { sessionId = 'default' } = req.body;
    
    console.log(`Uploading file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    // Create blob from buffer
    const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

    // Upload to Gemini File API
    const uploadResult = await ai.files.upload({
      file: fileBlob,
      config: {
        displayName: req.file.originalname,
      },
    });

    console.log(`File uploaded, waiting for processing... (${uploadResult.name})`);

    // Wait for file to be processed
    let fileStatus = await ai.files.get({ name: uploadResult.name });
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 1 minute max

    while (fileStatus.state === 'PROCESSING' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      fileStatus = await ai.files.get({ name: uploadResult.name });
      attempts++;
      console.log(`File processing status: ${fileStatus.state} (attempt ${attempts}/${maxAttempts})`);
    }

    if (fileStatus.state === 'FAILED') {
      throw new Error('File processing failed');
    }

    if (fileStatus.state === 'PROCESSING') {
      throw new Error('File processing timeout');
    }

    // Store file info
    if (!uploadedFiles.has(sessionId)) {
      uploadedFiles.set(sessionId, []);
    }
    
    const fileInfo = {
      name: uploadResult.name,
      uri: fileStatus.uri,
      mimeType: fileStatus.mimeType,
      displayName: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
    };

    uploadedFiles.get(sessionId).push(fileInfo);

    console.log(`File processed successfully: ${fileInfo.uri}`);

    res.json({ 
      success: true, 
      file: fileInfo
    });
  } catch (error) {
    console.error("File upload error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get uploaded files for session
app.get("/files/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const files = uploadedFiles.get(sessionId) || [];
  res.json({ files });
});

// Delete file from Gemini and session
app.delete("/files/:sessionId/:fileName", async (req, res) => {
  try {
    const { sessionId, fileName } = req.params;
    
    // Delete from Gemini
    await ai.files.delete({ name: fileName });
    
    // Remove from session
    if (uploadedFiles.has(sessionId)) {
      const files = uploadedFiles.get(sessionId);
      const filtered = files.filter(f => f.name !== fileName);
      uploadedFiles.set(sessionId, filtered);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("File delete error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt, temperature = 0.9, history = [], fileUris = [], sessionId = 'default' } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    // Create chat with history
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
    });

    // Build message with file references if provided
    let messageParts = [{ text: prompt }];
    
    // Add file references from URIs
    if (fileUris && fileUris.length > 0) {
      const sessionFiles = uploadedFiles.get(sessionId) || [];
      fileUris.forEach(uri => {
        const fileInfo = sessionFiles.find(f => f.uri === uri);
        if (fileInfo) {
          messageParts.push({
            fileData: {
              fileUri: fileInfo.uri,
              mimeType: fileInfo.mimeType
            }
          });
        }
      });
    }

    // Send message with streaming
    const stream = await chat.sendMessageStream({
      message: messageParts,
      temperature: parseFloat(temperature),
    });

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream chunks to client
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Gemini Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.post("/generate-multimodal", upload.single("file"), async (req, res) => {
  try {
    const { prompt, temperature = 0.9, history = [] } = req.body;
    if (!prompt || !req.file) {
      return res.status(400).json({ error: "Prompt and file required" });
    }

    const base64Data = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    console.log(`Processing file: ${req.file.originalname} (${mimeType}, ${(req.file.size / 1024).toFixed(2)} KB)`);

    // Create chat with history
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: JSON.parse(history || '[]'),
    });

    // Send message with file (image, PDF, or document) streaming
    const stream = await chat.sendMessageStream({
      message: [
        { text: prompt },
        { inlineData: { data: base64Data, mimeType: mimeType } }
      ],
      temperature: parseFloat(temperature),
    });

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream chunks to client
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error("Gemini Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📂 Serving static files from: ${path.join(__dirname, "public")}`);
});
