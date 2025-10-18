import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
let uploads = [
  {
    id: 1,
    userId: "demo",
    patientName: "John Doe",
    fileName: "eob_john.pdf",
    uploadDate: "2025-10-13T10:00:00Z",
    status: "Paid",
  },
  {
    id: 2,
    userId: "demo",
    patientName: "Mary Smith",
    fileName: "auth_mary.pdf",
    uploadDate: "2025-10-12T15:30:00Z",
    status: "Denied",
  },
];
router.get("/:userId", (req, res) => {
  const userUploads = uploads.filter(u => u.userId === req.params.userId);
  res.json(userUploads);
});

export default router;
