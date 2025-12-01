// src/components/admin/CustomersManagement.jsx
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";

const CustomersManagement = () => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([
    { id: 1, name: "João Silva", email: "joao@email.com", phone: "+55 11 99999-9999", cpf: "123.456.789-00", address: "Rua das Flores, 123 - São Paulo, SP", orders: 5, totalSpent: 450.00, status: "active", lastPurchase: "2024-01-15" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "+55 21 88888-8888", cpf: "987.654.321-00", address: "Av. Copacabana, 456 - Rio de Janeiro, RJ", orders: 3, totalSpent: 180.00, status: "active", lastPurchase: "2024-01-14" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", phone: "+55 31 77777-7777", cpf: "456.789.123-00", address: "Rua da Liberdade, 789 - Belo Horizonte, MG", orders: 2, totalSpent: 120.00, status: "suspended", lastPurchase: "2024-01-10" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "active": 
        return "bg-green-100 text-green-800";
      case "suspended": 
        return "bg-red-100 text-red-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleCustomerStatus = (customerId, currentStatus) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { ...customer, status: currentStatus === "active" ? "suspended" : "active" } : customer
    ));
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.address.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Customer Management</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold">{customer.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {customer.email}</p>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Orders:</strong> {customer.orders}</p>
              <p><strong>Total Spent:</strong> R$ {customer.totalSpent.toFixed(2)}</p>
              <p><strong>Last Purchase:</strong> {customer.lastPurchase}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                onClick={() => toggleCustomerStatus(customer.id, customer.status)}
                className={`text-xs px-3 py-1 rounded ${
                  customer.status === "active" 
                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {customer.status === "active" ? "Suspend" : "Activate"}
              </button>
              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">
                Edit
              </button>
              <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                History
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersManagement;