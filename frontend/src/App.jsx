import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "./supabaseClient";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./components/HistoryPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import "./App.css";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔹 Logout handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error during logout:", error.message);
    } else {
      setIsAuthenticated(false);
    }
  };

  return (
    <Router>
      {isAuthenticated ? (
        <div className="flex min-h-screen bg-gray-100 text-gray-900">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content Area */}
          <div
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "ml-64" : "ml-20"
            }`}
          >
            {/* Header */}
            <header className="p-4 bg-white shadow flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-200 transition"
              >
                ☰
              </button>

              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  <span className="text-sm font-medium cursor-pointer">Logout</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                </motion.button>
              </div>
            </header>

            {/* Main Routes */}
            <main className="p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/results" element={<ResultsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // 🔹 Authentication Routes
        <Routes>
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </Router>
  );
}
