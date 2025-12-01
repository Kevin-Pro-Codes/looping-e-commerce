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

// CSRF Token Manager
class CsrfTokenManager {
  static token = null;
  static isFetching = false;
  static pendingRequests = [];

  static getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  static async getCsrfToken() {
    // Se já temos o token, retorna ele
    if (this.token) {
      return this.token;
    }

    // Se já está buscando, adiciona à fila de espera
    if (this.isFetching) {
      return new Promise((resolve) => {
        this.pendingRequests.push(resolve);
      });
    }

    this.isFetching = true;

    try {
      console.log('🛡️ Buscando CSRF token...');
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Falha ao buscar CSRF cookie: ${response.status}`);
      }

      // Extrai o token do cookie
      this.token = this.getCookie('XSRF-TOKEN');
      
      if (!this.token) {
        // Tenta buscar o token de outras formas
        this.token = this.getCookie('csrf-token') || this.getCookie('X-CSRF-TOKEN');
      }

      if (!this.token) {
        console.warn('CSRF token não encontrado nos cookies, tentando sem...');
      } else {
        console.log('✅ CSRF token obtido:', this.token);
      }
      
      // Resolve todas as requisições pendentes
      this.pendingRequests.forEach(resolve => resolve(this.token));
      this.pendingRequests = [];
      
      return this.token;
    } catch (error) {
      console.error('❌ Erro ao obter CSRF token:', error);
      this.pendingRequests.forEach(resolve => resolve(null));
      this.pendingRequests = [];
      return null;
    } finally {
      this.isFetching = false;
    }
  }

  static clearToken() {
    this.token = null;
  }
}

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

  // API Service com CSRF Token
  const apiService = {
    async getHeaders(includeCsrf = false) {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (includeCsrf) {
        try {
          const csrfToken = await CsrfTokenManager.getCsrfToken();
          if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
            // Também tenta outros headers comuns
            headers['X-CSRF-TOKEN'] = csrfToken;
          }
        } catch (error) {
          console.error('Erro ao obter CSRF token:', error);
        }
      }

      return headers;
    },

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

    async updateOrderStatus(orderId, statusData) {
      try {
        console.log(`Updating order ${orderId}:`, statusData);
        
        // Primeiro busca o CSRF token
        await CsrfTokenManager.getCsrfToken();
        
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        };

        // Adiciona o CSRF token se disponível
        if (CsrfTokenManager.token) {
          headers['X-XSRF-TOKEN'] = CsrfTokenManager.token;
          headers['X-CSRF-TOKEN'] = CsrfTokenManager.token;
        }

        const response = await fetch(`${API_BASE_URL}/infos/${orderId}/status`, {
          method: 'PUT',
          headers: headers,
          credentials: 'include', // Importante para enviar cookies
          body: JSON.stringify(statusData),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          // Se for erro 419, tenta recarregar o CSRF token
          if (response.status === 419) {
            console.log('🔄 CSRF token expirado, tentando renovar...');
            CsrfTokenManager.clearToken();
            const newToken = await CsrfTokenManager.getCsrfToken();
            
            if (newToken) {
              headers['X-XSRF-TOKEN'] = newToken;
              headers['X-CSRF-TOKEN'] = newToken;
              
              // Tenta novamente com o novo token
              const retryResponse = await fetch(`${API_BASE_URL}/infos/${orderId}/status`, {
                method: 'PUT',
                headers: headers,
                credentials: 'include',
                body: JSON.stringify(statusData),
              });
              
              if (retryResponse.ok) {
                const result = await retryResponse.json();
                if (!result.success) {
                  throw new Error(result.message || 'Failed to update order status');
                }
                return result.data;
              }
            }
          }
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {}
          throw new Error(errorMessage);
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
      // Primeiro busca o CSRF token
      await CsrfTokenManager.getCsrfToken();
      
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (CsrfTokenManager.token) {
        headers['X-XSRF-TOKEN'] = CsrfTokenManager.token;
        headers['X-CSRF-TOKEN'] = CsrfTokenManager.token;
      }

      const response = await fetch(`${API_BASE_URL}/infos/generate-samples`, {
        method: 'POST',
        headers: headers,
        credentials: 'include',
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        // Se for erro 419, tenta recarregar o CSRF token
        if (response.status === 419) {
          console.log('🔄 CSRF token expirado, tentando renovar...');
          CsrfTokenManager.clearToken();
          const newToken = await CsrfTokenManager.getCsrfToken();
          
          if (newToken) {
            headers['X-XSRF-TOKEN'] = newToken;
            headers['X-CSRF-TOKEN'] = newToken;
            
            // Tenta novamente
            const retryResponse = await fetch(`${API_BASE_URL}/infos/generate-samples`, {
              method: 'POST',
              headers: headers,
              credentials: 'include',
              body: JSON.stringify({}),
            });
            
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              return data.data;
            }
          }
        }
        throw new Error(`Erro ${response.status}`);
      }
      
      const data = await response.json();
      return data.data;
    },
  };

  // Resto do código permanece igual...
  // Update order status with database persistence
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Add to updating set for loading state
      setUpdatingOrders(prev => new Set(prev).add(orderId));

      // Optimistically update UI
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      // Determine payment status based on order status
      let paymentStatus = 'paid'; // Default
      if (newStatus === 'cancelled') {
        paymentStatus = 'refunded';
      } else if (newStatus === 'pending') {
        paymentStatus = 'pending';
      }

      // Send update to server
      const statusData = {
        status: newStatus,
        payment_status: paymentStatus
      };

      await apiService.updateOrderStatus(orderId, statusData);
      
      // Show success message
      setError(null);
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      
    } catch (err) {
      // Revert optimistic update on error
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: o.status } : o
      ));
      
      setError(`Failed to update order status: ${err.message}`);
      console.error('Error updating order status:', err);
      
      // Show error alert
      alert(`Erro ao atualizar status: ${err.message}`);
    } finally {
      // Remove from updating set
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // ... (resto do código permanece igual)

  // Skeleton loading component
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="w-10 h-10 bg-gray-200 rounded border border-gray-300"></div>
          ))}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1 max-w-24">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="w-8 h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-2 max-w-32">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
              <div className="w-8 h-3 bg-gray-200 rounded hidden sm:block"></div>
            </div>
          ))}
        </div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="w-16 h-6 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="w-20 h-6 bg-gray-200 rounded"></div>
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-6 h-6 bg-gray_200 rounded"></div>
        </div>
      </td>
    </tr>
  );

  // ... (resto do código helper functions permanece igual)

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
                {filteredAndSortedOrders.length} {filteredAndSortedOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
                {filteredAndSortedOrders.length > 0 && (
                  <span className="text-blue-600 ml-2">
                    • Ordenado por: {sortableFields[sortConfig.key]?.label} ({sortConfig.direction === 'asc' ? 'crescente' : 'decrescente'})
                  </span>
                )}
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

      {/* Resto do JSX permanece igual */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          {Object.entries(sortableFields).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              disabled={loading}
              className={`
                box-border inline-flex items-center gap-1
                px-3 py-1 rounded text-xs font-medium transition-colors border
                focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed
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
            disabled={loading}
            className="box-border inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
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
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanhos
                </th>
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
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <SkeletonRow key={index} />
                ))
              ) : filteredAndSortedOrders.length > 0 ? (
                filteredAndSortedOrders.map((order) => {
                  const { sizes, colors, images } = getOrderAttributes(order);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {images.length > 0 ? (
                            images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={image} 
                                  alt={`Produto ${index + 1}`}
                                  className="w-19 h-19 object-contain rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                                  title="Clique para ver detalhes"
                                  onClick={() => viewOrderDetails(order)}
                                />
                                {index === 2 && images.length > 3 && (
                                  <div className="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">+{images.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div 
                              className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => viewOrderDetails(order)}
                              title="Ver detalhes do pedido"
                            >
                              <FiImage className="text-gray-400" size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      
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
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 sm:px-6 py-8 text-center">
                    <div className="text-gray-500">
                      <FiPackage className="mx-auto mb-2" size={32} />
                      <p>Nenhum pedido encontrado</p>
                      {orderSearch && (
                        <p className="text-sm mt-1">
                          Tente ajustar os termos da busca: "{orderSearch}"
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal e outros componentes permanecem iguais */}
    </div>
  );
};   

export default OrdersManagement;