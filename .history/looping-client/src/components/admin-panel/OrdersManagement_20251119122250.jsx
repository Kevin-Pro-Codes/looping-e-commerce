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

  // ✅ FUNÇÃO MELHORADA: Extrair cor e tamanho dos itens do pedido
  const getItemAttributes = (item) => {
    console.log('🔍 Analisando item do pedido:', item); // DEBUG
    
    // Tenta extrair tamanho de diferentes campos possíveis
    const size = item.size || 
                 item.selectedSize || 
                 item.tamanho || 
                 item.variant_size ||
                 item.product_variant?.size ||
                 item.variant?.size ||
                 item.product?.size ||
                 (item.options && item.options.size) ||
                 'Não especificado';
    
    // Tenta extrair cor de diferentes campos possíveis
    const color = item.color || 
                  item.selectedColor || 
                  item.cor || 
                  item.variant_color ||
                  item.product_variant?.color ||
                  item.variant?.color ||
                  item.product?.color ||
                  (item.options && item.options.color) ||
                  'Não especificada';
    
    console.log('📦 Resultado - Tamanho:', size, 'Cor:', color); // DEBUG
    return { size, color };
  };

  // ✅ FUNÇÃO: Converter código de cor para nome
  const getColorName = (color) => {
    if (!color || color === 'Não especificada') return 'Não especificada';
    
    const colorMap = {
      "#000000": "Preto",
      "#000": "Preto",
      "black": "Preto",
      "#FFFFFF": "Branco",
      "#fff": "Branco",
      "white": "Branco",
      "#1E90FF": "Azul",
      "blue": "Azul",
      "#FF69B4": "Rosa",
      "pink": "Rosa",
      "#FF0000": "Vermelho",
      "red": "Vermelho",
      "#00FF00": "Verde",
      "green": "Verde",
      "#0000FF": "Azul Escuro",
      "#FFFF00": "Amarelo",
      "yellow": "Amarelo",
      "#FFA500": "Laranja",
      "orange": "Laranja",
      "#800080": "Roxo",
      "purple": "Roxo",
      "#808080": "Cinza",
      "gray": "Cinza",
      "grey": "Cinza",
      "#964B00": "Marrom",
      "brown": "Marrom"
    };
    
    // Remove espaços e converte para minúsculo
    const normalizedColor = color.toString().toLowerCase().trim();
    
    // Procura no mapa
    for (const [key, value] of Object.entries(colorMap)) {
      if (key.toLowerCase() === normalizedColor) {
        return value;
      }
    }
    
    // Se não encontrou, retorna o próprio valor (pode ser já um nome)
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
    console.log('📋 Pedido selecionado:', order); // DEBUG
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

  // [Restante do código permanece igual... mantendo apenas as partes relevantes]

  // Modal de Detalhes - ATUALIZADO COM COR/TAMANHO
  {showOrderModal && selectedOrder && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
            <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
              <FiXCircle size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações do Pedido e Cliente... */}

          {/* ✅ ATUALIZADO: Itens do Pedido com Cor/Tamanho */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Itens do Pedido</h4>
            {selectedOrder.items?.length > 0 ? (
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => {
                  const { size, color } = getItemAttributes(item);
                  const colorName = getColorName(color);
                  
                  return (
                    <div key={index} className="flex flex-col sm:flex-row justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
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
                            
                            {/* ✅ EXIBIR COR E TAMANHO */}
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                              {/* Tamanho */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Tamanho:</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                  size === 'Não especificado' 
                                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                                    : 'bg-white border-gray-300'
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
                                        color === 'Preto' ? '#000000' :
                                        color === 'Branco' ? '#FFFFFF' :
                                        color === 'Azul' ? '#1E90FF' :
                                        color === 'Vermelho' ? '#FF0000' :
                                        color === 'Verde' ? '#00FF00' :
                                        color === 'Amarelo' ? '#FFFF00' :
                                        color === 'Rosa' ? '#FF69B4' :
                                        color === 'Cinza' ? '#808080' : '#ccc',
                                      borderColor: (color === 'Branco' || color === '#FFFFFF') ? '#ccc' : 'transparent'
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

                            {/* ✅ DEBUG: Mostrar campos disponíveis */}
                            {colorName === 'Não especificada' && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                <p className="text-yellow-700 font-medium">⚠️ Cor não encontrada</p>
                                <p className="text-yellow-600">Campos disponíveis: {Object.keys(item).join(', ')}</p>
                                {item.variant && (
                                  <p className="text-yellow-600">Variant: {JSON.stringify(item.variant)}</p>
                                )}
                                {item.product_variant && (
                                  <p className="text-yellow-600">Product Variant: {JSON.stringify(item.product_variant)}</p>
                                )}
                              </div>
                            )}
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
              <p className="text-gray-500">Nenhum item</p>
            )}
          </div>

          {/* Endereço de entrega... */}
        </div>
      </div>
    </div>
  )}

  // [Restante do código...]
};

export default OrdersManagement;