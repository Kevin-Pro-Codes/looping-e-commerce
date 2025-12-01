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
    GENERATE_SAMPLES: `${API_BASE_URL}/orders/generate-samples`,
    CLEAR_ALL: `${API_BASE_URL}/admin/orders/clear`
  };

  // ✅ API service functions
  const apiService = {
    // Fetch all orders
    async getOrders() {
      try {
        const response = await fetch(API_ENDPOINTS.ORDERS, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API Error fetching orders:', error);
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
          },
          credentials: 'include',
          body: JSON.stringify({ status }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
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
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Error deleting order:', error);
        throw error;
      }
    },

    // Generate sample orders
    async generateSampleOrders() {
      try {
        const response = await fetch(API_ENDPOINTS.GENERATE_SAMPLES, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ count: 5 }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data || data;
      } catch (error) {
        console.error('API Error generating samples:', error);
        throw error;
      }
    },

    // Clear all orders
    async clearAllOrders() {
      try {
        const response = await fetch(API_ENDPOINTS.CLEAR_ALL, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('API Error clearing orders:', error);
        throw error;
      }
    }
  };

  // ✅ Fetch orders from database
  const fetchOrdersFromDatabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching orders from database...');
      const ordersData = await apiService.getOrders();
      
      // Normalize the orders data from API response
      const normalizedOrders = Array.isArray(ordersData) 
        ? ordersData.map(order => normalizeOrderData(order))
        : [];
      
      console.log(`📦 Loaded ${normalizedOrders.length} orders from database`);
      setOrders(normalizedOrders);
      
    } catch (error) {
      console.error("❌ Error fetching orders from database:", error);
      setError("Erro ao carregar pedidos. Verifique a conexão com o servidor.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Normalize order data from API response
  const normalizeOrderData = (orderData) => {
    try {
      // Handle Laravel API response format (data.attributes or direct properties)
      const order = orderData.attributes || orderData;
      
      return {
        id: orderData.id || order.id,
        order_number: order.order_number || `LOOP-${orderData.id}`,
        orderId: order.order_number || `LOOP-${orderData.id}`,
        customer: order.customer_name || 'Cliente',
        customer_name: order.customer_name || 'Cliente',
        email: order.customer_email || 'cliente@email.com',
        customer_email: order.customer_email || 'cliente@email.com',
        phone: order.customer_phone || order.phone || '',
        cpf: order.customer_cpf || order.cpf || '',
        total: parseFloat(order.total) || 0,
        subtotal: parseFloat(order.subtotal) || parseFloat(order.total) - (parseFloat(order.shipping) || 0),
        shipping: parseFloat(order.shipping) || 0,
        discount: parseFloat(order.discount) || 0,
        payment: order.payment_method || 'pix',
        payment_method: order.payment_method || 'pix',
        payment_status: order.payment_status || 'paid',
        status: order.status || 'pending',
        created_at: order.created_at || order.createdAt || new Date().toISOString(),
        date: formatDate(order.created_at) || new Date().toLocaleDateString('pt-BR'),
        shipping_address: {
          street: order.shipping_street || order.shipping_address?.street || '',
          number: order.shipping_number || order.shipping_address?.number || '',
          complement: order.shipping_complement || order.shipping_address?.complement || '',
          neighborhood: order.shipping_neighborhood || order.shipping_address?.neighborhood || '',
          city: order.shipping_city || order.shipping_address?.city || '',
          state: order.shipping_state || order.shipping_address?.state || '',
          zip_code: order.shipping_zip_code || order.shipping_address?.zip_code || ''
        },
        items: Array.isArray(order.items) ? order.items : [],
        pix_data: order.pix_data || null,
        metadata: order.metadata || {}
      };
    } catch (error) {
      console.log('❌ Error normalizing order data:', error, orderData);
      return null;
    }
  };

  // ✅ Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  // ✅ Update order status in database
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      // Update in database
      await apiService.updateOrderStatus(orderId, newStatus);
      
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

  // ✅ Delete order from database
  const deleteOrder = async (orderId) => {
    try {
      console.log(`🗑️ Deleting order ${orderId}`);
      
      // Delete from database
      await apiService.deleteOrder(orderId);
      
      // Remove from local state
      setOrders(prevOrders => prevOrders.filter(order => order && order.id !== orderId));
      
      console.log(`✅ Successfully deleted order ${orderId}`);
      setDeleteConfirm(null);
      
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      setError("Erro ao excluir pedido. Tente novamente.");
    }
  };

  // ✅ Generate sample orders in database
  const generateSampleOrders = async () => {
    try {
      if (window.confirm("Deseja gerar pedidos de exemplo no banco de dados?")) {
        await apiService.generateSampleOrders();
        
        // Refresh orders list
        await fetchOrdersFromDatabase();
        
        console.log(`📦 Generated sample orders in database`);
      }
    } catch (error) {
      console.error("❌ Error generating sample orders:", error);
      setError('Erro ao gerar pedidos de exemplo.');
    }
  };

  // ✅ Clear all orders from database
  const clearAllOrders = async () => {
    try {
      if (window.confirm("Tem certeza que deseja limpar TODOS os pedidos do banco de dados? Esta ação não pode ser desfeita.")) {
        await apiService.clearAllOrders();
        setOrders([]);
        console.log('✅ Cleared all orders from database');
        alert('Todos os pedidos foram removidos do banco de dados.');
      }
    } catch (error) {
      console.error('❌ Error clearing orders:', error);
      setError('Erro ao limpar pedidos do banco de dados.');
    }
  };

  // ✅ Debug function to check API connection
  const debugAPI = async () => {
    try {
      const orders = await apiService.getOrders();
      console.log('🔍 API orders response:', orders);
      console.log(`📊 Total orders in database: ${Array.isArray(orders) ? orders.length : 'N/A'}`);
      alert(`API conectada com sucesso! ${Array.isArray(orders) ? orders.length : 'N/A'} pedidos encontrados. Verifique o console para detalhes.`);
    } catch (error) {
      console.error('❌ Debug API error:', error);
      setError('Erro ao conectar com a API. Verifique o console.');
    }
  };

  // ✅ Confirm delete dialog
  const confirmDelete = (order) => {
    if (order && order.id) {
      setDeleteConfirm(order);
    }
  };

  // ✅ Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // ✅ View order details
  const viewOrderDetails = (order) => {
    if (order) {
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  // ✅ Cancel order (status change)
  const cancelOrder = (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      updateOrderStatus(orderId, "cancelled");
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

  // ✅ Filter orders with safe access
  const filteredOrders = orders.filter(order => 
    order && (
      (order.orderId && order.orderId.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(orderSearch.toLowerCase())) ||
      getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
      getPaymentText(order.payment).toLowerCase().includes(orderSearch.toLowerCase())
    )
  );

  // ✅ Load orders on component mount
  useEffect(() => {
    fetchOrdersFromDatabase();
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
        <button
          onClick={fetchOrdersFromDatabase}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Tentar Novamente
        </button>
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
            onClick={fetchOrdersFromDatabase}
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
                onClick={debugAPI}
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
                  <p><strong>Número:</strong> {selectedOrder.orderId || 'N/A'}</p>
                  <p><strong>Data:</strong> {selectedOrder.date || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Cliente</h4>
                  <p><strong>Nome:</strong> {selectedOrder.customer_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</p>
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
                      <p className="font-medium">{item?.product_name || 'Produto'}</p>
                      <p className="text-sm text-gray-600">Quantidade: {item?.quantity || 0} × {formatCurrency(item?.price)}</p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item?.total)}</p>
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