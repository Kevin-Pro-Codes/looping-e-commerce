// src/components/admin/ReportsManagement.jsx
import React from "react";
import { FiDownload } from "react-icons/fi";

const ReportsManagement = () => {
  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Reports & Analytics</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center">
            <FiDownload className="inline mr-2" />
            Export CSV
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center">
            <FiDownload className="inline mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Sales Reports</h3>
          <p className="text-sm text-gray-600 mb-3">View detailed sales performance and trends</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">Generate Report</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Inventory Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Stock levels and product performance</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">Generate Report</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">User Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Customer behavior and demographics</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">Generate Report</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Abandoned Cart</h3>
          <p className="text-sm text-gray-600 mb-3">Track and recover abandoned carts</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View Analytics</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Promotions Performance</h3>
          <p className="text-sm text-gray-600 mb-3">Campaign results and ROI</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm">View Report</button>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;