import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFParser from "pdf2json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://dental-beta-beryl.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Handle preflight OPTIONS requests globally
app.options("*", cors());

// ✅ Multer setup
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

let uploadsHistory = [];

// ✅ Upload endpoint
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
    console.log("📄 Extracted text:", extractedText?.slice(0, 100) + "...");

    uploadsHistory.push({
      id: Date.now(),
      userId: req.body.userId || "demo",
      patientName: req.body.patientName || "Unknown",
      fileName: req.file.originalname,
      uploadDate: new Date(),
      status: "Processed",
    });

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

// ✅ History route
app.get("/api/history/:userId", (req, res) => {
  const userUploads = uploadsHistory.filter((u) => u.userId === req.params.userId);
  res.json(userUploads);
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Backend running on Railway with full CORS support!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
