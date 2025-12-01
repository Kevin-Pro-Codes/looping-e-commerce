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

  // Laravel API endpoints configuration
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  const API_ENDPOINTS = {
    ORDERS: `${API_BASE_URL}/orders`,
    ORDER_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  };

  // CSRF token for Laravel (if using web middleware)
  const getCSRFToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  };

  // ✅ API service functions for Laravel
  const apiService = {
    // Fetch all orders
    async getOrders() {
      try {
        const response = await fetch(API_ENDPOINTS.ORDERS, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include', // For Laravel session cookies
        });
        
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        return data.data || data; // Handle Laravel resource responses
      } catch (error) {
        console.error('API Error fetching orders:', error);
        throw error;
      }
    },

    // Fetch single order by ID
    async getOrderById(orderId) {
      try {
        const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(orderId), {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch order');
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API Error fetching order:', error);
        throw error;
      }
    },

    // Update order status
    async updateOrderStatus(orderId, status) {
      try {
        const response = await fetch(API_ENDPOINTS.ORDER_STATUS(orderId), {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCSRFToken(),
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });
        
        if (!response.ok) throw new Error('Failed to update order status');
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API Error updating order status:', error);
        throw error;
      }
    },

    // Delete order
    async deleteOrder(orderId) {
      try {
        const response = await fetch(API_ENDPOINTS.ORDER_BY_ID(orderId), {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCSRFToken(),
          },
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to delete order');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Error deleting order:', error);
        throw error;
      }
    },

    // Generate sample orders (for testing)
    async generateSampleOrders(sampleData) {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/generate-samples`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCSRFToken(),
          },
          credentials: 'include',
          body: JSON.stringify({ samples: sampleData }),
        });
        
        if (!response.ok) throw new Error('Failed to generate sample orders');
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API Error generating samples:', error);
        throw error;
      }
    },

    // Clear all orders (admin function)
    async clearAllOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/clear`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCSRFToken(),
          },
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to clear orders');
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Error clearing orders:', error);
        throw error;
      }
    }
  };

  // ✅ Fetch orders from Laravel API
  const fetchOrdersFromDatabase = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching orders from Laravel API...');
      const ordersData = await apiService.getOrders();
      
      // Normalize the orders data from Laravel API response
      const normalizedOrders = Array.isArray(ordersData) 
        ? ordersData.map(order => normalizeOrderData(order))
        : [];
      
      console.log(`📦 Loaded ${normalizedOrders.length} orders from database`);
      setOrders(normalizedOrders);
      
    } catch (error) {
      console.error("❌ Error fetching orders from Laravel API:", error);
      alert("Erro ao carregar pedidos. Verifique a conexão com o servidor.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Normalize order data from Laravel API
  const normalizeOrderData = (orderData) => {
    // Handle Laravel's different response formats
    const order = orderData.attributes || orderData;
    
    return {
      id: orderData.id || order.id,
      order_number: order.order_number || order.order_id || `LOOP-${orderData.id}`,
      orderId: order.order_number || order.order_id || `LOOP-${orderData.id}`,
      customer: order.customer_name || order.customer?.name || 'Cliente',
      customer_name: order.customer_name || order.customer?.name || 'Cliente',
      email: order.customer_email || order.customer?.email || 'cliente@email.com',
      customer_email: order.customer_email || order.customer?.email || 'cliente@email.com',
      phone: order.customer_phone || order.customer?.phone || order.phone || '',
      cpf: order.customer_cpf || order.customer?.cpf || order.cpf || '',
      total: parseFloat(order.total) || parseFloat(order.amount) || 0,
      subtotal: parseFloat(order.subtotal) || parseFloat(order.total) - (parseFloat(order.shipping) || 0) - (parseFloat(order.discount) || 0),
      shipping: parseFloat(order.shipping) || parseFloat(order.shipping_cost) || 0,
      discount: parseFloat(order.discount) || parseFloat(order.discount_amount) || 0,
      payment: order.payment_method || order.payment?.method || 'pix',
      payment_method: order.payment_method || order.payment?.method || 'pix',
      payment_status: order.payment_status || order.payment?.status || 'paid',
      status: order.status || 'pending',
      created_at: order.created_at || order.createdAt || order.date || new Date().toISOString(),
      date: formatDate(order.created_at) || order.date || new Date().toLocaleDateString('pt-BR'),
      shipping_address: order.shipping_address || order.delivery_address || order.address || {
        street: order.shipping_street || '',
        number: order.shipping_number || '',
        complement: order.shipping_complement || '',
        neighborhood: order.shipping_neighborhood || order.shipping_district || '',
        city: order.shipping_city || '',
        state: order.shipping_state || '',
        zip_code: order.shipping_zip_code || order.shipping_postal_code || ''
      },
      items: order.items || order.products || order.order_items || [],
      pix_data: order.pix_data || order.payment?.pix_data || null,
      metadata: order.metadata || {}
    };
  };

  // ✅ Format date for Laravel
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  // ✅ Update order status in Laravel
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      // Update in Laravel
      await apiService.updateOrderStatus(orderId, newStatus);
      
      // Update locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      console.log(`✅ Successfully updated order ${orderId} status to ${newStatus}`);
      
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      alert("Erro ao atualizar status do pedido. Tente novamente.");
    }
  };

  // ✅ Delete order from Laravel
  const deleteOrder = async (orderId) => {
    try {
      console.log(`🗑️ Deleting order ${orderId}`);
      
      // Delete from Laravel
      await apiService.deleteOrder(orderId);
      
      // Remove from local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      
      console.log(`✅ Successfully deleted order ${orderId}`);
      setDeleteConfirm(null);
      
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      alert("Erro ao excluir pedido. Tente novamente.");
    }
  };

  // ✅ Generate sample orders in Laravel
  const generateSampleOrders = async () => {
    if (window.confirm("Deseja gerar pedidos de exemplo no banco de dados?")) {
      try {
        const sampleOrders = generateSampleCheckoutOrders();
        await apiService.generateSampleOrders(sampleOrders);
        
        // Refresh orders list
        await fetchOrdersFromDatabase();
        
        console.log(`📦 Generated ${sampleOrders.length} sample orders in database`);
      } catch (error) {
        console.error("❌ Error generating sample orders:", error);
        alert("Erro ao gerar pedidos de exemplo.");
      }
    }
  };

  // ✅ Clear all orders from Laravel (admin function)
  const clearAllOrders = async () => {
    if (window.confirm("Tem certeza que deseja limpar TODOS os pedidos do banco de dados? Esta ação não pode ser desfeita.")) {
      try {
        await apiService.clearAllOrders();
        setOrders([]);
        console.log('✅ Cleared all orders from database');
        alert('Todos os pedidos foram removidos do banco de dados.');
      } catch (error) {
        console.error('❌ Error clearing orders:', error);
        alert('Erro ao limpar pedidos do banco de dados.');
      }
    }
  };

  // ✅ Debug function to check Laravel API
  const debugDatabase = async () => {
    try {
      const orders = await apiService.getOrders();
      console.log('🔍 Laravel API orders:', orders);
      console.log(`📊 Total orders in database: ${Array.isArray(orders) ? orders.length : 'N/A'}`);
      alert(`Banco de dados contém ${Array.isArray(orders) ? orders.length : 'N/A'} pedidos. Verifique o console para detalhes.`);
    } catch (error) {
      console.error('❌ Debug database error:', error);
      alert('Erro ao conectar com a API Laravel. Verifique o console.');
    }
  };

  // ✅ Sample orders generator (for Laravel)
  const generateSampleCheckoutOrders = () => {
    const sampleOrders = [];
    const products = [
      "Camiseta Loop Basic", 
      "Boné Loop Premium", 
      "Caneca Loop Ceramic", 
      "Moletom Loop Hoodie", 
      "Calça Loop Jogger"
    ];

    const orderCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 1; i <= orderCount; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - i);
      
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const price = [49.90, 79.90, 129.90, 89.90][Math.floor(Math.random() * 4)];
      const total = price * quantity;

      const order = {
        order_number: `LOOP-${1000 + i}`,
        customer_name: `Cliente ${i}`,
        customer_email: `cliente${i}@email.com`,
        customer_phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        customer_cpf: `${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        total: total,
        subtotal: total,
        shipping: 15.90,
        discount: 0,
        payment_method: ['pix', 'credit_card', 'boleto'][Math.floor(Math.random() * 3)],
        payment_status: 'paid',
        status: ['pending', 'processing', 'shipped'][Math.floor(Math.random() * 3)],
        created_at: orderDate.toISOString(),
        shipping_street: `Rua das Flores ${i}`,
        shipping_number: `${100 + i}`,
        shipping_complement: i % 2 === 0 ? 'Apto 101' : '',
        shipping_neighborhood: 'Jardim Paulista',
        shipping_city: 'São Paulo',
        shipping_state: 'SP',
        shipping_zip_code: `0141${Math.floor(1000 + Math.random() * 9000)}`,
        items: [
          {
            product_name: product,
            quantity: quantity,
            price: price,
            total: total
          }
        ]
      };

      sampleOrders.push(order);
    }

    return sampleOrders;
  };

  // ✅ Confirm delete dialog
  const confirmDelete = (order) => {
    setDeleteConfirm(order);
  };

  // ✅ Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // ✅ View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // ✅ Cancel order (status change)
  const cancelOrder = (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  // ✅ Status and payment helpers
  const getStatusText = (status) => {
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

  // ✅ Filter orders
  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
    getPaymentText(order.payment).toLowerCase().includes(orderSearch.toLowerCase())
  );

  // ✅ Load orders on component mount
  useEffect(() => {
    fetchOrdersFromDatabase();
  }, []);

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
          <p className="text-gray-500 text-sm">Conectando ao Laravel API</p>
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
            onClick={fetchOrdersFromDatabase}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={16} />
            Atualizar
          </button>

          <button
            onClick={debugDatabase}
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

          <button
            onClick={clearAllOrders}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiTrash2 size={16} />
            Limpar Tudo
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

      {/* Rest of the component remains the same as your original */}
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
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    R$ {order.total?.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment)}`}>
                      {getPaymentText(order.payment)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={order.status}
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500 mb-4">
              {orderSearch ? 'Tente ajustar os termos de busca' : 'Nenhum pedido no banco de dados ainda'}
            </p>
            <div className="space-x-3">
              <button
                onClick={generateSampleOrders}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Gerar Pedidos de Exemplo
              </button>
              <button
                onClick={debugDatabase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Verificar API
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Pedido</h4>
                  <p><strong>Número:</strong> {selectedOrder.orderId}</p>
                  <p><strong>Data:</strong> {selectedOrder.date}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></p>
                  <p><strong>Total:</strong> R$ {selectedOrder.total?.toFixed(2)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Cliente</h4>
                  <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.phone || 'Não informado'}</p>
                  <p><strong>CPF:</strong> {selectedOrder.cpf || 'Não informado'}</p>
                  <p><strong>Pagamento:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.payment)}`}>
                    {getPaymentText(selectedOrder.payment)}
                  </span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Itens do Pedido</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Quantidade: {item.quantity} × R$ {item.price?.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold">R$ {item.total?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Endereço de Entrega</h4>
                  <p>{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}</p>
                  {selectedOrder.shipping_address.complement && <p>Complemento: {selectedOrder.shipping_address.complement}</p>}
                  <p>Bairro: {selectedOrder.shipping_address.neighborhood}</p>
                  <p>{selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.state}</p>
                  <p>CEP: {selectedOrder.shipping_address.zip_code}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Excluir Pedido</h3>
                  <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Tem certeza que deseja excluir o pedido <strong>{deleteConfirm.orderId}</strong> de <strong>{deleteConfirm.customer_name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteOrder(deleteConfirm.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Excluir Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;