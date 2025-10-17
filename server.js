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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Text-only generation endpoint
app.post("/generate", async (req, res) => {
  try {
    const { prompt, temperature = 0.9 } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      temperature: parseFloat(temperature),
    });

    res.json({ result: response.text });
  } catch (error) {
    console.error("Gemini Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Multimodal generation endpoint (with image)
app.post("/generate-multimodal", upload.single("file"), async (req, res) => {
  try {
    const { prompt, temperature = 0.9 } = req.body;
    if (!prompt || !req.file) {
      return res.status(400).json({ error: "Prompt and file required" });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: req.file.mimetype || "image/png" } }
          ]
        }
      ],
      temperature: parseFloat(temperature),
    });

    res.json({ result: response.text });
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
