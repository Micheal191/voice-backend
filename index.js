const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

// Setup OpenAI with API key
const openai = new OpenAI({
  apiKey: "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",
});

const app = express();

// ✅ Allow frontend on any origin (or restrict to mobile IP)
app.use(cors());

app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// File upload setup
const upload = multer({ dest: "uploads/" });

// 🎙️ Transcription endpoint
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    console.log("📥 /transcribe endpoint hit");

    if (!req.file) {
      console.warn("❌ No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const audioPath = path.resolve(req.file.path);
    console.log("📂 Received file:", audioPath);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
    });

    console.log("✅ Transcription result:", transcription.text);

    fs.unlinkSync(audioPath); // cleanup
    res.json({ text: transcription.text });
  } catch (err) {
    console.error("❌ Transcription error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://192.168.1.3:${PORT}/transcribe`);
});
