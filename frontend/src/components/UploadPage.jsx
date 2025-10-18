import React, { useState } from "react";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Upload PDF</h2>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {result && (
        <div className="mt-6 bg-gray-50 p-4 rounded border">
          <p className="font-semibold">File: {result.fileName}</p>
          <pre className="text-sm mt-2 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {result.extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
