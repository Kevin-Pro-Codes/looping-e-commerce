// src/components/admin/CustomersManagement.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiUser, FiShoppingBag, FiDollarSign, FiCalendar } from "react-icons/fi";

const CustomersManagement = () => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Fetch customers from localStorage (from CheckoutPage orders)
  const fetchCustomersFromOrders = () => {
    setLoading(true);
    try {
      // Get recent orders from localStorage
      const recentOrdersKey = 'checkout_recent_orders';
      const recentOrders = JSON.parse(localStorage.getItem(recentOrdersKey) || '[]');
      
      console.log('📦 Found orders in storage:', recentOrders.length);
      
      // Transform orders into customer data
      const customerMap = new Map();
      
      recentOrders.forEach(order => {
        const orderData = order.order || order;
        const customerInfo = orderData.customer;
        const shippingInfo = orderData.shipping_address;
        
        if (customerInfo && customerInfo.email) {
          const customerKey = customerInfo.email.toLowerCase();
          
          if (customerMap.has(customerKey)) {
            // Update existing customer
            const existing = customerMap.get(customerKey);
            existing.orders += 1;
            existing.totalSpent += orderData.totals?.total || 0;
            
            // Update last purchase if this order is newer
            const orderDate = new Date(orderData.created_at);
            const lastPurchase = new Date(existing.lastPurchase);
            if (orderDate > lastPurchase) {
              existing.lastPurchase = orderData.created_at;
            }
          } else {
            // Create new customer
            customerMap.set(customerKey, {
              id: customerInfo.email, // Use email as ID for now
              name: customerInfo.name || 'Cliente',
              email: customerInfo.email,
              phone: customerInfo.phone || 'Não informado',
              cpf: customerInfo.cpf || 'Não informado',
              address: shippingInfo ? 
                `${shippingInfo.street}, ${shippingInfo.number} - ${shippingInfo.city}, ${shippingInfo.state}` : 
                'Endereço não informado',
              orders: 1,
              totalSpent: orderData.totals?.total || 0,
              status: "active",
              lastPurchase: orderData.created_at,
              firstOrder: orderData.created_at,
              orderIds: [orderData.id]
            });
          }
        }
      });
      
      const customersArray = Array.from(customerMap.values());
      
      // Sort by last purchase date (newest first)
      customersArray.sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase));
      
      console.log('👥 Processed customers:', customersArray);
      setCustomers(customersArray);
      
    } catch (error) {
      console.error('❌ Error fetching customers from orders:', error);
      
      // Fallback to sample data if no orders found
      if (customers.length === 0) {
        setCustomers([
          { 
            id: 1, 
            name: "João Silva", 
            email: "joao@email.com", 
            phone: "+55 11 99999-9999", 
            cpf: "123.456.789-00", 
            address: "Rua das Flores, 123 - São Paulo, SP", 
            orders: 5, 
            totalSpent: 450.00, 
            status: "active", 
            lastPurchase: "2024-01-15",
            firstOrder: "2024-01-10"
          },
          { 
            id: 2, 
            name: "Maria Santos", 
            email: "maria@email.com", 
            phone: "+55 21 88888-8888", 
            cpf: "987.654.321-00", 
            address: "Av. Copacabana, 456 - Rio de Janeiro, RJ", 
            orders: 3, 
            totalSpent: 180.00, 
            status: "active", 
            lastPurchase: "2024-01-14",
            firstOrder: "2024-01-12"
          }
        ]);
      }
    } finally {
      setLoading(false);
      setLastRefresh(new Date().toLocaleTimeString());
    }
  };

  // Load customers on component mount
  useEffect(() => {
    fetchCustomersFromOrders();
    
    // Set up polling to check for new customers every 10 seconds
    const interval = setInterval(fetchCustomersFromOrders, 10000);
    
    return () => clearInterval(interval);
  }, []);

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

  const toggleCustomerStatus = (customerId, currentStatus) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { 
        ...customer, 
        status: currentStatus === "active" ? "suspended" : "active" 
      } : customer
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.address?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.cpf?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    newCustomers: customers.filter(c => {
      const firstOrder = new Date(c.firstOrder);
      const today = new Date();
      const diffTime = Math.abs(today - firstOrder);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // New in last 7 days
    }).length,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
  };

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
            onClick={fetchCustomersFromOrders}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-600">
            {customerSearch ? 'Tente ajustar os termos da busca.' : 'Faça pedidos no checkout para ver os clientes aqui.'}
          </p>
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
                  {customer.status === 'active' ? 'Ativo' : 'Suspenso'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                  <FiShoppingBag className="text-gray-400 mr-2" size={14} />
                  <span><strong>Pedidos:</strong> {customer.orders}</span>
                </div>
                
                <div className="flex items-center">
                  <FiDollarSign className="text-gray-400 mr-2" size={14} />
                  <span><strong>Total Gasto:</strong> {formatCurrency(customer.totalSpent)}</span>
                </div>
                
                <div className="flex items-center">
                  <FiCalendar className="text-gray-400 mr-2" size={14} />
                  <span><strong>Última Compra:</strong> {formatDate(customer.lastPurchase)}</span>
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
            <p><strong>Total de pedidos no localStorage:</strong> {customers.reduce((sum, c) => sum + c.orders, 0)}</p>
            <p><strong>Clientes únicos encontrados:</strong> {customers.length}</p>
            <p><strong>Última atualização:</strong> {lastRefresh || 'Nunca'}</p>
            <button 
              onClick={() => console.log('Customers data:', customers)}
              className="text-blue-600 hover:text-blue-800"
            >
              Ver dados completos no console
            </button>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CustomersManagement;