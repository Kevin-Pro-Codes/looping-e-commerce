// src/components/admin/CustomersManagement.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiUser, FiShoppingBag, FiDollarSign, FiCalendar } from "react-icons/fi";

const CustomersManagement = () => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = '/api';

  const API_ENDPOINTS = {
    getCustomers: `${API_BASE_URL}/infos/all`,
    getCustomerStats: `${API_BASE_URL}/infos/stats`,
    getCustomerByEmail: (email) => `${API_BASE_URL}/infos/${email}`,
  };

  // ✅ NEW: Function to deduplicate customers by email
  const deduplicateCustomersByEmail = (customersData) => {
    const emailMap = new Map();
    
    customersData.forEach(customer => {
      const email = (customer.email || '').toLowerCase().trim();
      
      if (!email || email === 'n/a') {
        // Handle customers without email - keep them with a unique identifier
        const uniqueId = `no-email-${customer.id || Math.random()}`;
        if (!emailMap.has(uniqueId)) {
          emailMap.set(uniqueId, customer);
        }
        return;
      }
      
      // If email already exists, merge the data or keep the most recent/complete record
      if (emailMap.has(email)) {
        const existingCustomer = emailMap.get(email);
        
        // Strategy: Keep the customer with more orders or most recent activity
        const existingOrders = existingCustomer.orders_count || 0;
        const newOrders = customer.orders_count || 0;
        
        // Keep the customer with more orders, or if equal, keep the existing one
        if (newOrders > existingOrders) {
          emailMap.set(email, customer);
        }
        // Optional: You could merge data here instead
        // emailMap.set(email, { ...existingCustomer, ...customer });
      } else {
        emailMap.set(email, customer);
      }
    });
    
    return Array.from(emailMap.values());
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
        
        if (data.success && data.data) {
          return data.data;
        } else if (Array.isArray(data)) {
          return data;
        } else {
          return data.data || data || [];
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
        return {
          total: customers.length,
          active: customers.filter(c => (c.status || 'active') === 'active').length,
          new_customers: 0,
          total_revenue: 0
        };
      }
    }
  };

  // ✅ UPDATED: Fetch customers with deduplication
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const customersData = await apiService.getCustomers();
      console.log('✅ API Response (raw):', customersData);
      
      // ✅ Apply deduplication
      const uniqueCustomers = deduplicateCustomersByEmail(customersData);
      console.log('✅ After deduplication:', uniqueCustomers);
      
      // Ensure all customers have required fields
      const processedCustomers = uniqueCustomers.map(customer => ({
        id: customer.id,
        name: customer.name || 'Cliente Sem Nome',
        email: customer.email || 'N/A',
        phone: customer.phone || 'Não informado',
        cpf: customer.cpf || 'Não informado',
        address: customer.address || 'Endereço não informado',
        status: customer.status || 'active',
        orders_count: customer.orders_count || 0,
        total_spent: customer.total_spent || 0,
        last_purchase: customer.last_purchase || null,
        first_order: customer.first_order || null
      }));
      
      setCustomers(processedCustomers);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('❌ API Error:', err);
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

  // ✅ UPDATED: Filter function that considers email uniqueness
  const filteredCustomers = customers.filter(customer =>
    (customer.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.email || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.address || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.cpf || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
    (customer.phone || '').toLowerCase().includes(customerSearch.toLowerCase())
  );

  const stats = {
    total: customers.length,
    active: customers.filter(c => (c.status || 'active') === 'active').length,
    newCustomers: customers.filter(c => {
      const orderDate = c.first_order;
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

  // ✅ UPDATED: Debug info to show deduplication stats
  const getDeduplicationStats = () => {
    const emailCounts = {};
    customers.forEach(customer => {
      const email = customer.email;
      emailCounts[email] = (emailCounts[email] || 0) + 1;
    });
    
    const duplicates = Object.entries(emailCounts).filter(([_, count]) => count > 1);
    
    return {
      totalUniqueEmails: Object.keys(emailCounts).length,
      duplicateEmails: duplicates.length,
      duplicateDetails: duplicates
    };
  };

  const dedupStats = getDeduplicationStats();

  // ✅ BEAUTIFUL SKELETON LOADING COMPONENT
  const SkeletonLoading = () => (
    <div className="space-y-6 animate-pulse" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-lg">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-3 space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Header and Search Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-7 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
          <div className="relative w-full sm:w-64">
            <div className="w-full h-9 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Customers Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Customer Header Skeleton */}
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-16 ml-2"></div>
            </div>
            
            {/* Customer Details Skeleton */}
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded flex-1" style={{ 
                    width: j === 0 ? '70%' : j === 1 ? '60%' : j === 2 ? '80%' : j === 3 ? '50%' : '90%' 
                  }}></div>
                </div>
              ))}
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[...Array(4)].map((_, k) => (
                <div key={k} className="h-7 bg-gray-200 rounded w-16"></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Debug Section Skeleton */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="h-5 bg-gray-200 rounded w-64 mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  // Return skeleton loading if data is being fetched
  if (loading) {
    return <SkeletonLoading />;
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
            {dedupStats.duplicateEmails > 0 && ` • ${dedupStats.duplicateEmails} emails duplicados removidos`}
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
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <FiUser className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600">
            {customerSearch ? 'Tente ajustar os termos da busca.' : 'Nenhum cliente cadastrado no sistema.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div key={`${customer.id}-${customer.email}`} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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

      {/* ✅ UPDATED: Debug Info with deduplication details */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-gray-700">
            Informações de Debug (Desenvolvimento)
          </summary>
          <div className="mt-2 space-y-2 text-xs">
            <p><strong>Total de clientes carregados:</strong> {customers.length}</p>
            <p><strong>Clientes filtrados:</strong> {filteredCustomers.length}</p>
            <p><strong>Emails únicos:</strong> {dedupStats.totalUniqueEmails}</p>
            <p><strong>Emails duplicados removidos:</strong> {dedupStats.duplicateEmails}</p>
            <p><strong>Total de pedidos no sistema:</strong> {customers.reduce((sum, c) => sum + (c.orders_count || 0), 0)}</p>
            <p><strong>Última atualização:</strong> {lastRefresh || 'Nunca'}</p>
            <p><strong>Endpoint usado:</strong> {API_ENDPOINTS.getCustomers}</p>
            
            {dedupStats.duplicateDetails.length > 0 && (
              <div>
                <p><strong>Emails com duplicatas encontradas:</strong></p>
                <ul className="ml-4 mt-1">
                  {dedupStats.duplicateDetails.map(([email, count]) => (
                    <li key={email} className="text-red-600">
                      {email}: {count} ocorrências
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
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