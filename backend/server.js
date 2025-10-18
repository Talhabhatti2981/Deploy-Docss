import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFParser from "pdf2json";

// ------------------------
// 🧠 Setup
// ------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ------------------------
// ⚙️ CORS Configuration (100% Working)
// ------------------------
const allowedOrigins = [
  "http://localhost:5173", // Local frontend (Vite)
  "https://dental-beta-beryl.vercel.app", // Vercel production frontend (⚠️ no trailing slash)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow requests like Postman
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// ✅ Handle preflight requests properly
app.options("*", cors());

// ------------------------
// 🧾 Middleware
// ------------------------
app.use(express.json());

let uploadsHistory = [];

// ------------------------
// 📂 Multer setup
// ------------------------
const upload = multer({
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// ✅ Ensure uploads folder exists
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });
}

// ------------------------
// 📤 Upload endpoint
// ------------------------
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    console.log("📂 File uploaded:", req.file.originalname);

    const pdfParser = new PDFParser(null, 1);
    const filePath = req.file.path;

    await new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => resolve());
      pdfParser.loadPDF(filePath);
    });

    const extractedText = pdfParser.getRawTextContent();
    console.log("📄 Extracted text (first 100 chars):", extractedText?.slice(0, 100) + "...");

    uploadsHistory.push({
      id: Date.now(),
      userId: req.body.userId || "demo",
      patientName: req.body.patientName || "Unknown",
      fileName: req.file.originalname,
      uploadDate: new Date(),
      status: "Processed",
    });

    // Delete temporary file
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
    res.status(500).json({
      success: false,
      message: "Failed to process PDF file",
      error: error.toString(),
    });
  }
});

// ------------------------
// 🧾 Upload history
// ------------------------
app.get("/api/history/:userId", (req, res) => {
  const userUploads = uploadsHistory.filter((u) => u.userId === req.params.userId);
  res.json(userUploads);
});

// ------------------------
// ✅ Root test route
// ------------------------
app.get("/", (req, res) => {
  res.send("✅ Dental Backend is live and running on Railway!");
});

// ------------------------
// 🚀 Server Start (works local + Railway)
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
