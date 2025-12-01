// src/components/admin/ReportsManagement.jsx
import React, { useState } from "react";
import { FiDownload, FiCalendar, FiChevronDown } from "react-icons/fi";

const ReportsManagement = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedDataType, setSelectedDataType] = useState("sales");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [isDataTypeOpen, setIsDataTypeOpen] = useState(false);

  const timePeriods = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "custom", label: "Custom Range" }
  ];

  const dataTypes = [
    { value: "sales", label: "Sales Data" },
    { value: "stock", label: "Stock Data" },
    { value: "order", label: "Order Data" },
    { value: "customer", label: "Customer Data" },
    { value: "delivery", label: "Delivery Data" },
    { value: "inventory", label: "Inventory Data" },
    { value: "user", label: "User Analytics" },
    { value: "promotions", label: "Promotions Performance" }
  ];

  const handleExport = (format) => {
    const periodLabel = timePeriods.find(p => p.value === selectedPeriod)?.label;
    const dataTypeLabel = dataTypes.find(d => d.value === selectedDataType)?.label;
    
    console.log(`Exporting ${periodLabel} ${dataTypeLabel} as ${format}`);
    
    // Here you would typically make an API call to generate the report
    alert(`Preparing ${format} download for ${periodLabel.toLowerCase()} ${dataTypeLabel.toLowerCase()}`);
    
    // Simulate JSON data download
    if (format === 'JSON') {
      const mockData = {
        period: selectedPeriod,
        dataType: selectedDataType,
        timestamp: new Date().toISOString(),
        data: {
          // This would be your actual data from the backend
          sample: "This is mock JSON data"
        }
      };
      
      const dataStr = JSON.stringify(mockData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedDataType}_${selectedPeriod}_report_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const getDataTypeLabel = (value) => {
    return dataTypes.find(d => d.value === value)?.label || "Select Data Type";
  };

  const getPeriodLabel = (value) => {
    return timePeriods.find(p => p.value === value)?.label || "Select Period";
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Reports & Analytics</h2>
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

          {/* Data Type Selector */}
          <div className="relative">
            <button
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center border"
              onClick={() => setIsDataTypeOpen(!isDataTypeOpen)}
            >
              {getDataTypeLabel(selectedDataType)}
              <FiChevronDown className="inline ml-2" />
            </button>
            {isDataTypeOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                {dataTypes.map((dataType) => (
                  <button
                    key={dataType.value}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      selectedDataType === dataType.value ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                    onClick={() => {
                      setSelectedDataType(dataType.value);
                      setIsDataTypeOpen(false);
                    }}
                  >
                    {dataType.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center"
            onClick={() => handleExport('CSV')}
          >
            <FiDownload className="inline mr-2" />
            Export CSV
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center"
            onClick={() => handleExport('PDF')}
          >
            <FiDownload className="inline mr-2" />
            Export PDF
          </button>
          <button 
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center justify-center"
            onClick={() => handleExport('JSON')}
          >
            <FiDownload className="inline mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Selection Display */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          Currently selected: <strong>{getPeriodLabel(selectedPeriod)}</strong> report for <strong>{getDataTypeLabel(selectedDataType)}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Sales Reports</h3>
          <p className="text-sm text-gray-600 mb-3">View detailed sales performance and trends</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('sales')}
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Inventory Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Stock levels and product performance</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('inventory')}
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Customer Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Customer behavior and demographics</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('customer')}
          >
            Generate Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Delivery Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Shipping and delivery performance metrics</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('delivery')}
          >
            View Analytics
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Promotions Performance</h3>
          <p className="text-sm text-gray-600 mb-3">Campaign results and ROI</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('promotions')}
          >
            View Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold mb-3">Order Reports</h3>
          <p className="text-sm text-gray-600 mb-3">Order processing and fulfillment data</p>
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setSelectedDataType('order')}
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;