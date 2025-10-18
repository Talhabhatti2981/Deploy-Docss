import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiFileText, FiClock } from "react-icons/fi"; // added FiClock for History icon

export default function Sidebar({ sidebarOpen }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: <FiHome /> },
    { name: "Results", path: "/results", icon: <FiFileText /> },
    { name: "History", path: "/history", icon: <FiClock /> }, // ✅ new link
  ];

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
      </div>

      {/* 🔹 Footer / Small Text */}
      <div className="p-4 text-center text-xs text-gray-400">
        {sidebarOpen ? "© 2025 DentalDoc" : "©"}
      </div>
    </aside>
  );
}
