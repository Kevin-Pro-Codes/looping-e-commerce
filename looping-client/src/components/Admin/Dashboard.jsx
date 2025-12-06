// src/components/admin/Dashboard.jsx
import React from 'react';
import { 
  FiTrendingUp, FiUsers, FiShoppingBag, FiDollarSign, 
  FiUser, FiShoppingCart 
} from 'react-icons/fi';

const Dashboard = () => {
  const [dashboardStats] = React.useState({
    totalSales: 12450,
    totalUsers: 892,
    totalOrders: 345,
    totalRevenue: 45280,
    revenueChange: 12.5,
    salesChange: 8.2,
    userChange: 15.7,
    orderChange: -3.4
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalSales.toLocaleString()}</p>
            </div>
            <FiTrendingUp className={`text-2xl ${dashboardStats.salesChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.salesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.salesChange >= 0 ? '+' : ''}{dashboardStats.salesChange}% from last month
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
            </div>
            <FiUsers className={`text-2xl ${dashboardStats.userChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.userChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.userChange >= 0 ? '+' : ''}{dashboardStats.userChange}% from last month
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrders}</p>
            </div>
            <FiShoppingBag className={`text-2xl ${dashboardStats.orderChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.orderChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.orderChange >= 0 ? '+' : ''}{dashboardStats.orderChange}% from last month
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${dashboardStats.totalRevenue.toLocaleString()}</p>
            </div>
            <FiDollarSign className={`text-2xl ${dashboardStats.revenueChange >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <p className={`text-sm ${dashboardStats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {dashboardStats.revenueChange >= 0 ? '+' : ''}{dashboardStats.revenueChange}% from last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Sales chart will be displayed here</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Order Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Order chart will be displayed here</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <FiShoppingBag className="text-blue-500 mr-3" />
              <span>New order #ORD-004 received</span>
            </div>
            <span className="text-sm text-gray-500">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center">
              <FiUser className="text-green-500 mr-3" />
              <span>New user registration</span>
            </div>
            <span className="text-sm text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;