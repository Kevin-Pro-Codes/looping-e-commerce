// src/components/admin/OrdersManagement.jsx
import React, { useState } from "react";
import { FiSearch, FiShoppingBag } from "react-icons/fi";

const OrdersManagement = () => {
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState([
    { id: 1, orderId: "#ORD-001", customer: "João Silva", email: "joao@email.com", product: "Camiseta Finito", quantity: 2, total: 89.90, payment: "Cartão de Crédito", city: "São Paulo, SP", status: "Em Preparação", date: "2024-01-15" },
    { id: 2, orderId: "#ORD-002", customer: "Maria Santos", email: "maria@email.com", product: "Boné Finito", quantity: 1, total: 45.00, payment: "PIX", city: "Rio de Janeiro, RJ", status: "Enviado", date: "2024-01-14" },
    { id: 3, orderId: "#ORD-003", customer: "Pedro Costa", email: "pedro@email.com", product: "Caneca Finito", quantity: 3, total: 75.00, payment: "Boleto", city: "Belo Horizonte, MG", status: "Pendente", date: "2024-01-14" }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Enviado": 
      case "Shipped":
        return "bg-green-100 text-green-800";
      case "Em Preparação": 
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Pendente": 
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Entregue": 
      case "Delivered":
        return "bg-purple-100 text-purple-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Order Management</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search orders..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderId}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {order.total.toFixed(2)}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.payment === "Cartão de Crédito" ? "bg-green-100 text-green-800" :
                      order.payment === "PIX" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="Pendente">Pending</option>
                      <option value="Em Preparação">Processing</option>
                      <option value="Enviado">Shipped</option>
                      <option value="Entregue">Delivered</option>
                      <option value="Cancelado">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">View</button>
                    <button className="text-red-600 hover:text-red-900">Cancel</button>
                    <button className="text-green-600 hover:text-green-900">Invoice</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;