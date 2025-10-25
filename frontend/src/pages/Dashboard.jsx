import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [history, setHistory] = useState([]);
  const [monthlyCount, setMonthlyCount] = useState(0);

  const API_BASE =
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : "https://dental-production-1c13.up.railway.app";

  // ✅ Load history & monthly stats on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("historyData")) || [];
    setHistory(stored);

    const month = new Date().getMonth();
    const monthlyDocs = stored.filter(
      (h) => new Date(h.date).getMonth() === month
    ).length;
    setMonthlyCount(monthlyDocs);
  }, []);

  // ✅ Handle PDF file select
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
    } else {
      setError("⚠️ Please upload a valid PDF file");
      setFile(null);
      setFileName("");
    }
  };

  // ✅ Upload and process PDF
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("⚠️ Select a PDF first!");

    setLoading(true);
    setProgress(0);
    setResult("");
    setError("");
    setSuccess("");

    const interval = setInterval(() => {
      setProgress((p) => (p < 90 ? p + 10 : p));
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        clearInterval(interval);
        setProgress(100);
        setResult(data.extractedText);
        setSuccess("✅ Document processed successfully!");

        const newEntry = {
          fileName,
          extractedText: data.extractedText,
          date: new Date().toLocaleString(),
          status: "Pending",
        };

        const updated = [...history, newEntry];
        setHistory(updated);
        localStorage.setItem("historyData", JSON.stringify(updated));
        setMonthlyCount((prev) => prev + 1);
      } else {
        setError(data.message || "Failed to extract text");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Backend not reachable or PDF parsing failed.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // ✅ Download extracted text as .txt (with file name & date)
  const handleDownloadText = () => {
    if (!result) return;

    const textToDownload = `📄 File: ${fileName || "ExtractedText"}\nDate: ${new Date().toLocaleString()}\n\n${result}\n\n---\n\n`;

    const blob = new Blob([textToDownload], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName ? fileName.replace(".pdf", "") : "ExtractedText"}.txt`;
    link.click();
  };

  // ✅ Reset local history
  const handleResetHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem("historyData");
      setHistory([]);
      setMonthlyCount(0);
      alert("History cleared successfully!");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-2xl border border-blue-100"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          🦷 Dental Document Processor
        </h1>

        {/* 📊 Analytics Overview */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold text-indigo-600">Total Docs</h2>
            <p className="text-xl font-bold">{history.length}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <h2 className="text-lg font-semibold text-green-700">This Month</h2>
            <p className="text-xl font-bold">{monthlyCount}</p>
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <label
            htmlFor="fileInput"
            className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-all block"
          >
            <input
              type="file"
              accept="application/pdf"
              id="fileInput"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-gray-600">
              {fileName ? (
                <span className="font-semibold text-indigo-600">{fileName}</span>
              ) : (
                "📄 Click or drag a PDF file to upload"
              )}
            </div>
          </label>

          {/* Progress Bar */}
          {loading && (
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium py-3 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-all disabled:opacity-60"
          >
            {loading ? "⏳ Processing..." : "Upload & Extract"}
          </motion.button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-red-100 text-red-700 p-3 rounded text-center"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-green-100 text-green-700 p-3 rounded text-center"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extracted Text */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-gray-50 p-4 rounded border border-gray-200 max-h-80 overflow-auto"
          >
            <h2 className="font-semibold text-gray-800 mb-2">🧠 Extracted Text</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{result}</pre>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleDownloadText}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                💾 Download Text
              </button>
            </div>
          </motion.div>
        )}

        {/* Reset Button */}
        {history.length > 0 && (
          <div className="text-center mt-6">
            <button
              onClick={handleResetHistory}
              className="text-red-600 hover:underline text-sm"
            >
              🧹 Clear History
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;
