// src/pages/AdminPanel.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <p>Welcome, Admin 👋</p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Admin Controls</h2>
          <ul className="list-disc ml-6">
            <li>Manage products</li>
            <li>View users</li>
            <li>Access analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
