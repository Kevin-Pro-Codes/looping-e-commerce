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
    // Clear all authentication data
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Dispatch logout event
    window.dispatchEvent(new Event("loginStateChange"));
    
    navigate("/logar");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-15">
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

        <div className="mb-6">
          <p className="text-lg">Welcome, Admin 👋</p>
          <p className="text-gray-600">You have successfully logged in as an administrator.</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Product Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>Add new products</li>
                <li>Edit existing products</li>
                <li>Delete products</li>
                <li>Manage inventory</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">User Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>View all users</li>
                <li>Manage user accounts</li>
                <li>View user analytics</li>
                <li>Handle user support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
