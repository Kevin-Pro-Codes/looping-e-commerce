import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiRefreshCw, FiPackage, FiXCircle, FiTrash2, FiAlertTriangle, FiServer } from "react-icons/fi";

const OrdersManagement = () => {
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  const apiService = {
    // Test basic API connection
    async testConnection() {
      try {
        console.log('🔌 Testing API connection to:', `${API_BASE_URL}/health`);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
          connected: true,
          data: data,
          status: response.status
        };
      } catch (error) {
        console.error('API Connection Test Failed:', error);
        if (error.name === 'AbortError') {
          return {
            connected: false,
            error: 'Request timeout - Server not responding'
          };
        }
        return {
          connected: false,
          error: error.message
        };
      }
    },

    // Debug endpoint to check orders specifically
    async debugOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/debug-orders`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Debug endpoint error:', error);
        throw error;
      }
    },

    // Fetch all orders with detailed error handling
    async getOrders() {
      try {
        console.log('📦 Fetching orders from:', `${API_BASE_URL}/orders`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          console.error('HTML response received:', text.substring(0, 500));
          throw new Error('Server returned HTML error page. Check Laravel logs.');
        }
        
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('Laravel error details:', errorData);
          } catch (jsonError) {
            // If we can't parse JSON, use the status text
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        console.log('✅ API Response:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'API returned error');
        }
        
        console.log('✅ Orders fetched successfully:', data.data?.length || 0, 'orders');
        return data.data || [];
      } catch (error) {
        console.error('❌ API Error - getOrders:', error);
        
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Server took too long to respond');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Cannot connect to server. Check if Laravel is running and CORS is configured.');
        }
        
        throw error;
      }
    },

    // Generate sample orders
    async generateSampleOrders() {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/generate-samples`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({})
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('API Error - generateSampleOrders:', error);
        throw error;
      }
    }
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      setLoading(true);
      const result = await apiService.testConnection();
      setApiStatus(result);
      
      if (result.connected) {
        console.log('✅ API Connection successful:', result.data);
        return true;
      } else {
        console.error('❌ API Connection failed:', result);
        setError(`API Connection failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ API Test error:', error);
      setError(`Connection test failed: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders from database
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Starting orders fetch...');
      
      console.log('🔄 Testing API connection...');
      const isConnected = await testApiConnection();
      
      if (!isConnected) {
        console.log('❌ API not connected, skipping orders fetch');
        return;
      }

      console.log('🔄 Fetching orders from API...');
      const ordersData = await apiService.getOrders();
      console.log(`📦 Loaded ${ordersData.length} orders from API`);
      setOrders(ordersData);
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setError("Erro ao carregar pedidos: " + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Test debug endpoint
  const testDebugEndpoint = async () => {
    try {
      setLoading(true);
      const debugData = await apiService.debugOrders();
      setDebugInfo(debugData);
      console.log('🐛 Debug endpoint response:', debugData);
      
      let alertMessage = `Debug Results:\n`;
      alertMessage += `Status: ${debugData.status || 'N/A'}\n`;
      alertMessage += `Database: ${debugData.database_connection || 'N/A'}\n`;
      alertMessage += `Table exists: ${debugData.orders_table_exists ? 'YES' : 'NO'}\n`;
      
      alert(alertMessage);
      return debugData;
    } catch (error) {
      console.error('Debug test failed:', error);
      setError('Debug endpoint failed: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order && order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      setError('Erro ao atualizar status do pedido: ' + error.message);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    try {
      setOrders(prevOrders => prevOrders.filter(order => order && order.id !== orderId));
      console.log(`✅ Order ${orderId} deleted successfully`);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      setError("Erro ao excluir pedido: " + error.message);
    }
  };

  // Generate sample orders
  const generateSampleOrders = async () => {
    try {
      if (window.confirm("Deseja gerar pedidos de exemplo para teste?")) {
        await apiService.generateSampleOrders();
        fetchOrders();
      }
    } catch (error) {
      console.error('❌ Generate sample orders error:', error);
      setError('Erro ao gerar pedidos de exemplo: ' + error.message);
    }
  };

  // View order details
  const viewOrderDetails = (order) => {
    if (order) {
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  // Cancel order (status change)
  const cancelOrder = (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  // Confirm delete dialog
  const confirmDelete = (order) => {
    if (order && order.id) {
      setDeleteConfirm(order);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Status and payment helpers
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
      case "credit_card": return "bg-green-100 text-green-800";
      case "pix": return "bg-blue-100 text-blue-800";
      case "boleto": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Safe number formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'R$ 0,00';
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => 
    order && (
      (order.order_number && order.order_number.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_email && order.customer_email.toLowerCase().includes(orderSearch.toLowerCase())) ||
      getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
      getPaymentText(order.payment_method).toLowerCase().includes(orderSearch.toLowerCase())
    )
  );

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Enhanced error display with debugging options
  if (error) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro de Conexão: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="font-bold">Solução de Problemas - ERRO 500/Failed to Fetch:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>1. Verifique se o Laravel está rodando:</strong> <code>php artisan serve --port=8000</code></li>
            <li><strong>2. Instale CORS:</strong> <code>composer require fruitcake/laravel-cors</code></li>
            <li><strong>3. Verifique CORS config:</strong> Confirme que <code>config/cors.php</code> permite localhost:3000</li>
            <li><strong>4. Limpe cache:</strong> <code>php artisan config:clear && php artisan cache:clear</code></li>
            <li><strong>5. Verifique logs:</strong> <code>tail -f storage/logs/laravel.log</code></li>
            <li><strong>6. Teste no navegador:</strong> Visite <code>http://localhost:8000/api/health</code></li>
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={fetchOrders}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
          <button
            onClick={testApiConnection}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Testar Conexão
          </button>
          <button
            onClick={() => {
              setError(null);
              setOrders([]);
              setLoading(false);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Continuar Offline
          </button>
        </div>

        {apiStatus && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong className="font-bold">Status da API:</strong>
            <pre className="mt-2 text-sm whitespace-pre-wrap">
              {JSON.stringify(apiStatus, null, 2)}
            </pre>
          </div>
        )}
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
          <p className="text-gray-600">Conectando com a API...</p>
          <p className="text-gray-500 text-sm">Aguarde enquanto testamos a conexão</p>
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
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={16} />
            Atualizar
          </button>

          <button
            onClick={testApiConnection}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiServer size={16} />
            Testar API
          </button>

          <button
            onClick={generateSampleOrders}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiPackage size={16} />
            Gerar Exemplo
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
                <tr key={order.id || order.order_number} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.order_number || 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer_name || 'Cliente'}</div>
                    <div className="text-sm text-gray-500">{order.customer_email || 'N/A'}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment_method)}`}>
                      {getPaymentText(order.payment_method)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={order.status || 'pending'}
                      onChange={(e) => updateOrderStatus(order.id || order.order_number, e.target.value)}
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
                      onClick={() => cancelOrder(order.id || order.order_number)}
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
                Gerar Pedido de Exemplo
              </button>
              <button
                onClick={testApiConnection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Testar Conexão
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
                  <p><strong>Número:</strong> {selectedOrder.order_number || 'N/A'}</p>
                  <p><strong>Data:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                  <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                  <p><strong>Frete:</strong> {formatCurrency(selectedOrder.shipping)}</p>
                  <p><strong>Desconto:</strong> {formatCurrency(selectedOrder.discount)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Cliente</h4>
                  <p><strong>Nome:</strong> {selectedOrder.customer_name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.customer_phone || 'Não informado'}</p>
                  <p><strong>CPF:</strong> {selectedOrder.customer_cpf || 'Não informado'}</p>
                  <p><strong>Pagamento:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.payment_method)}`}>
                    {getPaymentText(selectedOrder.payment_method)}
                  </span></p>
                  <p><strong>Status Pagamento:</strong> {selectedOrder.payment_status || 'N/A'}</p>
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
              
              {selectedOrder.shipping_street && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Endereço de Entrega</h4>
                  <p>{selectedOrder.shipping_street}, {selectedOrder.shipping_number}</p>
                  {selectedOrder.shipping_complement && <p>Complemento: {selectedOrder.shipping_complement}</p>}
                  <p>Bairro: {selectedOrder.shipping_neighborhood}</p>
                  <p>{selectedOrder.shipping_city} - {selectedOrder.shipping_state}</p>
                  <p>CEP: {selectedOrder.shipping_zip_code}</p>
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
                Tem certeza que deseja excluir o pedido <strong>{deleteConfirm.order_number}</strong> de <strong>{deleteConfirm.customer_name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteOrder(deleteConfirm.id || deleteConfirm.order_number)}
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