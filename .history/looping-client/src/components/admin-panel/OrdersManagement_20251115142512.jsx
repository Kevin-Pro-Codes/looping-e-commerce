import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiRefreshCw, FiPackage, FiXCircle, FiUser, FiMapPin, FiDollarSign, FiCreditCard, FiTrash2 } from "react-icons/fi";
import { SiPix } from "react-icons/si";

const OrdersManagement = () => {
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  
  const API_ENDPOINTS = {
    ORDERS: `${API_BASE_URL}/orders`,
    ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  };

  // ✅ Safe data access helper
  const safeAccess = (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // ✅ Safe API fetch wrapper
  const safeFetch = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  // ✅ Fetch orders from API
  const fetchOrdersFromAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching orders from API...');
      const response = await safeFetch(API_ENDPOINTS.ORDERS);
      
      // Handle different response formats
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response && response.data) {
        ordersData = [response.data];
      } else {
        ordersData = [];
      }
      
      console.log('📦 Raw API response:', response);
      console.log('📦 Processed orders data:', ordersData);

      // Normalize the orders data
      const normalizedOrders = ordersData
        .map(order => normalizeOrderData(order))
        .filter(order => order !== null);

      console.log(`✅ Loaded ${normalizedOrders.length} orders from API`);
      setOrders(normalizedOrders);
      
    } catch (error) {
      console.error("❌ Error fetching orders from API:", error);
      setError(`Erro ao carregar pedidos: ${error.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Normalize order data from API response
  const normalizeOrderData = (orderData) => {
    try {
      if (!orderData) {
        console.warn('❌ Order data is null or undefined');
        return null;
      }

      // Handle Laravel API response format (data.attributes or direct properties)
      const order = orderData.attributes || orderData;
      
      // Extract data safely
      const id = safeAccess(orderData, 'id');
      const orderNumber = safeAccess(order, 'order_number') || `LOOP-${id || 'N/A'}`;
      const customerName = safeAccess(order, 'customer_name') || safeAccess(order, 'customer.name') || 'Cliente';
      const customerEmail = safeAccess(order, 'customer_email') || safeAccess(order, 'customer.email') || 'cliente@email.com';
      const total = parseFloat(safeAccess(order, 'total', 0)) || 0;
      const status = safeAccess(order, 'status', 'pending');
      const paymentMethod = safeAccess(order, 'payment_method') || safeAccess(order, 'payment.method', 'pix');
      const createdAt = safeAccess(order, 'created_at') || new Date().toISOString();

      // Format date safely
      let formattedDate = 'N/A';
      try {
        formattedDate = new Date(createdAt).toLocaleDateString('pt-BR');
      } catch {
        formattedDate = 'Data inválida';
      }

      // Handle items safely
      let items = [];
      const rawItems = safeAccess(order, 'items', []);
      if (Array.isArray(rawItems)) {
        items = rawItems.map(item => ({
          product_name: safeAccess(item, 'product_name', 'Produto'),
          quantity: parseInt(safeAccess(item, 'quantity', 1)) || 1,
          price: parseFloat(safeAccess(item, 'price', 0)) || 0,
          total: parseFloat(safeAccess(item, 'total', 0)) || 0
        }));
      }

      // Handle shipping address safely
      const shippingAddress = {
        street: safeAccess(order, 'shipping_street') || safeAccess(order, 'shipping_address.street', ''),
        number: safeAccess(order, 'shipping_number') || safeAccess(order, 'shipping_address.number', ''),
        complement: safeAccess(order, 'shipping_complement') || safeAccess(order, 'shipping_address.complement', ''),
        neighborhood: safeAccess(order, 'shipping_neighborhood') || safeAccess(order, 'shipping_address.neighborhood', ''),
        city: safeAccess(order, 'shipping_city') || safeAccess(order, 'shipping_address.city', ''),
        state: safeAccess(order, 'shipping_state') || safeAccess(order, 'shipping_address.state', ''),
        zip_code: safeAccess(order, 'shipping_zip_code') || safeAccess(order, 'shipping_address.zip_code', '')
      };

      const normalizedOrder = {
        id: id || `temp-${Date.now()}-${Math.random()}`,
        order_number: orderNumber,
        orderId: orderNumber,
        customer: customerName,
        customer_name: customerName,
        email: customerEmail,
        customer_email: customerEmail,
        phone: safeAccess(order, 'customer_phone') || safeAccess(order, 'customer.phone', ''),
        cpf: safeAccess(order, 'customer_cpf') || safeAccess(order, 'customer.cpf', ''),
        total: total,
        subtotal: parseFloat(safeAccess(order, 'subtotal', total)) || total,
        shipping: parseFloat(safeAccess(order, 'shipping', 0)) || 0,
        discount: parseFloat(safeAccess(order, 'discount', 0)) || 0,
        payment: paymentMethod,
        payment_method: paymentMethod,
        payment_status: safeAccess(order, 'payment_status') || safeAccess(order, 'payment.status', 'paid'),
        status: status,
        created_at: createdAt,
        date: formattedDate,
        shipping_address: shippingAddress,
        items: items,
        pix_data: safeAccess(order, 'pix_data') || safeAccess(order, 'payment.pix_data', null),
        metadata: safeAccess(order, 'metadata', {})
      };

      return normalizedOrder;

    } catch (error) {
      console.error('❌ Error normalizing order data:', error, orderData);
      return null;
    }
  };

  // ✅ Update order status via API
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      // Update via API
      await safeFetch(API_ENDPOINTS.ORDER_STATUS(orderId), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      
      // Update locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order && order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      console.log(`✅ Successfully updated order ${orderId} status to ${newStatus}`);
      
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      setError('Erro ao atualizar status do pedido. Tente novamente.');
    }
  };

  // ✅ Delete order via API
  const deleteOrder = async (orderId) => {
    try {
      console.log(`🗑️ Deleting order ${orderId}`);
      
      // Delete via API
      await safeFetch(API_ENDPOINTS.ORDER_BY_ID(orderId), {
        method: 'DELETE'
      });
      
      // Remove from local state
      setOrders(prevOrders => prevOrders.filter(order => order && order.id !== orderId));
      
      console.log(`✅ Successfully deleted order ${orderId}`);
      setDeleteConfirm(null);
      
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      setError("Erro ao excluir pedido. Tente novamente.");
    }
  };

  // ✅ Generate sample orders (mock function for now)
  const generateSampleOrders = async () => {
    try {
      if (window.confirm("Esta função geraria pedidos de exemplo no banco de dados. Continuar?")) {
        // For now, just add mock data locally
        const mockOrders = [
          {
            id: `sample-${Date.now()}-1`,
            order_number: 'LOOP-1001',
            orderId: 'LOOP-1001',
            customer_name: 'Cliente Exemplo 1',
            customer_email: 'cliente1@email.com',
            total: 149.90,
            status: 'pending',
            payment_method: 'pix',
            date: new Date().toLocaleDateString('pt-BR'),
            items: [
              { product_name: 'Camiseta Loop Basic', quantity: 2, price: 74.95, total: 149.90 }
            ]
          },
          {
            id: `sample-${Date.now()}-2`,
            order_number: 'LOOP-1002',
            orderId: 'LOOP-1002',
            customer_name: 'Cliente Exemplo 2',
            customer_email: 'cliente2@email.com',
            total: 89.90,
            status: 'processing',
            payment_method: 'credit_card',
            date: new Date().toLocaleDateString('pt-BR'),
            items: [
              { product_name: 'Boné Loop Premium', quantity: 1, price: 89.90, total: 89.90 }
            ]
          }
        ];

        const normalizedOrders = mockOrders.map(order => normalizeOrderData(order)).filter(order => order !== null);
        setOrders(prev => [...normalizedOrders, ...prev]);
        
        console.log(`📦 Generated ${normalizedOrders.length} sample orders`);
      }
    } catch (error) {
      console.error("❌ Error generating sample orders:", error);
      setError('Erro ao gerar pedidos de exemplo.');
    }
  };

  // ✅ Debug function to check API connection
  const debugAPI = async () => {
    try {
      const response = await safeFetch(API_ENDPOINTS.ORDERS);
      console.log('🔍 Full API response:', response);
      alert(`API Response logged to console. Status: ${response ? 'Success' : 'No data'}`);
    } catch (error) {
      console.error('❌ Debug API error:', error);
      setError(`API Connection Failed: ${error.message}`);
    }
  };

  // ✅ Clear all orders (placeholder - would need backend endpoint)
  const clearAllOrders = () => {
    if (window.confirm("Esta função limparia todos os pedidos do banco de dados. Continuar?")) {
      alert('Funcionalidade de limpar todos os pedidos requer endpoint backend específico.');
    }
  };

  // ✅ Status and payment helpers
  const getStatusText = (status) => {
    if (!status) return 'Desconhecido';
    const statusMap = {
      "pending": "Pendente",
      "processing": "Em Preparação", 
      "shipped": "Enviado",
      "delivered": "Entregue",
      "cancelled": "Cancelado"
    };
    return statusMap[status] || status;
  };

  const getPaymentText = (payment) => {
    if (!payment) return 'Desconhecido';
    const paymentMap = {
      "pix": "PIX",
      "credit_card": "Cartão de Crédito",
      "credit": "Cartão de Crédito",
      "debit_card": "Cartão de Débito", 
      "debit": "Cartão de Débito",
      "boleto": "Boleto"
    };
    return paymentMap[payment] || payment;
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 border border-gray-200";
    switch (status) {
      case "shipped": return "bg-green-100 text-green-800 border border-green-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "pending": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "delivered": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentColor = (payment) => {
    if (!payment) return "bg-gray-100 text-gray-800";
    switch (payment) {
      case "credit_card":
      case "credit": return "bg-green-100 text-green-800";
      case "pix": return "bg-blue-100 text-blue-800";
      case "boleto": return "bg-purple-100 text-purple-800";
      case "debit_card":
      case "debit": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Safe number formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  // ✅ Filter orders
  const filteredOrders = orders.filter(order => 
    order && (
      (order.orderId && order.orderId.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(orderSearch.toLowerCase())) ||
      getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
      getPaymentText(order.payment).toLowerCase().includes(orderSearch.toLowerCase())
    )
  );

  // UI Helper functions
  const confirmDelete = (order) => {
    if (order && order.id) {
      setDeleteConfirm(order);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const viewOrderDetails = (order) => {
    if (order) {
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  // ✅ Load orders on component mount
  useEffect(() => {
    fetchOrdersFromAPI();
  }, []);

  // ✅ Error display
  if (error) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="space-x-3">
          <button
            onClick={fetchOrdersFromAPI}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
          <button
            onClick={debugAPI}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Debug API
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar pedidos..."
              disabled
              className="w-full p-2 pl-10 border border-gray-300 rounded text-gray-400 bg-gray-100"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
          <p className="text-gray-500 text-sm">Conectando ao banco de dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrdersFromAPI}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={16} />
            Atualizar
          </button>

          <button
            onClick={debugAPI}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Debug API
          </button>

          <button
            onClick={generateSampleOrders}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiPackage size={16} />
            Gerar Exemplos
          </button>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Rest of your JSX remains the same */}
      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                order && (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId || 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer_name || 'Cliente'}</div>
                    <div className="text-sm text-gray-500">{order.customer_email || 'N/A'}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date || 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment)}`}>
                      {getPaymentText(order.payment)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="processing">Em Preparação</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                      title="Ver Detalhes"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors"
                      title="Cancelar Pedido"
                    >
                      <FiXCircle size={16} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(order)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Excluir Pedido"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
                )
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-4">
              {orderSearch ? 'Tente ajustar os termos de busca' : 'Nenhum pedido no sistema ainda'}
            </p>
            <div className="space-x-3">
              <button
                onClick={generateSampleOrders}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Gerar Pedidos de Exemplo
              </button>
              <button
                onClick={debugAPI}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Verificar API
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal and Delete Confirmation Modal remain the same */}
      {/* ... */}
    </div>
  );
};

export default OrdersManagement;