// src/components/admin/CustomersManagement.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiUser, FiShoppingBag, FiDollarSign, FiCalendar } from "react-icons/fi";

const CustomersManagement = () => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  // ✅ UPDATED: Use /infos endpoints only
  const API_ENDPOINTS = {
    getCustomers: `${API_BASE_URL}/infos/all`,
    getCustomerStats: `${API_BASE_URL}/infos/stats`,
    getCustomerByEmail: (email) => `${API_BASE_URL}/infos/${email}`,
  };

  const apiService = {
    async getCustomers() {
      try {
        console.log('🔄 Buscando clientes em:', API_ENDPOINTS.getCustomers);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(API_ENDPOINTS.getCustomers, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check for HTML response (error)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          const text = await response.text();
          throw new Error('Servidor retornou HTML em vez de JSON. Verifique os logs do Laravel.');
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
        
        // ✅ Handle different response structures
        if (data.success && data.data) {
          return data.data; // { success: true, data: [...] }
        } else if (Array.isArray(data)) {
          return data; // Direct array response
        } else if (data.data && Array.isArray(data.data)) {
          return data.data; // Laravel resource collection
        } else {
          return data || []; // Fallback
        }
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Timeout: servidor demorou muito para responder');
        if (error.message.includes('Failed to fetch')) throw new Error('Servidor offline ou CORS bloqueado');
        throw error;
      }
    },

    async getCustomerStats() {
      try {
        const response = await fetch(API_ENDPOINTS.getCustomerStats);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        return data.success ? data.data : data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Return default stats if API fails
        return {
          total: customers.length,
          active: customers.filter(c => (c.status || 'active') === 'active').length,
          new_customers: 0,
          total_revenue: 0
        };
      }
    }
  };

  // Fetch customers from database
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const customersData = await apiService.getCustomers();
      
      // ✅ PROCESS DATA: Add missing fields with defaults for frontend
      const processedCustomers = customersData.map(customer => ({
        // Essential fields with fallbacks
        id: customer.id || customer.customer_id || Math.random().toString(36).substr(2, 9),
        name: customer.name || customer.nome || customer.full_name || 'Cliente Sem Nome',
        email: customer.email || customer.email_address || 'N/A',
        
        // Contact info with fallbacks
        phone: customer.phone || customer.telefone || customer.phone_number || 'Não informado',
        cpf: customer.cpf || customer.document || 'Não informado',
        address: customer.address || customer.endereco || customer.full_address || 'Endereço não informado',
        
        // Status and business data with fallbacks
        status: customer.status || customer.estado || 'active',
        total_spent: parseFloat(customer.total_spent) || parseFloat(customer.total_gasto) || parseFloat(customer.total_revenue) || 0,
        orders_count: parseInt(customer.orders_count) || parseInt(customer.pedidos_count) || parseInt(customer.total_orders) || 0,
        
        // Dates with fallbacks
        last_purchase: customer.last_purchase || customer.ultima_compra || customer.last_order_date || null,
        first_order: customer.first_order || customer.primeira_compra || customer.created_at || null,
        created_at: customer.created_at || customer.data_criacao || new Date().toISOString()
      }));
      
      setCustomers(processedCustomers);
      setLastRefresh(new Date().toLocaleTimeString());
      
      console.log('✅ Clientes processados:', processedCustomers);
    } catch (err) {
      setError("Erro ao carregar clientes: " + err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ UPDATED: Only update local state (no API call for status update)
  const toggleCustomerStatus = (customerId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { 
        ...customer, 
        status: newStatus 
      } : customer
    ));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": 
        return "bg-green-100 text-green-800";
      case "suspended": 
        return "bg-red-100 text-red-800";
      case "new": 
        return "bg-blue-100 text-blue-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // ✅ UPDATED: Safe search with null checks
  const filteredCustomers = customers.filter(customer =>
    (customer.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.address || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.cpf || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.phone || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  // ✅ UPDATED: Resilient stats calculation
  const stats = {
    total: customers.length,
    active: customers.filter(c => (c.status || 'active') === 'active').length,
    newCustomers: customers.filter(c => {
      const orderDate = c.first_order || c.created_at;
      if (!orderDate) return false;
      try {
        const firstOrder = new Date(orderDate);
        const today = new Date();
        const diffTime = Math.abs(today - firstOrder);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } catch (e) {
        return false;
      }
    }).length,
    totalRevenue: customers.reduce((sum, customer) => sum + (parseFloat(customer.total_spent) || 0), 0)
  };

  // Error display
  if (error) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
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
            <li><strong>2. Rota /api/infos/all existe?</strong> Verifique routes/api.php</li>
            <li><strong>3. Controller retorna JSON?</strong> Verifique InfoController</li>
            <li><strong>4. Limpe cache:</strong> <code>php artisan config:clear</code></li>
            <li><strong>5. Verifique logs:</strong> <code>tail -f storage/logs/laravel.log</code></li>
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={fetchCustomers} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiRefreshCw size={16} />
            Tentar Novamente
          </button>
          <button 
            onClick={() => { setError(null); setLoading(false); }} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Continuar Offline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUser className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiUser className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUser className="text-purple-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Novos (7 dias)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newCustomers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiDollarSign className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Clientes</h2>
          <p className="text-sm text-gray-600">
            {lastRefresh && `Atualizado em: ${lastRefresh}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <FiUser className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {customerSearch ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-gray-600">
            {customerSearch ? 'Tente ajustar os termos da busca.' : 'Os clientes aparecerão aqui quando estiverem disponíveis.'}
          </p>
          {!customerSearch && (
            <button 
              onClick={fetchCustomers}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Recarregar
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                  {customer.status === 'active' ? 'Ativo' : customer.status === 'suspended' ? 'Suspenso' : 'Novo'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                  <FiShoppingBag className="text-gray-400 mr-2" size={14} />
                  <span><strong>Pedidos:</strong> {customer.orders_count || 0}</span>
                </div>
                
                <div className="flex items-center">
                  <FiDollarSign className="text-gray-400 mr-2" size={14} />
                  <span><strong>Total Gasto:</strong> {formatCurrency(customer.total_spent)}</span>
                </div>
                
                <div className="flex items-center">
                  <FiCalendar className="text-gray-400 mr-2" size={14} />
                  <span><strong>Última Compra:</strong> {formatDate(customer.last_purchase)}</span>
                </div>
                
                <div>
                  <p><strong>Telefone:</strong> {customer.phone}</p>
                  <p><strong>CPF:</strong> {customer.cpf}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 truncate" title={customer.address}>
                    <strong>Endereço:</strong> {customer.address}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <button 
                  onClick={() => toggleCustomerStatus(customer.id, customer.status)}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    customer.status === "active" 
                      ? "bg-red-100 text-red-700 hover:bg-red-200" 
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {customer.status === "active" ? "Suspender" : "Ativar"}
                </button>
                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors">
                  Editar
                </button>
                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
                  Histórico
                </button>
                <button className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition-colors">
                  Mensagem
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-gray-700">
            Informações de Debug (Desenvolvimento)
          </summary>
          <div className="mt-2 space-y-2 text-xs">
            <p><strong>Total de clientes carregados:</strong> {customers.length}</p>
            <p><strong>Clientes filtrados:</strong> {filteredCustomers.length}</p>
            <p><strong>Total de pedidos no sistema:</strong> {customers.reduce((sum, c) => sum + (c.orders_count || 0), 0)}</p>
            <p><strong>Última atualização:</strong> {lastRefresh || 'Nunca'}</p>
            <p><strong>Endpoint usado:</strong> {API_ENDPOINTS.getCustomers}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => console.log('Customers data:', customers)}
                className="text-blue-600 hover:text-blue-800"
              >
                Ver dados no console
              </button>
              <button 
                onClick={fetchCustomers}
                className="text-green-600 hover:text-green-800"
              >
                Testar API Novamente
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CustomersManagement;