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
  
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });

  const API_BASE_URL = 'http://localhost:8000/api';

  const sortableFields = {
    order_number: { label: 'Número do Pedido', type: 'string' },
    customer_name: { label: 'Nome do Cliente', type: 'string' },
    customer_email: { label: 'Email', type: 'string' },
    created_at: { label: 'Data do Pedido', type: 'date' },
    total: { label: 'Valor Total', type: 'number' },
    payment_method: { label: 'Método de Pagamento', type: 'string' },
    status: { label: 'Status', type: 'string' }
  };

  // Helper function to extract item attributes
  const getItemAttributes = (item) => {
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
      item.metadata?.size ||
      'Não especificado';
    
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
      item.metadata?.color ||
      'Não especificada';
    
    return { size, color };
  };

  // Helper function to get color name from hex code or color string
  const getColorName = (color) => {
    if (!color || color === 'Não especificada' || color === 'undefined') {
      return 'Não especificada';
    }
    
    const colorMap = {
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
    
    const normalizedColor = color.toString().toLowerCase().trim().replace(/\s+/g, '');
    
    if (colorMap[normalizedColor]) {
      return colorMap[normalizedColor];
    }
    
    for (const [key, value] of Object.entries(colorMap)) {
      if (normalizedColor.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedColor)) {
        return value;
      }
    }
    
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return color.toUpperCase();
    }
    
    return color.charAt(0).toUpperCase() + color.slice(1);
  };

  // Function to get all unique sizes and colors from order items
  const getOrderAttributes = (order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return { sizes: [], colors: [] };
    }

    const sizes = new Set();
    const colors = new Set();

    order.items.forEach(item => {
      const { size, color } = getItemAttributes(item);
      if (size && size !== 'Não especificado') {
        sizes.add(size);
      }
      if (color && color !== 'Não especificada') {
        colors.add(getColorName(color));
      }
    });

    return {
      sizes: Array.from(sizes),
      colors: Array.from(colors)
    };
  };

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

  const sortOrders = (orders, config) => {
    if (!config.key) return orders;

    return [...orders].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';

      const fieldConfig = sortableFields[config.key];
      
      let comparison = 0;
      
      switch (fieldConfig?.type) {
        case 'number':
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          comparison = aValue - bValue;
          break;
        
        case 'date':
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
          comparison = aValue - bValue;
          break;
        
        case 'string':
        default:
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
          comparison = aValue.localeCompare(bValue, 'pt-BR');
          break;
      }

      return config.direction === 'desc' ? -comparison : comparison;
    });
  };

  const handleSort = (key) => {
    setSortConfig(currentConfig => ({
      key,
      direction: 
        currentConfig.key === key && currentConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-gray-400">↕</span>;
    }
    
    return sortConfig.direction === 'asc' 
      ? <FiChevronUp className="text-black" size={16} />
      : <FiChevronDown className="text-black" size={16} />;
  };

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

  const filteredAndSortedOrders = sortOrders(
    orders.filter(order =>
      order && (
        (order.order_number?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
        getPaymentText(order.payment_method).toLowerCase().includes(orderSearch.toLowerCase()) ||
        formatCurrency(order.total).toLowerCase().includes(orderSearch.toLowerCase())
      )
    ),
    sortConfig
  );

  const getDisplayValue = (order, key) => {
    const value = order[key];
    
    switch (key) {
      case 'total':
        return formatCurrency(value);
      case 'created_at':
        return order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A';
      case 'status':
        return getStatusText(value);
      case 'payment_method':
        return getPaymentText(value);
      default:
        return value || 'N/A';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredAndSortedOrders.length} {filteredAndSortedOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
            {filteredAndSortedOrders.length > 0 && (
              <span className="text-blue-600 ml-2">
                • Ordenado por: {sortableFields[sortConfig.key]?.label} ({sortConfig.direction === 'asc' ? 'crescente' : 'decrescente'})
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

      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          {Object.entries(sortableFields).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`
                box-border inline-flex items-center gap-1
                px-3 py-1 rounded text-xs font-medium transition-colors border
                focus:outline-none focus:ring-0
                ${
                  sortConfig.key === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <span className="leading-none">{config.label}</span>
              {renderSortIcon(key)}
            </button>
          ))}

          <button
            onClick={() => setSortConfig({ key: 'created_at', direction: 'desc' })}
            className="box-border inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 focus:outline-none focus:ring-0"
          >
            Resetar
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('order_number')}
                >
                  <div className="flex items-center gap-1">
                    Pedido
                    {renderSortIcon('order_number')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('customer_name')}
                >
                  <div className="flex items-center gap-1">
                    Cliente
                    {renderSortIcon('customer_name')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Data
                    {renderSortIcon('created_at')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center gap-1">
                    Total
                    {renderSortIcon('total')}
                  </div>
                </th>
                {/* NEW: Tamanhos Column */}
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanhos
                </th>
                {/* NEW: Cores Column */}
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cores
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('payment_method')}
                >
                  <div className="flex items-center gap-1">
                    Pagamento
                    {renderSortIcon('payment_method')}
                  </div>
                </th>
                <th 
                  className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedOrders.map((order) => {
                const { sizes, colors } = getOrderAttributes(order);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getDisplayValue(order, 'order_number')}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getDisplayValue(order, 'customer_name')}</div>
                      <div className="text-sm text-gray-500">{order.customer_email || 'N/A'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDisplayValue(order, 'created_at')}
                      {order.created_at && (
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {getDisplayValue(order, 'total')}
                    </td>
                    
                    {/* NEW: Tamanhos Column */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 max-w-24">
                        {sizes.length > 0 ? (
                          sizes.map((size, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {size}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    
                    {/* NEW: Cores Column */}
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2 max-w-32">
                        {colors.length > 0 ? (
                          colors.map((color, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div 
                                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                                style={{ 
                                  backgroundColor: color === 'Branco' ? '#FFFFFF' : 
                                    color === 'Preto' ? '#000000' :
                                    color === 'Azul' ? '#1E90FF' :
                                    color === 'Vermelho' ? '#FF0000' :
                                    color === 'Verde' ? '#00FF00' :
                                    color === 'Amarelo' ? '#FFFF00' :
                                    color === 'Rosa' ? '#FF69B4' :
                                    color === 'Cinza' ? '#808080' :
                                    color === 'Laranja' ? '#FFA500' :
                                    color === 'Roxo' ? '#800080' :
                                    color === 'Marrom' ? '#964B00' : '#ccc',
                                  borderColor: (color === 'Branco' || color === 'White') ? '#ccc' : 'transparent'
                                }}
                                title={color}
                              ></div>
                              <span className="text-xs text-gray-700 hidden sm:inline">
                                {color}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getPaymentColor(order.payment_method)}`}>
                        {getDisplayValue(order, 'payment_method')}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-medium px-3 py-1 border-0 focus:ring-2 rounded focus:ring-blue-500 ${getStatusColor(order.status)}`}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* The rest of the modal and delete confirmation code remains the same */}
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
                    <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs ${getStatusColor(selectedOrder.status)}`}>{getStatusText(selectedOrder.status)}</span></p>
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
                    <p><strong>Pagamento:</strong> <span className={`px-2 py-1 text-xs ${getPaymentColor(selectedOrder.payment_method)}`}>{getPaymentText(selectedOrder.payment_method)}</span></p>
                    <p><strong>Status Pagamento:</strong> {selectedOrder.payment_status || 'N/A'}</p>
                  </div>
                </div>
              </div>

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
                                
                                <div className="flex flex-wrap items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Tamanho:</span>
                                    <span className={`px-2 py-1 text-xs font-medium border ${
                                      size === 'Não especificado' 
                                        ? 'bg-white text-black border-black' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                      {size}
                                    </span>
                                  </div>
                                  
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
                                        colorName === 'Não especificada' ? 'text-black' : 'text-gray-700'
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