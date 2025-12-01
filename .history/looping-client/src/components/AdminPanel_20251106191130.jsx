// src/components/admin/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiBarChart2, FiPackage, FiShoppingBag, FiUsers, FiTruck, 
  FiSend, FiPieChart, FiSettings, FiBell, FiMoon, FiChevronDown 
} from "react-icons/fi";

import Dashboard from './Dashboard';
import SaleProducts from './SaleProducts';
import StockManagement from './StockManagement';
import OrdersManagement from './OrdersManagement';
import CustomersManagement from './CustomersManagement';
import DeliveryManagement from './DeliveryManagement';
import PromotionsManagement from './PromotionsManagement';
import ReportsManagement from './ReportsManagement';
import SettingsManagement from './SettingsManagement';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: FiBarChart2 },
    { id: "stock", name: "Stock", icon: FiPackage },
    { id: "products", name: "Products", icon: FiPackage },
    { id: "orders", name: "Orders", icon: FiShoppingBag },
    { id: "customers", name: "Customers", icon: FiUsers },
    { id: "delivery", name: "Delivery", icon: FiTruck },           
    { id: "promotions", name: "Promotions", icon: FiSend },
    { id: "reports", name: "Reports", icon: FiPieChart },
    { id: "settings", name: "Settings", icon: FiSettings }
  ];

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/login");
  };

  const getActiveTabName = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.name : "Dashboard";
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard": return <Dashboard />;
      case "products": return <SaleProducts />;
      case "stock": return <StockManagement />;
      case "orders": return <OrdersManagement />;
      case "customers": return <CustomersManagement />;
      case "delivery": return <DeliveryManagement />;
      case "promotions": return <PromotionsManagement />;
      case "reports": return <ReportsManagement />;
      case "settings": return <SettingsManagement />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen mt-32 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`} style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FiMoon />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 relative">
              <FiBell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
  
        <div className="mb-6">
          <p className="text-lg">Welcome, Admin!</p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You have successfully logged in as an administrator.</p>
        </div>
  
        <div className="sm:hidden mb-6">
          <button
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            className="w-full flex justify-between items-center p-4 border border-gray-300 rounded-lg bg-white text-black"
          >
            <span className="font-medium">{getActiveTabName()}</span>
            <FiChevronDown className={`transform transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {mobileDropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileDropdownOpen(false);
                    }}
                    className={`w-full flex items-center p-4 text-left border-b border-gray-200 last:border-b-0 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3" size={18} />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
  
        <div className="hidden sm:block border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
  
        <div className="mt-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;