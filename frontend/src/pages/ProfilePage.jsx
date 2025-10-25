import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient"; // your frontend supabase client

const API_BASE =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://dental-production-1c13.up.railway.app"; // your deployed backend

function ProfilePage() {
  const [usage, setUsage] = useState(0);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Get monthly usage
    const usageCount = parseInt(localStorage.getItem("monthlyUsage") || "0");
    setUsage(usageCount);

    // Get logged-in user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });
  }, []);

  // ================= Change Password =================
  const handleChangePassword = async () => {
    setMessage("");
    if (!newPassword || !confirmPassword) {
      return setMessage("❌ Please fill both password fields.");
    }
    if (newPassword !== confirmPassword) {
      return setMessage("❌ Passwords do not match.");
    }

    // Call Supabase update password (frontend)
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage("❌ Error updating password: " + error.message);
    else {
      setMessage("✅ Password updated successfully!");
      setChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // ================= Delete Account =================
  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm(
      "⚠️ Are you sure? This will delete your account permanently!"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Account deleted successfully. Logging out...");
        await supabase.auth.signOut();
        window.location.reload();
      } else {
        setMessage("❌ Error deleting account: " + (data.error || "Unknown"));
      }
    } catch (err) {
      setMessage("❌ Network error. Make sure backend is running.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10 bg-gradient-to-br from-indigo-50 to-blue-100">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-10 w-full max-w-md border border-blue-100"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          👤 My Profile
        </h1>

        {user ? (
          <>
            <div className="space-y-4 text-gray-700">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {user.user_metadata?.full_name || "Dr. Talha"}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p>
                <span className="font-semibold">
                  Documents Processed (This Month):
                </span>{" "}
                {usage}
              </p>
            </div>

            {/* ================= Change Password ================= */}
            <div className="mt-8 space-y-4">
              <h2 className="font-semibold text-gray-800">⚙️ Account Settings</h2>

              {changingPassword ? (
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="New password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      Save Password
                    </button>
                    <button
                      onClick={() => setChangingPassword(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all"
                >
                  Change Password
                </button>
              )}

              {/* ================= Delete Account ================= */}
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-all"
              >
                Delete Account
              </button>
            </div>

            {/* ================= Messages ================= */}
            {message && (
              <div className="mt-4 bg-green-100 text-green-700 p-3 rounded text-center">
                {message}
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-600 text-center">Loading profile...</p>
        )}
      </motion.div>
    </div>
  );
}

export default ProfilePage;
