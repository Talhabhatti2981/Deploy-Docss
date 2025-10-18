import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("historyData")) || [];
    setHistory(savedData);
    setFilteredData(savedData);
  }, []);

  useEffect(() => {
    let filtered = history;

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.fileName.toLowerCase().includes(search.toLowerCase()) ||
          item.extractedText.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const d = new Date(item.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
    }

    setFilteredData(filtered);
  }, [search, statusFilter, startDate, endDate, history]);

  const updateStatus = (index, newStatus) => {
    const updated = [...history];
    updated[index].status = newStatus;
    setHistory(updated);
    localStorage.setItem("historyData", JSON.stringify(updated));
    setFilteredData(updated);
  };
  const handleSinglePDF = (item) => {
    const doc = new jsPDF("p", "pt", "a4");
    doc.setFontSize(18);
    doc.setTextColor(22, 78, 99);
    doc.text("", 40, 50);
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text("Patient Report", 40, 70);
    doc.text(`Patient Name: ${item.patientName || ""}`, 40, 90);
    doc.text(`Date: ${item.date}`, 40, 110);
    doc.setDrawColor(22, 78, 99);
    doc.line(40, 120, 550, 120);

    autoTable(doc, {
      startY: 140,
      head: [["Field", "Details"]],
      body: [
        ["File Name", item.fileName],
        ["Status", item.status || "Not Set"],
        ["Extracted Text", item.extractedText || "No data available"],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 6,
        lineColor: [230, 230, 230],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [22, 78, 99],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 248, 250] },
    });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        40,
        doc.internal.pageSize.height - 30
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 80,
        doc.internal.pageSize.height - 30
      );
    }

    doc.save(`${item.fileName || "Patient_Report"}.pdf`);
  };

  const handleDownloadAllPDF = () => {
    const doc = new jsPDF("p", "pt", "a4");

    doc.setFontSize(18);
    doc.setTextColor(22, 78, 99);
    doc.text("Harish Dental Clinic", 40, 50);
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text("All Patients - Dental Insurance Report", 40, 70);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 90);

    doc.setDrawColor(22, 78, 99);
    doc.line(40, 100, 550, 100);

    autoTable(doc, {
      startY: 120,
      head: [["File Name", "Date", "Status", "Extracted Text"]],
      body: filteredData.map((item) => [
        item.fileName,
        item.date,
        item.status || "Not Set",
        item.extractedText.substring(0, 90) + "...",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [22, 78, 99],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
        lineColor: [230, 230, 230],
        lineWidth: 0.5,
      },
      alternateRowStyles: { fillColor: [245, 248, 250] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 80,
        doc.internal.pageSize.height - 30
      );
    }

    doc.save("Dental_History_Report_All.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          Document History
        </h2>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="🔍 Search by file or text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Denied">Denied</option>
              <option value="Pending">Pending</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 hover:bg-blue-700 transition"
            onClick={handleDownloadAllPDF}
          >
            📄 Download All as PDF
          </button>
        </div>

        {filteredData.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No records found.</div>
        ) : (
          <div className="space-y-5">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600">
                      {item.fileName}
                    </h3>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Denied"
                        ? "bg-red-100 text-red-700"
                        : item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.status || "Not Set"}
                  </span>
                </div>

                <div className="flex gap-3 mb-4 flex-wrap">
                  <button
                    onClick={() => updateStatus(index, "Paid")}
                    className="px-4 py-1.5 rounded-lg text-white bg-green-500 hover:bg-green-600 shadow-sm hover:shadow-md transition"
                  >
                    Mark Paid
                  </button>
                  <button
                    onClick={() => updateStatus(index, "Denied")}
                    className="px-4 py-1.5 rounded-lg text-white bg-red-500 hover:bg-red-600 shadow-sm hover:shadow-md transition"
                  >
                    Mark Denied
                  </button>
                  <button
                    onClick={() => updateStatus(index, "Pending")}
                    className="px-4 py-1.5 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 shadow-sm hover:shadow-md transition"
                  >
                    Mark Pending
                  </button>

                  {/* Individual PDF Download */}
                  <button
                    onClick={() => handleSinglePDF(item)}
                    className="ml-auto px-4 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition"
                  >
                    📄 Download PDF
                  </button>
                </div>

                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-4 overflow-x-auto">
                  {item.extractedText}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
