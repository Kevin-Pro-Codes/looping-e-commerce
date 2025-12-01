// src/components/admin/SettingsManagement.jsx
import React, { useState } from "react";
import { 
  FiSettings, FiShield, FiMoon, FiBell, 
  FiUsers, FiKey, FiDatabase 
} from "react-icons/fi";

const SettingsManagement = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <h2 className="text-xl font-semibold">Settings & Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiSettings className="mr-2" />
            Store Configuration
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Store Information
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Tax & Currency Settings
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Shipping Options
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Payment Gateways
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiShield className="mr-2" />
            Security & Admin
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>Admin Users</span>
              <FiUsers className="text-gray-400" />
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>Two-Factor Authentication</span>
              <FiKey className="text-gray-400" />
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>API Keys & Integrations</span>
              <FiDatabase className="text-gray-400" />
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
              <span>Backup & Restore</span>
              <FiDatabase className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiMoon className="mr-2" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  darkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Theme Customization
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FiBell className="mr-2" />
            Notifications
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Email Preferences
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Real-time Alerts
            </button>
            <button className="w-full text-left p-3 border rounded-lg hover:bg-gray-50">
              Mobile Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;