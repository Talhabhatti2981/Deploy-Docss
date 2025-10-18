import React from "react";

export default function ResultsPage() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Document Results</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Payments</h3>
          <div className="border rounded p-3 mb-2 flex justify-between">
            <span>Insurance Payment</span>
            <span className="font-semibold">$250.00</span>
          </div>
          <div className="border rounded p-3 flex justify-between">
            <span>Patient Copay</span>
            <span className="font-semibold">$50.00</span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Denials</h3>
          <div className="border rounded p-3">
            <span>Missing tooth clause — Code D123</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">AI Suggestions</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Check pre-authorization requirements.</li>
          <li>Verify coverage for procedure D123.</li>
        </ul>
      </div>
    </div>
  );
}
