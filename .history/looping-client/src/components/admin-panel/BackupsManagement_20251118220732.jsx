// src/components/admin/ReportsManagement.jsx
import React, { useState } from "react";
import { FiDownload, FiCalendar, FiChevronDown } from "react-icons/fi";

const BackupsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  const timePeriods = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom Range" }
  ];

  const handleExport = (dataType, format) => {
    const periodLabel = timePeriods.find(p => p.value === selectedPeriod)?.label;
    const dataTypeLabel = backupSections.find(d => d.type === dataType)?.title || dataType;
    
    console.log(`Exporting ${periodLabel} ${dataTypeLabel} as ${format}`);
    
    // Here you would typically make an API call to generate the backup
    alert(`Preparing ${format} download for ${periodLabel.toLowerCase()} ${dataTypeLabel.toLowerCase()}`);
    
    // Simulate data download
    const mockData = {
      period: selectedPeriod,
      dataType: dataType,
      timestamp: new Date().toISOString(),
      data: {
        sample: `This is mock ${format} data for ${dataTypeLabel}`
      }
    };
    
    if (format === 'JSON') {
      const dataStr = JSON.stringify(mockData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataType}_${selectedPeriod}_backup_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'CSV') {
      // Simulate CSV download
      const csvContent = `Period,DataType,Timestamp,Sample\n${selectedPeriod},${dataType},${new Date().toISOString()},"Mock CSV data for ${dataTypeLabel}"`;
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataType}_${selectedPeriod}_backup_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'PDF') {
      // For PDF, you would typically generate on the server
      alert(`PDF generation for ${dataTypeLabel} would be handled by the server`);
    }
  };

  const getPeriodLabel = (value) => {
    return timePeriods.find(p => p.value === value)?.label || "Select Period";
  };

  const backupSections = [
    {
      type: "stock",
      title: "Stock Backups",
      description: "Stock levels and product performance",
      icon: "📦"
    },
    {
      type: "order",
      title: "Order Backups",
      description: "View detailed order processing and fulfillment data",
      icon: "🛒"
    },
    {
      type: "customer",
      title: "Customer Backups",
      description: "Customer behavior and demographics",
      icon: "👥"
    },
    {
      type: "delivery",
      title: "Delivery Backups",
      description: "Shipping and delivery performance metrics",
      icon: "🚚"
    },
    {
      type: "general",
      title: "General Backups",
      description: "Data about overall information",
      icon: "📊"
    },
    {
      type: "marketplace",
      title: "Marketplace Backup",
      description: "Data about the product list",
      icon: "🏪"
    }
  ];

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Backups & Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Time Period Selector */}
          <div className="relative">
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center border"
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            >
              <FiCalendar className="inline mr-2" />
              {getPeriodLabel(selectedPeriod)}
              <FiChevronDown className="inline ml-2" />
            </button>
            {isPeriodOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
                {timePeriods.map((period) => (
                  <button
                    key={period.value}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      selectedPeriod === period.value ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => {
                      setSelectedPeriod(period.value);
                      setIsPeriodOpen(false);
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selection Display */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          Current period: <strong>{getPeriodLabel(selectedPeriod)}</strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Each section has individual download buttons for specific data types
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backupSections.map((section) => (
          <div key={section.type} className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{section.icon}</span>
                  <h3 className="font-semibold text-lg">{section.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">{section.description}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 flex items-center justify-center transition-colors"
                  onClick={() => handleExport(section.type, 'CSV')}
                  title={`Download ${section.title} as CSV`}
                >
                  <FiDownload className="mr-1" size={14} />
                  CSV
                </button>
                <button 
                  className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 flex items-center justify-center transition-colors"
                  onClick={() => handleExport(section.type, 'PDF')}
                  title={`Download ${section.title} as PDF`}
                >
                  <FiDownload className="mr-1" size={14} />
                  PDF
                </button>
                <button 
                  className="flex-1 bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 flex items-center justify-center transition-colors"
                  onClick={() => handleExport(section.type, 'JSON')}
                  title={`Download ${section.title} as JSON`}
                >
                  <FiDownload className="mr-1" size={14} />
                  JSON
                </button>
              </div>
            </div>

            {/* Current period info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Period: <span className="font-medium">{getPeriodLabel(selectedPeriod)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupsManagement;