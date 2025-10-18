import React, { useState } from "react";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError("");
    } else {
      setError("Please upload a valid PDF file");
      setFile(null);
      setFileName("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError("Select a PDF first!");

    setLoading(true);
    setResult("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.extractedText);

        // ✅ Save to localStorage for history
        const previousData = JSON.parse(localStorage.getItem("historyData")) || [];
        const newEntry = {
          fileName: fileName,
          extractedText: data.extractedText,
          date: new Date().toLocaleString(),
        };
        const updatedData = [...previousData, newEntry];
        localStorage.setItem("historyData", JSON.stringify(updatedData));

      } else {
        setError(data.message || "Failed to extract text");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Backend not reachable or PDF parsing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-10 w-full max-w-xl border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
          🦷 Dental Insurance Document Processor
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <label
            htmlFor="fileInput"
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all block"
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
                <span className="font-semibold text-blue-600">{fileName}</span>
              ) : (
                "Click or drag PDF to upload"
              )}
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-60"
          >
            {loading ? "Processing..." : "Upload & Extract"}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>
        )}

        {result && (
          <div className="mt-6 bg-gray-50 p-4 rounded border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-2">
              🧠 Extracted Data
            </h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
