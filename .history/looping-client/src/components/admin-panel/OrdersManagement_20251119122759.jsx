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
        
        // ✅ ORDENAR PEDIDOS POR DATA (MAIS RECENTE PRIMEIRO)
        const sortedOrders = (data.data || []).sort((a, b) => {
          const dateA = new Date(a.created_at || a.order_date || 0);
          const dateB = new Date(b.created_at || b.order_date || 0);
          return dateB - dateA; // Mais recente primeiro
        });
        
        return sortedOrders;
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

  // ✅ FUNÇÃO MELHORADA: Buscar cor e tamanho de forma mais abrangente
  const getItemAttributes = (item) => {
    // DEBUG: Ver estrutura completa do item
    if (item && (!item.size || !item.color)) {
      console.log('🔍 Estrutura do item:', item);
    }
    
    // Busca em TODOS os campos possíveis para tamanho
    const size = 
      item.size ||
      item.selectedSize || 
      item.tamanho || 
      item.variant_size ||
      item.product_variant?.size ||
      item.variant?.size ||
      item.product?.size ||
      (item.options && (item.options.size || item.options.tamanho)) ||
      item.attributes?.size ||
      'Não especificado';
    
    // Busca em TODOS os campos possíveis para cor
    const color = 
      item.color ||
      item.selectedColor || 
      item.cor || 
      item.variant_color ||
      item.product_variant?.color ||
      item.variant?.color ||
      item.product?.color ||
      (item.options && (item.options.color || item.options.cor)) ||
      item.attributes?.color ||
      'Não especificada';
    
    console.log(`📦 Item: ${item.product_name} | Tamanho: ${size} | Cor: ${color}`);
    return { size, color };
  };

  // ✅ FUNÇÃO: Converter código de cor para nome (MELHORADA)
  const getColorName = (color) => {
    if (!color || color === 'Não especificada' || color === 'undefined') {
      return 'Não especificada';
    }
    
    const colorMap = {
      // Códigos HEX
      "#000000": "Preto",
      "#000": "Preto",
      "#FFFFFF": "Branco", 
      "#fff": "Branco",
      "#1E90FF": "Azul",
      "#FF69B4": "Rosa",
      "#FF0000": "Vermelho",
      "#00FF00": "Verde",
      "#0000FF": "Azul Escuro",
      "#FFFF00": "Amarelo",
      "#FFA500": "Laranja",
      "#800080": "Roxo",
      "#808080": "Cinza",
      "#964B00": "Marrom",
      
      // Nomes em português
      "preto": "Preto",
      "branco": "Branco", 
      "azul": "Azul",
      "rosa": "Rosa",
      "vermelho": "Vermelho",
      "verde": "Verde",
      "amarelo": "Amarelo",
      "laranja": "Laranja",
      "roxo": "Roxo",
      "cinza": "Cinza",
      "marrom": "Marrom",
      
      // Nomes em inglês
      "black": "Preto",
      "white": "Branco",
      "blue": "Azul",
      "pink": "Rosa", 
      "red": "Vermelho",
      "green": "Verde",
      "yellow": "Amarelo",
      "orange": "Laranja",
      "purple": "Roxo",
      "gray": "Cinza",
      "grey": "Cinza",
      "brown": "Marrom"
    };
    
    // Normaliza a cor
    const normalizedColor = color.toString().toLowerCase().trim().replace(/\s+/g, '');
    
    // Procura correspondência exata
    if (colorMap[normalizedColor]) {
      return colorMap[normalizedColor];
    }
    
    // Procura por correspondência parcial
    for (const [key, value] of Object.entries(colorMap)) {
      if (normalizedColor.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedColor)) {
        return value;
      }
    }
    
    // Se for um código HEX válido, retorna o código
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return color.toUpperCase();
    }
    
    // Retorna a cor original capitalizada
    return color.charAt(0).toUpperCase() + color.slice(1);
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
    console.log('📋 Pedido selecionado para detalhes:', order);
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

  // ✅ FILTRAR E ORDENAR PEDIDOS
  const filteredOrders = orders
    .filter(order =>
      order && (
        (order.order_number?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
        getPaymentText(order.payment_method).toLowerCase().includes(orderSearch.toLowerCase())
      )
    )
    // ✅ GARANTIR ORDENAÇÃO MESMO APÓS FILTRAGEM
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.order_date || 0);
      const dateB = new Date(b.created_at || b.order_date || 0);
      return dateB - dateA; // Mais recente primeiro
    });

  useEffect(() => {
    fetchOrders();
  }, []);

  // [Restante do código de erro, loading e vazio permanece igual...]

  // TABELA COM DADOS
  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
            {filteredOrders.length > 0 && (
              <span className="text-blue-600 ml-2">
                • Ordenado por data (mais recente primeiro)
              </span>
            )}
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
                    {order.created_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    )}
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

      {/* Modal de Detalhes - ATUALIZADO */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalhes do Pedido - {selectedOrder.order_number}</h3>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiXCircle size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Informações do Pedido</h4>
                  <div className="space-y-2">
                    <p><strong>Número:</strong> {selectedOrder.order_number || 'N/A'}</p>
                    <p><strong>Data:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('pt-BR') : 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span></p>
                    <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                    <p><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal)}</p>
                    <p><strong>Frete:</strong> {formatCurrency(selectedOrder.shipping)}</p>
                    <p><strong>Desconto:</strong> {formatCurrency(selectedOrder.discount)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Informações do Cliente</h4>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {selectedOrder.customer_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</p>
                    <p><strong>Telefone:</strong> {selectedOrder.customer_phone || 'Não informado'}</p>
                    <p><strong>CPF:</strong> {selectedOrder.customer_cpf || 'Não informado'}</p>
                    <p><strong>Pagamento:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.payment_method)}`}>{getPaymentText(selectedOrder.payment_method)}</span></p>
                    <p><strong>Status Pagamento:</strong> {selectedOrder.payment_status || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* ✅ ITENS DO PEDIDO COM COR/TAMANHO */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Itens do Pedido ({selectedOrder.items?.length || 0})</h4>
                {selectedOrder.items?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => {
                      const { size, color } = getItemAttributes(item);
                      const colorName = getColorName(color);
                      
                      return (
                        <div key={index} className="flex flex-col sm:flex-row justify-between p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.product_name}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.product_name || 'Produto'}</p>
                                <p className="text-sm text-gray-600">Quantidade: {item.quantity || 0} × {formatCurrency(item.price)}</p>
                                
                                {/* ✅ COR E TAMANHO */}
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                  {/* Tamanho */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Tamanho:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                      size === 'Não especificado' 
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                      {size}
                                    </span>
                                  </div>
                                  
                                  {/* Cor */}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Cor:</span>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                        style={{ 
                                          backgroundColor: color.startsWith('#') ? color : 
                                            colorName === 'Preto' ? '#000000' :
                                            colorName === 'Branco' ? '#FFFFFF' :
                                            colorName === 'Azul' ? '#1E90FF' :
                                            colorName === 'Vermelho' ? '#FF0000' :
                                            colorName === 'Verde' ? '#00FF00' :
                                            colorName === 'Amarelo' ? '#FFFF00' :
                                            colorName === 'Rosa' ? '#FF69B4' :
                                            colorName === 'Cinza' ? '#808080' :
                                            colorName === 'Laranja' ? '#FFA500' :
                                            colorName === 'Roxo' ? '#800080' :
                                            colorName === 'Marrom' ? '#964B00' : '#ccc',
                                          borderColor: (colorName === 'Branco' || color === '#FFFFFF') ? '#ccc' : 'transparent'
                                        }}
                                        title={colorName}
                                      ></div>
                                      <span className={`text-xs font-medium ${
                                        colorName === 'Não especificada' ? 'text-yellow-600' : 'text-gray-700'
                                      }`}>
                                        {colorName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                            <p className="text-sm text-gray-500">Unit: {formatCurrency(item.price)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum item encontrado</p>
                )}
              </div>

              {selectedOrder.shipping_street && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Endereço de Entrega</h4>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-900">{selectedOrder.shipping_street}, {selectedOrder.shipping_number}</p>
                    {selectedOrder.shipping_complement && (
                      <p className="text-gray-600">Complemento: {selectedOrder.shipping_complement}</p>
                    )}
                    <p className="text-gray-600">Bairro: {selectedOrder.shipping_neighborhood}</p>
                    <p className="text-gray-600">{selectedOrder.shipping_city} - {selectedOrder.shipping_state}</p>
                    <p className="text-gray-600">CEP: {selectedOrder.shipping_zip_code}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* [Restante dos modais permanece igual...] */}
    </div>
  );
};

export default OrdersManagement;