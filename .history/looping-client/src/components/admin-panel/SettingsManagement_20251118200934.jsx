// src/components/admin/SettingsManagement.jsx
import React, { useState } from "react";
import { 
  FiSettings, FiShield, FiMoon, FiBell, 
  FiUsers, FiKey, FiDatabase, FiTrendingUp,
  FiDollarSign, FiShoppingBag
} from "react-icons/fi";

const SettingsManagement = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState('');

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <h2 className="text-xl font-semibold">Settings & Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Promotions</h3>
          <p className="text-sm text-gray-600 mb-3">Campaign results and ROI</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('promotions')}
          >
            View Promotions
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Revenue Analytics</h3>
          <p className="text-sm text-gray-600 mb-3">Track sales growth, profitability, and income sources</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('revenue')}
          >
            View Revenue
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Data Management</h3>
          <p className="text-sm text-gray-600 mb-3">Import, export and manage store data</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('data')}
          >
            Manage Data
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Inventory Settings</h3>
          <p className="text-sm text-gray-600 mb-3">Configure stock alerts and inventory rules</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('inventory')}
          >
            Configure Inventory
          </button>
        </div>
      </div>

      {selectedDataType && (
        <div className="bg-white p-6 rounded-lg shadow border mt-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedDataType === 'promotions' && 'Promotions Analytics'}
            {selectedDataType === 'revenue' && 'Revenue Analytics'}
            {selectedDataType === 'data' && 'Data Management'}
            {selectedDataType === 'inventory' && 'Inventory Settings'}
          </h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              {selectedDataType === 'promotions' && 'View and analyze your promotional campaign performance, ROI, and customer engagement metrics.'}
              {selectedDataType === 'revenue' && 'Track sales performance, revenue streams, profit margins, and financial analytics.'}
              {selectedDataType === 'data' && 'Import/export product data, customer information, and backup your store data.'}
              {selectedDataType === 'inventory' && 'Configure low stock alerts, reorder points, and inventory management rules.'}
            </p>
            <div className="mt-4 flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Configure
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setSelectedDataType('')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;