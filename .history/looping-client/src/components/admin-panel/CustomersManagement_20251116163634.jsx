// src/components/admin/CustomersManagement.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiUser, FiShoppingBag, FiDollarSign, FiCalendar, FiPackage, FiServer } from "react-icons/fi";

const CustomersManagement = () => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  const API_BASE_URL = 'http://localhost:8000/api';

  const apiService = {
    async getOrders() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(`${API_BASE_URL}/orders`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Erro na API');
        return data.data || [];
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('Timeout: servidor demorou');
        throw error;
      }
    },

    async testConnection() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${API_BASE_URL}/test`, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response.ok ? { connected: true } : { connected: false, error: response.status };
      } catch (err) {
        return { connected: false, error: err.message };
      }
    },

    async generateSampleOrders() {
      const response = await fetch(`${API_BASE_URL}/orders/generate-samples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      if (!response.ok) throw new Error(`Erro ${response.status}`);
      const data = await response.json();
      return data.data;
    },
  };

  const testApiConnection = async () => {
    setLoading(true);
    const result = await apiService.testConnection();
    setApiStatus(result);
    alert(result.connected ? 'API conectada!' : `Falha: ${result.error}`);
    setLoading(false);
  };

  const generateSampleOrders = async () => {
    if (!window.confirm("Deseja gerar pedidos de exemplo?")) return;
    try {
      await apiService.generateSampleOrders();
      fetchCustomers();
    } catch (err) {
      setError("Erro ao gerar exemplo: " + err.message);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const orders = await apiService.getOrders();
      if (!orders.length) {
        setCustomers([]);
        return;
      }

      // Agregação: transformar pedidos em clientes
      const customerMap = new Map();

      orders.forEach(order => {
        const customerInfo = order.customer;
        const shippingInfo = order.shipping_address;
        const totals = order.totals || { total: 0 };

        if (customerInfo && customerInfo.email) {
          const key = customerInfo.email.toLowerCase();
          const orderDate = new Date(order.created_at);

          if (customerMap.has(key)) {
            const existing = customerMap.get(key);
            existing.orders += 1;
            existing.totalSpent += parseFloat(totals.total) || 0;
            if (orderDate > new Date(existing.lastPurchase)) {
              existing.lastPurchase = order.created_at;
            }
          } else {
            customerMap.set(key, {
              id: customerInfo.email,
              name: customerInfo.name || 'Cliente',
              email: customerInfo.email,
              phone: customerInfo.phone || 'Não informado',
              cpf: customerInfo.cpf || 'Não informado',
              address: shippingInfo
                ? `${shippingInfo.street}, ${shippingInfo.number} - ${shippingInfo.city}, ${shippingInfo.state}`
                : 'Endereço não informado',
              orders: 1,
              totalSpent: parseFloat(totals.total) || 0,
              status: "active",
              lastPurchase: order.created_at,
              firstOrder: order.created_at,
            });
          }
        }
      });

      const customersArray = Array.from(customerMap.values());
      customersArray.sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase));
      setCustomers(customersArray);
    } catch (err) {
      setError("Erro ao carregar clientes: " + err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
      setLastRefresh(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const toggleCustomerStatus = (customerId, currentStatus) => {
    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, status: currentStatus === "active" ? "suspended" : "active" } : c
    ));
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');
  const formatCurrency = (amount) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const filteredCustomers = customers.filter(customer =>
    [customer.name, customer.email, customer.address, customer.cpf].some(field =>
      field?.toLowerCase().includes(customerSearch.toLowerCase())
    )
  );

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    newCustomers: customers.filter(c => {
      const diffDays = Math.ceil((new Date() - new Date(c.firstOrder)) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  // ERRO
  if (error) {
    return (
      <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Erro: </strong>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="absolute top-0 right-0 px-4">&times;</button>
        </div>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Solução:</strong>
          <ul className="list-disc list-inside mt-2 text-sm">
            <li><code>php artisan serve --port=8000</code></li>
            <li>CORS configurado para <code>localhost:3000</code>?</li>
            <li><code>php artisan config:clear</code></li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchCustomers} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Tentar Novamente</button>
          <button onClick={testApiConnection} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Testar API</button>
          <button onClick={generateSampleOrders} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Gerar Exemplo</button>
        </div>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // VAZIO
  if (customers.length === 0) {
    return (
      <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gerenciamento de Clientes</h2>
          <button onClick={generateSampleOrders} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
            <FiPackage size={16} /> Gerar Exemplo
          </button>
        </div>
        <div className="text-center py-16 bg-white rounded-lg border">
          <FiUser className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mt-2">Gere pedidos de exemplo ou finalize uma compra.</p>
          <button onClick={generateSampleOrders} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
            Gerar Pedido de Exemplo
          </button>
        </div>
      </div>
    );
  }

  // UI PRINCIPAL
  return (
    <div className="space-y-6 p-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg"><FiUser className="text-blue-600" size={20} /></div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg"><FiUser className="text-green-600" size={20} /></div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg"><FiUser className="text-purple-600" size={20} /></div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Novos (7 dias)</p>
              <p className="text-2xl font-bold">{stats.newCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg"><FiDollarSign className="text-orange-600" size={20} /></div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Clientes</h2>
          <p className="text-sm text-gray-600">Atualizado em: {lastRefresh}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={fetchCustomers} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button onClick={testApiConnection} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <FiServer size={16} /> Testar API
          </button>
          <button onClick={generateSampleOrders} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <FiPackage size={16} /> Exemplo
          </button>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full sm:w-64 p-2 pl-10 border rounded text-black focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status === 'active' ? 'Ativo' : 'Suspenso'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center"><FiShoppingBag className="mr-2" size={14} /><span><strong>Pedidos:</strong> {customer.orders}</span></div>
              <div className="flex items-center"><FiDollarSign className="mr-2" size={14} /><span><strong>Total:</strong> {formatCurrency(customer.totalSpent)}</span></div>
              <div className="flex items-center"><FiCalendar className="mr-2" size={14} /><span><strong>Última:</strong> {formatDate(customer.lastPurchase)}</span></div>
              <div><p><strong>Tel:</strong> {customer.phone}</p></div>
              <div><p><strong>CPF:</strong> {customer.cpf}</p></div>
              <div><p className="text-xs truncate" title={customer.address}><strong>End:</strong> {customer.address}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => toggleCustomerStatus(customer.id, customer.status)} className={`text-xs px-3 py-1 rounded ${customer.status === "active" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}>
                {customer.status === "active" ? "Suspender" : "Ativar"}
              </button>
              <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">Editar</button>
              <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">Histórico</button>
              <button className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200">Mensagem</button>
            </div>
          </div>
        ))}
      </div>

      {/* Debug */}
      <details className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <summary className="cursor-pointer font-medium text-gray-700">Debug (Dev)</summary>
        <div className="mt-2 text-xs space-y-1">
          <p><strong>Clientes únicos:</strong> {customers.length}</p>
          <p><strong>Total de pedidos:</strong> {customers.reduce((s, c) => s + c.orders, 0)}</p>
          <p><strong>Última atualização:</strong> {lastRefresh}</p>
          <button onClick={() => console.log('Customers:', customers)} className="text-blue-600 hover:underline">Ver no console</button>
        </div>
      </details>
    </div>
  );
};

export default CustomersManagement;