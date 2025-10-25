import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiFileText, FiClock, FiUser } from "react-icons/fi";

export default function Sidebar({ sidebarOpen }) {
  const location = useLocation();
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <FiHome /> },
    { name: "Results", path: "/results", icon: <FiFileText /> },
    { name: "History", path: "/history", icon: <FiClock /> },
    { name: "Profile", path: "/profile", icon: <FiUser /> }, // ✅ Profile link
  ];

  useEffect(() => {
    const usage = parseInt(localStorage.getItem("monthlyUsage") || "0");
    setMonthlyUsage(usage);
  }, []);

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white/90 backdrop-blur-md shadow-lg transition-all duration-300 flex flex-col justify-between ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      {/* 🔹 Logo / Title */}
      <div>
        <div className="flex items-center gap-2 p-4">
          <div className="text-3xl">🦷</div>
          {sidebarOpen && <h2 className="text-lg font-semibold">DentalDoc AI</h2>}
        </div>

        {/* 🔹 Navigation Links */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md mx-2 transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:bg-blue-50 text-gray-700"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 🔹 Monthly Usage Progress */}
        {sidebarOpen && (
          <div className="mt-8 px-4">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Monthly Usage</h3>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(monthlyUsage * 10, 100)}%` }} // assuming 10 docs = 100%
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{monthlyUsage} docs this month</p>
          </div>
        )}
      </div>

      {/* 🔹 Footer */}
      <div className="p-4 text-center text-xs text-gray-400">
        {sidebarOpen ? "© 2025 DentalDoc" : "©"}
      </div>
    </aside>
  );
}
