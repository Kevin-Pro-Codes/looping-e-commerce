import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiPackage,
  FiXCircle,
  FiTrash2,
  FiServer,
  FiChevronUp,
  FiChevronDown,
  FiImage,
} from "react-icons/fi";

const OrdersManagement = () => {
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [debugInfo, setDebugInfo] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });

  const API_BASE_URL = 'http://localhost:8000/api';

  // API Service
  const apiService = {
    async getOrders() {
      try {
        console.log('🔍 Fetching orders from:', `${API_BASE_URL}/infos`);
        
        const response = await fetch(`${API_BASE_URL}/infos`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 Response status:', response.status);
        
        const rawData = await response.text();
        console.log('📦 Raw response:', rawData);

        let data;
        try {
          data = JSON.parse(rawData);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          throw new Error('Invalid JSON response from server');
        }

        console.log('📊 Parsed data:', data);

        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (!data.success) {
          throw new Error(data.message || 'API returned success: false');
        }

        // Handle both data.data and direct data array
        const ordersData = data.data || data;
        console.log('✅ Orders data:', ordersData);
        
        return Array.isArray(ordersData) ? ordersData : [];
      } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
      }
    },

    async updateOrderStatus(orderId, statusData) {
      try {
        console.log(`Updating order ${orderId}:`, statusData);
        
        const response = await fetch(`${API_BASE_URL}/infos/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(statusData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to update order status');
        }

        return result.data;
      } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
      }
    },

    async generateSampleOrders() {
      const response = await fetch(`${API_BASE_URL}/infos/generate-samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      return data.data;
    },
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      console.log('🔄 Starting to fetch orders...');
      const ordersData = await apiService.getOrders();
      console.log('📋 Orders received:', ordersData);
      
      setOrders(ordersData);
      setDebugInfo({
        totalOrders: ordersData.length,
        timestamp: new Date().toISOString(),
        sampleOrder: ordersData[0] || 'No orders'
      });
      
    } catch (err) {
      console.error('💥 Error fetching orders:', err);
      setError("Erro ao carregar pedidos: " + err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId));

      // Optimistically update UI
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      // Determine payment status based on order status
      let paymentStatus = 'paid';
      if (newStatus === 'cancelled') {
        paymentStatus = 'refunded';
      } else if (newStatus === 'pending') {
        paymentStatus = 'pending';
      }

      const statusData = {
        status: newStatus,
        payment_status: paymentStatus
      };

      await apiService.updateOrderStatus(orderId, statusData);
      
      setError(null);
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      
    } catch (err) {
      // Revert optimistic update on error
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: o.status } : o
      ));
      
      setError(`Failed to update order status: ${err.message}`);
      alert(`Erro ao atualizar status: ${err.message}`);
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/infos/test`, {
        method: 'GET',
      });
      
      const result = await response.json();
      setApiStatus(result);
      alert(result.success ? 'API conectada!' : `Falha: ${result.message}`);
    } catch (err) {
      setApiStatus({ success: false, error: err.message });
      alert('Erro ao testar conexão: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleOrders = async () => {
    if (!window.confirm("Deseja gerar pedidos de exemplo para teste?")) return;
    setLoading(true);
    try {
      await apiService.generateSampleOrders();
      await fetchOrders();
    } catch (err) {
      setError("Erro ao gerar exemplo: " + err.message);
      setLoading(false);
    }
  };

  // Simple skeleton loader
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
        </div>
      </td>
    </tr>
  );

  // Helper functions
  const getStatusText = (status) => {
    const map = {
      pending: "Pendente",
      processing: "Em Preparação",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return map[status] || status;
  };

  const getPaymentText = (payment) => {
    const map = { 
      pix: "PIX", 
      credit_card: "Cartão de Crédito", 
      boleto: "Boleto",
      debit_card: "Cartão de Débito",
      cash: "Dinheiro"
    };
    return map[payment] || payment;
  };

  const getStatusColor = (status) => {
    const colors = {
      shipped: "bg-green-100 text-green-800 border border-green-200",
      processing: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      pending: "bg-blue-100 text-blue-800 border border-blue-200",
      delivered: "bg-purple-100 text-purple-800 border border-purple-200",
      cancelled: "bg-red-100 text-red-800 border border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border border-gray-200";
  };

  const getPaymentColor = (payment) => {
    const colors = {
      credit_card: "bg-green-100 text-green-800",
      debit_card: "bg-blue-100 text-blue-800",
      pix: "bg-blue-100 text-blue-800",
      boleto: "bg-purple-100 text-purple-800",
      cash: "bg-gray-100 text-gray-800",
    };
    return colors[payment] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  // Debug component
  const DebugPanel = () => {
    if (!debugInfo) return null;
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Debug Information</h4>
        <div className="text-sm text-yellow-700">
          <p>Total Orders: {debugInfo.totalOrders}</p>
          <p>Timestamp: {debugInfo.timestamp}</p>
          <p>Sample Order: {JSON.stringify(debugInfo.sampleOrder)}</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <div className="text-gray-600 text-sm mt-1">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></span>
                Carregando pedidos...
              </span>
            ) : (
              <>
                {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} encontrados
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchOrders} 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} /> 
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
          <button 
            onClick={testApiConnection} 
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiServer size={16} /> Testar API
          </button>
          <button 
            onClick={generateSampleOrders} 
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiPackage size={16} /> Gerar Exemplo
          </button>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar pedidos..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              disabled={loading}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <FiXCircle size={20} />
            <span className="font-semibold">Erro:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                // Show skeleton loading rows
                [...Array(5)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number || 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer_email || 'N/A'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPaymentColor(order.payment_method)}`}>
                        {getPaymentText(order.payment_method)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        disabled={updatingOrders.has(order.id)}
                        className={`text-xs font-medium px-3 py-1 border-0 focus:ring-2 rounded focus:ring-blue-500 ${
                          updatingOrders.has(order.id) ? 'opacity-50 cursor-not-allowed' : ''
                        } ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="processing">Em Preparação</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregue</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                      {updatingOrders.has(order.id) && (
                        <div className="text-xs text-gray-500 mt-1">Atualizando...</div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => setSelectedOrder(order)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors" title="Ver Detalhes">
                        <FiEye size={16} />
                      </button>
                      <button onClick={() => updateOrderStatus(order.id, "cancelled")} className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors" title="Cancelar Pedido">
                        <FiXCircle size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm(order)} className="text-red-600 hover:text-red-900 p-1 rounded transition-colors" title="Excluir Pedido">
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 sm:px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FiPackage className="mx-auto mb-2" size={32} />
                      <p>Nenhum pedido encontrado</p>
                      <button 
                        onClick={fetchOrders}
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalhes do Pedido - {selectedOrder.order_number}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <FiXCircle size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informações do Pedido</h4>
                  <p><strong>ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Número:</strong> {selectedOrder.order_number}</p>
                  <p><strong>Data:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('pt-BR') : 'N/A'}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Informações do Cliente</h4>
                  <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.customer_phone || 'Não informado'}</p>
                </div>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Tem certeza que deseja excluir o pedido <strong>{deleteConfirm.order_number}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                  Cancelar
                </button>
                <button onClick={() => {
                  setOrders(prev => prev.filter(o => o.id !== deleteConfirm.id));
                  setDeleteConfirm(null);
                }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                  Excluir
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