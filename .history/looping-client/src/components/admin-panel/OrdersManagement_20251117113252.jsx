import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEye,
  FiRefreshCw,
  FiPackage,
  FiXCircle,
  FiTrash2,
  FiServer,
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

  const API_BASE_URL = 'http://localhost:8000/api';

  const apiService = {
    // REMOVIDO: testConnection() — não existe no Laravel e causava 5s de delay

    async getOrders() {
      try {
        console.log('Buscando pedidos em:', `${API_BASE_URL}/infos`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API_BASE_URL}/infos`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          throw new Error('Erro no servidor. Verifique os logs do Laravel.');
        }

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {}
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Erro na API');
        return data.data || [];
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Timeout: servidor demorou');
        if (error.message.includes('Failed to fetch')) throw new Error('Servidor offline ou CORS bloqueado');
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

  // Teste opcional da API (não bloqueia carregamento)
  const testApiConnection = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`${API_BASE_URL}/test`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = response.ok
        ? { connected: true, data: await response.json() }
        : { connected: false, error: `HTTP ${response.status}` };

      setApiStatus(result);
      alert(result.connected ? 'API conectada!' : `Falha: ${result.error}`);
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'Timeout no teste' : err.message;
      setApiStatus({ connected: false, error: msg });
      alert('Erro ao testar conexão');
    } finally {
      setLoading(false);
    }
  };

  // CARREGA PEDIDOS DIRETO DO BANCO (sem /test)
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      setError("Erro ao carregar pedidos: " + err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleOrders = async () => {
    if (!window.confirm("Deseja gerar pedidos de exemplo para teste?")) return;
    try {
      await apiService.generateSampleOrders();
      fetchOrders();
    } catch (err) {
      setError("Erro ao gerar exemplo: " + err.message);
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const deleteOrder = (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setDeleteConfirm(null);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  const confirmDelete = (order) => setDeleteConfirm(order);
  const cancelDelete = () => setDeleteConfirm(null);

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
    const map = { pix: "PIX", credit_card: "Cartão de Crédito", boleto: "Boleto" };
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
      pix: "bg-blue-100 text-blue-800",
      boleto: "bg-purple-100 text-purple-800",
    };
    return colors[payment] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (value) => {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return `R$ ${parseFloat(value).toFixed(2)}`;
  };

  const filteredOrders = orders.filter(order =>
    order && (
      (order.order_number?.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase())) ||
      getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
      getPaymentText(order.payment_method).toLowerCase().includes(orderSearch.toLowerCase())
    )
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  // ERRO
  if (error) {
    return (
      <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro de Conexão: </strong>
          <span className="block sm:inline">{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="font-bold">Solução de Problemas:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>1. Laravel rodando?</strong> <code>php artisan serve --port=8000</code></li>
            <li><strong>2. CORS instalado?</strong> <code>composer require fruitcake/laravel-cors</code></li>
            <li><strong>3. config/cors.php permite localhost:3000?</strong></li>
            <li><strong>4. Limpe cache:</strong> <code>php artisan config:clear</code></li>
            <li><strong>5. Verifique logs:</strong> <code>tail -f storage/logs/laravel.log</code></li>
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={fetchOrders} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Tentar Novamente
          </button>
          <button onClick={testApiConnection} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
            Testar Conexão
          </button>
          <button onClick={() => { setError(null); setLoading(false); setOrders([]); }} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
            Continuar Offline
          </button>
        </div>

        {apiStatus && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>Status da API:</strong>
            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(apiStatus, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  // LOADING COM SKELETON (nunca mostra fallback)


  // VAZIO (só se NÃO estiver carregando)
  if (orders.length === 0) {
    return (
      <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
            <p className="text-gray-600 text-sm mt-1">0 pedidos encontrados</p>
          </div>
          <button onClick={generateSampleOrders} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
            <FiPackage size={16} /> Gerar Exemplo
          </button>
        </div>

        <div className="text-center py-16">
          <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido no sistema</h3>
          <p className="text-gray-500 mb-4">Comece gerando um pedido de exemplo ou finalize uma compra.</p>
          <button onClick={generateSampleOrders} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
            Gerar Pedido de Exemplo
          </button>
        </div>
      </div>
    );
  }

  // TABELA COM DADOS
  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchOrders} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <FiRefreshCw size={16} /> Atualizar
          </button>
          <button onClick={testApiConnection} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <FiServer size={16} /> Testar API
          </button>
          <button onClick={generateSampleOrders} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <FiPackage size={16} /> Gerar Exemplo
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

      {/* Tabela */}
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
                    <button onClick={() => viewOrderDetails(order)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors" title="Ver Detalhes">
                      <FiEye size={16} />
                    </button>
                    <button onClick={() => cancelOrder(order.id)} className="text-yellow-600 hover:text-yellow-900 p-1 rounded transition-colors" title="Cancelar Pedido">
                      <FiXCircle size={16} />
                    </button>
                    <button onClick={() => confirmDelete(order)} className="text-red-600 hover:text-red-900 p-1 rounded transition-colors" title="Excluir Pedido">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
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
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span></p>
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
                  <p><strong>Pagamento:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.payment_method)}`}>{getPaymentText(selectedOrder.payment_method)}</span></p>
                  <p><strong>Status Pagamento:</strong> {selectedOrder.payment_status || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Itens do Pedido</h4>
                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium">{item.product_name || 'Produto'}</p>
                        <p className="text-sm text-gray-600">Quantidade: {item.quantity || 0} × {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.total)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhum item</p>
                )}
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

      {/* Modal de Confirmação de Exclusão */}
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
                <button onClick={cancelDelete} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">
                  Cancelar
                </button>
                <button onClick={() => deleteOrder(deleteConfirm.id)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
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