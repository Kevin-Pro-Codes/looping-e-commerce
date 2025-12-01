import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiRefreshCw, FiPackage, FiXCircle, FiUser, FiMapPin, FiDollarSign, FiCreditCard } from "react-icons/fi";
import { SiPix } from "react-icons/si";

const OrdersManagement = () => {
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // ✅ Debug function to check localStorage contents
  const debugLocalStorage = () => {
    const allKeys = Object.keys(localStorage);
    console.log('🔍 All localStorage keys:', allKeys);
    
    const checkoutKeys = allKeys.filter(key => 
      key.includes('order') || key.includes('checkout')
    );
    
    console.log('📋 Checkout-related keys:', checkoutKeys);
    
    checkoutKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        console.log(`📦 ${key}:`, data);
      } catch (e) {
        console.log(`❌ ${key}: Not valid JSON`);
      }
    });
  };

  // ✅ Fetch orders from checkout system JSON storage
  const fetchOrdersFromCheckout = () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching orders from checkout system JSON...');
      
      // Get all localStorage keys that might contain checkout order data
      const allKeys = Object.keys(localStorage);
      const checkoutKeys = allKeys.filter(key => 
        key.includes('order') || 
        key.includes('checkout') || 
        key.includes('payment') ||
        key.includes('cart') ||
        key.includes('completed') ||
        key.includes('recent') ||
        key.includes('pix') ||
        key.includes('boleto') ||
        key.startsWith('checkout_order_') || // ADDED: New checkout order keys
        key === 'checkout_recent_orders'     // ADDED: Recent orders list
      );

      console.log('📋 Found checkout-related keys:', checkoutKeys);

      let allOrders = [];

      // Parse each potential checkout storage
      checkoutKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            
            // Handle the JSON structure from your checkout system
            if (data && data.order) {
              // Direct order structure from checkout
              const normalizedOrder = normalizeCheckoutOrder(data.order, key);
              if (normalizedOrder) allOrders.push(normalizedOrder);
            } else if (Array.isArray(data)) {
              // Array of orders (like checkout_recent_orders)
              data.forEach(orderData => {
                if (orderData.order) {
                  const normalizedOrder = normalizeCheckoutOrder(orderData.order, key);
                  if (normalizedOrder) allOrders.push(normalizedOrder);
                } else {
                  const normalizedOrder = normalizeCheckoutOrder(orderData, key);
                  if (normalizedOrder) allOrders.push(normalizedOrder);
                }
              });
            } else if (data && typeof data === 'object') {
              // Single order object
              const normalizedOrder = normalizeCheckoutOrder(data, key);
              if (normalizedOrder) allOrders.push(normalizedOrder);
            }
          }
        } catch (error) {
          console.log(`❌ Could not parse data from key ${key}:`, error);
        }
      });

      // Remove duplicates and sort by date
      const uniqueOrders = allOrders
        .filter((order, index, self) => index === self.findIndex(o => o.id === order.id))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      console.log(`📦 Processed ${uniqueOrders.length} orders from checkout system`);
      setOrders(uniqueOrders);
      
    } catch (error) {
      console.error("❌ Error fetching orders from checkout system:", error);
      // Fallback to any existing orders in localStorage
      const fallbackOrders = getFallbackOrders();
      setOrders(fallbackOrders);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Normalize checkout order data to consistent format
  const normalizeCheckoutOrder = (orderData, sourceKey) => {
    if (!orderData) return null;

    try {
      // Extract data from your checkout JSON structure
      const order = orderData.order || orderData;
      const customer = order.customer || orderData.customerData || {};
      const shipping = order.shipping_address || order.shippingData || order.shipping || {};
      const payment = order.payment || orderData.payment || {};
      const items = order.items || orderData.items || [];
      const totals = order.totals || {};

      // Generate LOOP- order number
      const orderNumber = order.order_number || order.id ? `LOOP-${order.id.replace('order_', '').substring(0, 8)}` : `LOOP-${Date.now().toString().slice(-6)}`;

      return {
        id: order.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_number: orderNumber,
        orderId: orderNumber,
        customer: customer.name || 'Cliente',
        customer_name: customer.name || 'Cliente',
        email: customer.email || 'cliente@email.com',
        customer_email: customer.email || 'cliente@email.com',
        phone: customer.phone || '',
        cpf: customer.cpf || '',
        total: order.total || totals.total || payment.amount || 0,
        subtotal: order.subtotal || totals.subtotal || 0,
        shipping: order.shipping || totals.shipping || 0,
        discount: order.discount || totals.discount || 0,
        payment: payment.method || 'pix',
        payment_method: payment.method || 'pix',
        payment_status: payment.status || 'paid',
        status: order.status || 'pending',
        created_at: order.created_at || new Date().toISOString(),
        date: order.date || new Date(order.created_at || Date.now()).toLocaleDateString('pt-BR'),
        shipping_address: {
          street: shipping.street || '',
          number: shipping.number || '',
          complement: shipping.complement || '',
          neighborhood: shipping.neighborhood || shipping.hood || '',
          city: shipping.city || '',
          state: shipping.state || '',
          zip_code: shipping.zip_code || shipping.cep || ''
        },
        items: items.map(item => ({
          product_name: item.name || item.product_name || 'Produto',
          quantity: item.quantity || 1,
          price: item.price || item.unit_price || 0,
          total: item.total || (item.price || 0) * (item.quantity || 1)
        })),
        // PIX specific data
        pix_data: payment.pix_data || null,
        // Additional metadata
        source: sourceKey,
        metadata: order.metadata || {}
      };
    } catch (error) {
      console.log('❌ Error normalizing order:', error);
      return null;
    }
  };

  // ✅ Fallback to any existing orders
  const getFallbackOrders = () => {
    try {
      // Try to find any order data in localStorage
      const allKeys = Object.keys(localStorage);
      const orders = [];

      allKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item && item.includes('order')) {
            const data = JSON.parse(item);
            if (data && (data.order || data.id)) {
              const order = normalizeCheckoutOrder(data, key);
              if (order) orders.push(order);
            }
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      return orders.length > 0 ? orders : generateSampleCheckoutOrders();
    } catch (error) {
      return generateSampleCheckoutOrders();
    }
  };

  // ✅ Generate sample orders based on checkout structure
  const generateSampleCheckoutOrders = () => {
    const sampleOrders = [];
    const products = [
      "Camiseta Loop Basic", 
      "Boné Loop Premium", 
      "Caneca Loop Ceramic", 
      "Moletom Loop Hoodie", 
      "Calça Loop Jogger"
    ];

    // Create 3-5 sample orders
    const orderCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 1; i <= orderCount; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - i);
      
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      const price = [49.90, 79.90, 129.90, 89.90][Math.floor(Math.random() * 4)];
      const total = price * quantity;

      const order = {
        id: `order_${Date.now()}_${i}`,
        order_number: `LOOP-${1000 + i}`,
        orderId: `LOOP-${1000 + i}`,
        customer: `Cliente ${i}`,
        customer_name: `Cliente ${i}`,
        email: `cliente${i}@email.com`,
        customer_email: `cliente${i}@email.com`,
        total: total,
        subtotal: total,
        shipping: 15.90,
        discount: 0,
        payment: ['pix', 'credit_card', 'boleto'][Math.floor(Math.random() * 3)],
        payment_method: ['pix', 'credit_card', 'boleto'][Math.floor(Math.random() * 3)],
        status: ['pending', 'processing', 'shipped'][Math.floor(Math.random() * 3)],
        created_at: orderDate.toISOString(),
        date: orderDate.toLocaleDateString('pt-BR'),
        shipping_address: {
          street: `Rua das Flores ${i}`,
          number: `${100 + i}`,
          complement: i % 2 === 0 ? 'Apto 101' : '',
          neighborhood: 'Jardim Paulista',
          city: 'São Paulo',
          state: 'SP',
          zip_code: `0141${Math.floor(1000 + Math.random() * 9000)}`
        },
        items: [
          {
            product_name: product,
            quantity: quantity,
            price: price,
            total: total
          }
        ]
      };

      sampleOrders.push(order);
    }

    return sampleOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // ✅ Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      // Update locally
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // Update in localStorage if exists
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.order && data.order.id === orderId) {
              data.order.status = newStatus;
              localStorage.setItem(key, JSON.stringify(data));
              console.log(`✅ Updated order ${orderId} in localStorage`);
            }
          }
        } catch (e) {
          // Skip invalid items
        }
      });

    } catch (error) {
      console.error("❌ Error updating order status:", error);
    }
  };

  // ✅ View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // ✅ Cancel order
  const cancelOrder = (orderId) => {
    if (window.confirm("Tem certeza que deseja cancelar este pedido?")) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  // ✅ Status and payment helpers
  const getStatusText = (status) => {
    const statusMap = {
      "pending": "Pendente",
      "processing": "Em Preparação", 
      "shipped": "Enviado",
      "delivered": "Entregue",
      "cancelled": "Cancelado"
    };
    return statusMap[status] || status;
  };

  const getPaymentText = (payment) => {
    const paymentMap = {
      "pix": "PIX",
      "credit_card": "Cartão de Crédito",
      "credit": "Cartão de Crédito",
      "debit_card": "Cartão de Débito", 
      "debit": "Cartão de Débito",
      "boleto": "Boleto"
    };
    return paymentMap[payment] || payment;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "shipped": return "bg-green-100 text-green-800 border border-green-200";
      case "processing": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "pending": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "delivered": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "cancelled": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentColor = (payment) => {
    switch (payment) {
      case "credit_card":
      case "credit": return "bg-green-100 text-green-800";
      case "pix": return "bg-blue-100 text-blue-800";
      case "boleto": return "bg-purple-100 text-purple-800";
      case "debit_card":
      case "debit": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Filter orders
  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase()) ||
    getPaymentText(order.payment).toLowerCase().includes(orderSearch.toLowerCase())
  );

  // ✅ Load orders on component mount
  useEffect(() => {
    fetchOrdersFromCheckout();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar pedidos..."
              disabled
              className="w-full p-2 pl-10 border border-gray-300 rounded text-gray-400 bg-gray-100"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
          <p className="text-gray-500 text-sm">Buscando dados do sistema de checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Gerenciamento de Pedidos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'} encontrados
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrdersFromCheckout}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={16} />
            Atualizar
          </button>

          <button
            onClick={debugLocalStorage}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Debug Storage
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

      {/* Orders Table */}
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
                    {order.orderId}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    rrR$ {order.total?.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment)}`}>
                      {getPaymentText(order.payment)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={order.status}
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
                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded transition-colors"
                      title="Ver Detalhes"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      onClick={() => cancelOrder(order.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Cancelar Pedido"
                    >
                      <FiXCircle size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">
              {orderSearch ? 'Tente ajustar os termos de busca' : 'Nenhum pedido no sistema ainda'}
            </p>
            <button
              onClick={debugLocalStorage}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Verificar dados no localStorage
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Pedido</h4>
                  <p><strong>Número:</strong> {selectedOrder.orderId}</p>
                  <p><strong>Data:</strong> {selectedOrder.date}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></p>
                  <p><strong>Total:</strong> R$ {selectedOrder.total?.toFixed(2)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informações do Cliente</h4>
                  <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                  <p><strong>Telefone:</strong> {selectedOrder.phone || 'Não informado'}</p>
                  <p><strong>CPF:</strong> {selectedOrder.cpf || 'Não informado'}</p>
                  <p><strong>Pagamento:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.payment)}`}>
                    {getPaymentText(selectedOrder.payment)}
                  </span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Itens do Pedido</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Quantidade: {item.quantity} × R$ {item.price?.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold">R$ {item.total?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Endereço de Entrega</h4>
                  <p>{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}</p>
                  {selectedOrder.shipping_address.complement && <p>Complemento: {selectedOrder.shipping_address.complement}</p>}
                  <p>Bairro: {selectedOrder.shipping_address.neighborhood}</p>
                  <p>{selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.state}</p>
                  <p>CEP: {selectedOrder.shipping_address.zip_code}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;