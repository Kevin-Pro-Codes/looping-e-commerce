// src/components/admin/DeliveryManagement.jsx
import React, { useState } from "react";
import { 
  FiSearch, FiTruck, FiClock, FiRefreshCw, FiCheckCircle 
} from "react-icons/fi";

const DeliveryManagement = () => {
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveries, setDeliveries] = useState([
    { 
      id: 1, 
      orderId: "#ORD-002", 
      customer: "Maria Santos", 
      product: "Boné Finito", 
      quantity: 1,
      price: 45.00, 
      city: "Rio de Janeiro, RJ", 
      address: "Av. Copacabana, 456 - Rio de Janeiro, RJ",
      status: "Enviado", 
      tracking: "BR123456789",
      carrier: "Correios",
      estimatedDelivery: "2024-01-20",
      shippedDate: "2024-01-14",
      deliveryDate: "",
      notes: "Entregue na portaria"
    },
    { 
      id: 2, 
      orderId: "#ORD-001", 
      customer: "João Silva", 
      product: "Camiseta Finito", 
      quantity: 2,
      price: 89.90, 
      city: "São Paulo, SP", 
      address: "Rua das Flores, 123 - São Paulo, SP",
      status: "Em Preparação", 
      tracking: "Preparando envio",
      carrier: "Loggi",
      estimatedDelivery: "2024-01-18",
      shippedDate: "",
      deliveryDate: "",
      notes: "Aguardando confirmação de pagamento"
    },
    { 
      id: 3, 
      orderId: "#ORD-004", 
      customer: "Ana Oliveira", 
      product: "Moletom Finito", 
      quantity: 1,
      price: 120.00, 
      city: "Curitiba, PR", 
      address: "Rua XV de Novembro, 789 - Curitiba, PR",
      status: "Entregue", 
      tracking: "BR987654321",
      carrier: "Jadlog",
      estimatedDelivery: "2024-01-16",
      shippedDate: "2024-01-12",
      deliveryDate: "2024-01-15",
      notes: "Assinatura digital confirmada"
    }
  ]);

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "Entregue": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Enviado": return "bg-green-100 text-green-800 border border-green-200";
      case "Em Preparação": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pendente": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId ? { 
        ...delivery, 
        status: newStatus,
        ...(newStatus === "Enviado" && !delivery.shippedDate && { shippedDate: new Date().toISOString().split('T')[0] }),
        ...(newStatus === "Entregue" && !delivery.deliveryDate && { deliveryDate: new Date().toISOString().split('T')[0] })
      } : delivery
    ));
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.orderId.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customer.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.product.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.status.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.tracking.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold">Delivery Management</h2>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search deliveries..."
            value={deliverySearch}
            onChange={(e) => setDeliverySearch(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
            </div>
            <FiTruck className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Pendente").length}
              </p>
            </div>
            <FiClock className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Enviado").length}
              </p>
            </div>
            <FiRefreshCw className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Entregue").length}
              </p>
            </div>
            <FiCheckCircle className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Address</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier & Tracking</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                    <div className="text-sm text-gray-500">R$ {delivery.price}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">{delivery.city}</div>
                    <div className="text-xs text-gray-400 mt-1">{delivery.address}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">{delivery.product}</div>
                    <div className="text-sm text-gray-500">Qty: {delivery.quantity}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.carrier}</div>
                    <div className="text-sm text-gray-500">{delivery.tracking}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {delivery.shippedDate && `Shipped: ${delivery.shippedDate}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {delivery.estimatedDelivery && `Est: ${delivery.estimatedDelivery}`}
                    </div>
                    {delivery.deliveryDate && (
                      <div className="text-sm text-green-600">Delivered: {delivery.deliveryDate}</div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={delivery.status}
                      onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getDeliveryStatusColor(delivery.status)}`}
                    >
                      <option value="Pendente">Pending</option>
                      <option value="Em Preparação">Processing</option>
                      <option value="Enviado">Shipped</option>
                      <option value="Entregue">Delivered</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">Track</button>
                    <button className="text-green-600 hover:text-green-900">Label</button>
                    <button className="text-blue-600 hover:text-blue-900">Notify</button>
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

export default DeliveryManagement;