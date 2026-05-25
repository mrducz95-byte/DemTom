import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with size limits for base64 images
app.use(express.json({ limit: "15mb" }));

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Real-time API Route for counting shrimp in base64 images
app.post("/api/count-shrimp", async (req, res) => {
  try {
    const { imageBase64, isHighAccuracy } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image content provided." });
    }

    // Prepare image for Gemini
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64,
      },
    };

    const promptText = 
      "Analyze the image of a tray/container/petri-dish containing post-larvae shrimp seed (tôm giống). " +
      "1. Carefully identify and count every single tiny shrimp seed visible in the tray. " +
      "2. Return the total count. " +
      "3. For each identified shrimp seed, estimate its approximate coordinate relative to the image boundaries where x (horizontal) and y (vertical) are percentages between 0.0 and 100.0 (where x=0, y=0 is top-left, and x=100, y=100 is bottom-right). " +
      "4. Only list visible baby shrimps in the main counting container. Avoid counting background noises, dirt particles, or reflections.";

    // Call Gemini with schema definition
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        imagePart,
        { text: promptText }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            count: { 
              type: Type.INTEGER, 
              description: "The total number of detected shrimp seeds." 
            },
            shrimps: {
              type: Type.ARRAY,
              description: "Array containing coordinates of each detected shrimp",
              items: {
                type: Type.OBJECT,
                properties: {
                  x: { type: Type.NUMBER, description: "X coordinate percentage from 0.0 to 100.0" },
                  y: { type: Type.NUMBER, description: "Y coordinate percentage from 0.0 to 100.0" },
                  confidence: { type: Type.NUMBER, description: "Confidence score between 0.5 and 1.0" }
                },
                required: ["x", "y"]
              }
            },
            accuracy: { 
              type: Type.INTEGER, 
              description: "The estimated confidence or accuracy percentage of the count (e.g. 96)" 
            },
            notes: { 
              type: Type.STRING, 
              description: "Observation notes on density, clean/dirty tray surface, and shrimp seed distribution." 
            }
          },
          required: ["count", "shrimps", "accuracy"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI engine.");
    }

    const payload = JSON.parse(resultText);
    res.json(payload);
  } catch (error: any) {
    console.error("Gemini Shrimp Counter Error:", error);
    res.status(500).json({ 
      error: "Không thể nhận diện và đếm tôm. Vui lòng kiểm tra lại hình ảnh hoặc phím API.",
      details: error.message 
    });
  }
});

// Setup Vite Dev server versus compiled production builds
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shrimp Counter Server booted on http://localhost:${PORT}`);
  });
}

startServer();
