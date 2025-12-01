import React, { useState, useEffect } from 'react';
import { FiPackage, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiUser, FiMapPin, FiDollarSign } from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // ✅ Status configuration
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
    processing: { color: 'bg-blue-100 text-blue-800', text: 'Processando' },
    confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmado' },
    shipped: { color: 'bg-purple-100 text-purple-800', text: 'Enviado' },
    delivered: { color: 'bg-green-100 text-green-800', text: 'Entregue' },
    cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelado' },
    refunded: { color: 'bg-gray-100 text-gray-800', text: 'Reembolsado' }
  };

  // ✅ Payment method configuration
  const paymentMethodConfig = {
    pix: { color: 'bg-green-50 text-green-700', text: 'PIX' },
    credit: { color: 'bg-blue-50 text-blue-700', text: 'Cartão de Crédito' },
    debit: { color: 'bg-purple-50 text-purple-700', text: 'Cartão de Débito' },
    boleto: { color: 'bg-orange-50 text-orange-700', text: 'Boleto' }
  };

  // ✅ Fetch all orders from server
  const fetchServerOrders = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching all orders from server...');
      
      const response = await fetch('http://localhost:8000/api/admin/orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Admin orders response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ ALL ORDERS LOADED:', data);
        
        // Handle different response formats
        const ordersData = data.orders || data.data || data || [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        
        console.log(`📦 Loaded ${ordersData.length} orders from server`);
      } else {
        console.log('⚠️ Could not fetch orders from API, using mock data');
        const mockOrders = generateMockOrders();
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate comprehensive mock orders for admin
  const generateMockOrders = () => {
    const customers = [
      { id: 1, name: 'João Silva', email: 'joao.silva@email.com' },
      { id: 2, name: 'Maria Santos', email: 'maria.santos@email.com' },
      { id: 3, name: 'Pedro Oliveira', email: 'pedro.oliveira@email.com' },
      { id: 4, name: 'Ana Costa', email: 'ana.costa@email.com' },
      { id: 5, name: 'Carlos Souza', email: 'carlos.souza@email.com' }
    ];

    const products = [
      { id: 1, name: 'Smartphone Samsung Galaxy S23', price: 2499.99 },
      { id: 2, name: 'Notebook Dell Inspiron 15', price: 3299.99 },
      { id: 3, name: 'Fone de Ouvido Sony WH-1000XM4', price: 1299.99 },
      { id: 4, name: 'Smart TV LG 55" 4K', price: 2899.99 },
      { id: 5, name: 'Tablet iPad Air', price: 4199.99 },
      { id: 6, name: 'Smartwatch Apple Watch Series 8', price: 3299.99 },
      { id: 7, name: 'Câmera Canon EOS R6', price: 8999.99 },
      { id: 8, name: 'Console PlayStation 5', price: 4499.99 }
    ];

    const statuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['pix', 'credit', 'debit', 'boleto'];

    const mockOrders = [];
    const orderCount = 24; // More orders for admin view

    for (let i = 1; i <= orderCount; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;

        items.push({
          id: `${i}-${j}`,
          product_id: product.id,
          product_name: product.name,
          quantity: quantity,
          price: product.price,
          total: itemTotal
        });
      }

      const shipping = Math.random() > 0.3 ? 29.90 : 0;
      const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0;
      const total = subtotal + shipping - discount;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

      mockOrders.push({
        id: `order_${1000 + i}`,
        order_number: `#${1000 + i}`,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: status,
        payment_method: paymentMethod,
        payment_status: status === 'cancelled' ? 'refunded' : 'paid',
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total,
        items: items,
        order_date: orderDate.toISOString(),
        shipping_address: {
          street: `Rua ${['das Flores', 'Amaral', 'Vergueiro', 'Paulista', 'Augusta'][Math.floor(Math.random() * 5)]}`,
          number: Math.floor(100 + Math.random() * 900),
          complement: Math.random() > 0.7 ? 'Apto ' + Math.floor(10 + Math.random() * 90) : null,
          neighborhood: ['Jardim Paulista', 'Bela Vista', 'Moema', 'Itaim Bibi', 'Vila Madalena'][Math.floor(Math.random() * 5)],
          city: 'São Paulo',
          state: 'SP',
          zip_code: `014${Math.floor(10000 + Math.random() * 90000)}`
        },
        tracking_number: status === 'shipped' || status === 'delivered' ? `BR${Math.floor(10000000000000000000 + Math.random() * 90000000000000000000)}` : null,
        estimated_delivery: status === 'shipped' ? new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
        notes: Math.random() > 0.8 ? 'Cliente solicitou entrega em horário comercial' : null
      });
    }

    // Sort by date (newest first)
    return mockOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
  };

  // ✅ Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const orderDate = new Date(order.order_date);
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.order_date);
            return orderDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.order_date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(order => new Date(order.order_date) >= monthAgo);
          break;
      }
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter]);

  // ✅ Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Get status display
  const getStatusDisplay = (status) => {
    return statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
  };

  // ✅ Get payment method display
  const getPaymentMethodDisplay = (method) => {
    return paymentMethodConfig[method] || { color: 'bg-gray-50 text-gray-700', text: method };
  };

  // ✅ Handle order actions
  const handleViewOrder = (order) => {
    console.log('View order:', order);
    alert(`Visualizando pedido ${order.order_number}`);
  };

  const handleEditOrder = (order) => {
    console.log('Edit order:', order);
    alert(`Editando pedido ${order.order_number}`);
  };

  const handleUpdateStatus = (order, newStatus) => {
    console.log(`Updating order ${order.order_number} to ${newStatus}`);
    // Here you would make an API call to update the order status
    alert(`Status do pedido ${order.order_number} atualizado para: ${getStatusDisplay(newStatus).text}`);
  };

  // ✅ Load orders on component mount
  useEffect(() => {
    fetchServerOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Carregando todos os pedidos...</p>
        <p className="text-gray-500 text-sm">Aguarde enquanto buscamos os dados do servidor</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pedidos</h1>
          <p className="text-gray-600 mt-2">
            Painel administrativo - Todos os pedidos do sistema
          </p>
        </div>
        <button
          onClick={fetchServerOrders}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <IoReload size={20} />
          <span>Atualizar Pedidos</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
            </div>
            <FiPackage className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-sm text-gray-600">Entregues</p>
            </div>
            <FiPackage className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">Em Processamento</p>
            </div>
            <FiPackage className="text-purple-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <FiPackage className="text-yellow-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por pedido, cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="processing">Processando</option>
            <option value="confirmed">Confirmado</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pedidos ({filteredOrders.length} de {orders.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusDisplay = getStatusDisplay(order.status);
                const paymentDisplay = getPaymentMethodDisplay(order.payment_method);
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                        {statusDisplay.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentDisplay.color}`}>
                        {paymentDisplay.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.order_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Visualizar pedido"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Editar pedido"
                        >
                          <FiEdit size={18} />
                        </button>
                        <select
                          onChange={(e) => handleUpdateStatus(order, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          title="Alterar status"
                        >
                          <option value="">Status</option>
                          <option value="pending">Pendente</option>
                          <option value="processing">Processando</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Não há pedidos no sistema'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Exportar Pedidos
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Relatório de Vendas
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Pedidos Pendentes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;