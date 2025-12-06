// src/components/admin/ReportsManagement.jsx
import React, { useState } from "react";
import { FiDownload, FiCalendar, FiChevronDown, FiX } from "react-icons/fi";

const BackupsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const timePeriods = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom Range" }
  ];

  const handleExport = (dataType, format) => {
    const periodLabel = getPeriodLabel(selectedPeriod);
    const dataTypeLabel = backupSections.find(d => d.type === dataType)?.title || dataType;
    
    // Validate custom range
    if (selectedPeriod === "custom" && (!customRange.startDate || !customRange.endDate)) {
      alert("Please select both start and end dates for custom range");
      return;
    }

    if (selectedPeriod === "custom" && new Date(customRange.startDate) > new Date(customRange.endDate)) {
      alert("Start date cannot be after end date");
      return;
    }
    
    console.log(`Exporting ${periodLabel} ${dataTypeLabel} as ${format}`);
    
    // Here you would typically make an API call to generate the backup
    const rangeText = selectedPeriod === "custom" 
      ? `from ${formatDate(customRange.startDate)} to ${formatDate(customRange.endDate)}`
      : periodLabel.toLowerCase();
    
    alert(`Preparing ${format} download for ${rangeText} ${dataTypeLabel.toLowerCase()}`);
    
    // Simulate data download
    const mockData = {
      period: selectedPeriod,
      dataType: dataType,
      timestamp: new Date().toISOString(),
      dateRange: selectedPeriod === "custom" ? customRange : null,
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
      const fileName = selectedPeriod === "custom" 
        ? `${dataType}_${formatDate(customRange.startDate)}_to_${formatDate(customRange.endDate)}_backup.json`
        : `${dataType}_${selectedPeriod}_backup_${new Date().getTime()}.json`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'CSV') {
      // Simulate CSV download
      const csvContent = `Period,DataType,Timestamp,StartDate,EndDate,Sample\n${selectedPeriod},${dataType},${new Date().toISOString()},"${customRange.startDate}","${customRange.endDate}","Mock CSV data for ${dataTypeLabel}"`;
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = selectedPeriod === "custom" 
        ? `${dataType}_${formatDate(customRange.startDate)}_to_${formatDate(customRange.endDate)}_backup.csv`
        : `${dataType}_${selectedPeriod}_backup_${new Date().getTime()}.csv`;
      link.download = fileName;
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
    if (value === "custom" && customRange.startDate && customRange.endDate) {
      return `${formatDate(customRange.startDate)} - ${formatDate(customRange.endDate)}`;
    }
    return timePeriods.find(p => p.value === value)?.label || "Select Period";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    if (period === "custom") {
      setShowDatePicker(true);
    }
    setIsPeriodOpen(false);
  };

  const handleCustomRangeConfirm = () => {
    if (customRange.startDate && customRange.endDate) {
      setShowDatePicker(false);
    } else {
      alert("Please select both start and end dates");
    }
  };

  const handleCustomRangeCancel = () => {
    setSelectedPeriod("daily");
    setCustomRange({ startDate: "", endDate: "" });
    setShowDatePicker(false);
  };

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

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
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-20">
                {timePeriods.map((period) => (
                  <button
                    key={period.value}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      selectedPeriod === period.value ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => handlePeriodSelect(period.value)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">Select Date Range</h3>
              <button
                onClick={handleCustomRangeCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={customRange.startDate}
                  onChange={(e) => setCustomRange({...customRange, startDate: e.target.value})}
                  max={today}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={customRange.endDate}
                  onChange={(e) => setCustomRange({...customRange, endDate: e.target.value})}
                  min={customRange.startDate}
                  max={today}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black"
                />
              </div>

              {customRange.startDate && customRange.endDate && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    Selected range: <strong>{formatDate(customRange.startDate)}</strong> to <strong>{formatDate(customRange.endDate)}</strong>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleCustomRangeCancel}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomRangeConfirm}
                  disabled={!customRange.startDate || !customRange.endDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Confirm Range
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Display */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          Current period: <strong>{getPeriodLabel(selectedPeriod)}</strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Each section has individual download buttons for specific data types
        </p>
        {selectedPeriod === "custom" && customRange.startDate && customRange.endDate && (
          <p className="text-xs text-green-600 mt-1">
            Custom range selected: {formatDate(customRange.startDate)} to {formatDate(customRange.endDate)}
          </p>
        )}
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
              {selectedPeriod === "custom" && customRange.startDate && customRange.endDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Range: {formatDate(customRange.startDate)} - {formatDate(customRange.endDate)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupsManagement;