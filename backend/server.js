import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFParser from "pdf2json";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config(); // Load .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Supabase Admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Debug info
console.log("✅ Backend deployed:", new Date().toISOString());

// ✅ Allowed frontend origins (for API)
const allowedOrigins = [
  "http://localhost:5173",
  "https://dental-beta-beryl.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());

// ✅ Memory store for uploaded file history
let uploadsHistory = [];

// ✅ Multer setup for PDF uploads
const upload = multer({
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// ✅ Ensure uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================= PDF Upload + Extraction =================
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });

    console.log("📂 File uploaded:", req.file.originalname);

    const pdfParser = new PDFParser(null, 1);
    const filePath = req.file.path;

    await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => resolve());
      pdfParser.loadPDF(filePath);
    });

    const extractedText = pdfParser.getRawTextContent();
    console.log("📄 Extracted text:", extractedText?.slice(0, 80) + "...");

    uploadsHistory.push({
      id: Date.now(),
      userId: req.body.userId || "demo",
      patientName: req.body.patientName || "Unknown",
      fileName: req.file.originalname,
      uploadDate: new Date(),
      status: "Processed",
    });

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error("⚠️ Failed to delete uploaded file:", err);
    });

    res.json({
      success: true,
      fileName: req.file.originalname,
      extractedText: extractedText || "⚠️ No text found in PDF",
    });
  } catch (error) {
    console.error("❌ Error during PDF extraction:", error);
    res.status(500).json({ success: false, message: "Failed to process PDF file" });
  }
});

// ================= Upload History =================
app.get("/api/history/:userId", (req, res) => {
  const userUploads = uploadsHistory.filter((u) => u.userId === req.params.userId);
  res.json(userUploads);
});

// ================= Delete Account =================
app.post("/api/delete-account", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "User ID required" });

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return res.status(500).json({ error: error.message });

    uploadsHistory = uploadsHistory.filter((u) => u.userId !== userId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= Serve Frontend Build =================
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// ✅ Fallback route for React Router (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================= Start Server =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
