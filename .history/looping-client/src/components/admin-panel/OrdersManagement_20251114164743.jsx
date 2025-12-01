// src/components/admin/OrdersManagement.jsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiShoppingBag, FiEye, FiEdit, FiTrash2, FiRefreshCw, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from "react-icons/fi";

const OrdersManagement = () => {
  const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // ✅ Fetch all orders from server
  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching all orders from server...');
      
      // Try multiple possible endpoints
      const endpoints = [
        'http://localhost:8000/api/admin/orders',
        'http://localhost:8000/api/orders',
        'http://localhost:8000/orders'
      ];

      let ordersData = [];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          const response = await fetch(endpoint, {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          console.log(`📡 Response status for ${endpoint}:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ORDERS LOADED from ${endpoint}:`, data);
            
            // Handle different response formats
            if (Array.isArray(data)) {
              ordersData = data;
            } else if (data.orders && Array.isArray(data.orders)) {
              ordersData = data.orders;
            } else if (data.data && Array.isArray(data.data)) {
              ordersData = data.data;
            } else {
              ordersData = [];
            }
            
            break;
          }
        } catch (err) {
          console.log(`❌ Endpoint ${endpoint} error:`, err.message);
          continue;
        }
      }

      if (ordersData.length === 0) {
        console.log("⚠️ No orders found from APIs, using mock data from localStorage");
        ordersData = getOrdersFromLocalStorage();
      }

      setOrders(ordersData);
      
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      const localStorageOrders = getOrdersFromLocalStorage();
      setOrders(localStorageOrders);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get orders from localStorage (from your checkout system)
  const getOrdersFromLocalStorage = () => {
    try {
      // Check for orders in localStorage that your checkout system might have saved
      const savedOrders = localStorage.getItem('finito_orders');
      const checkoutOrders = localStorage.getItem('checkout_orders');
      const recentOrders = localStorage.getItem('recent_orders');
      
      let orders = [];
      
      // Try to parse different possible storage keys
      if (savedOrders) {
        orders = JSON.parse(savedOrders);
      } else if (checkoutOrders) {
        orders = JSON.parse(checkoutOrders);
      } else if (recentOrders) {
        orders = JSON.parse(recentOrders);
      } else {
        // Generate mock orders based on your checkout system structure
        orders = generateMockOrdersFromCheckout();
      }
      
      console.log(`📦 Found ${orders.length} orders in localStorage`);
      return Array.isArray(orders) ? orders : [orders];
    } catch (error) {
      console.error('Error reading orders from localStorage:', error);
      return generateMockOrdersFromCheckout();
    }
  };

  // ✅ Generate mock orders based on your checkout system structure
  const generateMockOrdersFromCheckout = () => {
    const mockOrders = [];
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const paymentMethods = ["pix", "credit_card", "debit_card", "boleto"];
    const products = [
      "Camiseta Finito Basic", 
      "Boné Finito Premium", 
      "Caneca Finito Ceramic", 
      "Moletom Finito Hoodie", 
      "Calça Finito Jogger"
    ];

    // Generate 15-20 mock orders
    const orderCount = Math.floor(Math.random() * 6) + 15;

    for (let i = 1; i <= orderCount; i++) {
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = [49.90, 79.90, 129.90, 89.90, 159.90][Math.floor(Math.random() * 5)];
      const total = price * quantity;
      
      const order = {
        id: `order_${Date.now()}_${i}`,
        order_number: `#FIN-${1000 + i}`,
        orderId: `#FIN-${1000 + i}`,
        customer: `Customer ${i}`,
        email: `customer${i}@email.com`,
        product: product,
        quantity: quantity,
        total: total,
        subtotal: total,
        shipping: 15.90,
        discount: Math.random() > 0.7 ? total * 0.1 : 0,
        payment: paymentMethod,
        payment_method: paymentMethod,
        status: status,
        created_at: orderDate.toISOString(),
        date: orderDate.toLocaleDateString('pt-BR'),
        shipping_address: {
          street: `Rua ${i} de Abril`,
          number: Math.floor(100 + Math.random() * 900),
          city: "São Paulo",
          state: "SP",
          zip_code: `0100${Math.floor(1000 + Math.random() * 9000)}`
        },
        customer_name: `Customer ${i}`,
        customer_email: `customer${i}@email.com`,
        items: [
          {
            product_name: product,
            quantity: quantity,
            price: price,
            total: total
          }
        ]
      };

      mockOrders.push(order);
    }

    // Sort by date (newest first)
    return mockOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // ✅ Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      
      // Update locally first for immediate feedback
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId || order.id === orderId 
            ? { ...order, status: newStatus } 
            : order
        )
      );

      // Try to update on server
      try {
        const response = await fetch(`http://localhost:8000/api/admin/orders/${orderId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
          console.log(`✅ Order ${orderId} status updated on server`);
        } else {
          console.log(`⚠️ Could not update order on server, using local update`);
        }
      } catch (serverError) {
        console.log(`⚠️ Server update failed, using local update:`, serverError);
      }

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
    if (window.confirm("Are you sure you want to cancel this order?")) {
      updateOrderStatus(orderId, "cancelled");
    }
  };

  // ✅ Get status display text
  const getStatusText = (status) => {
    const statusMap = {
      "pending": "Pendente",
      "processing": "Em Preparação", 
      "shipped": "Enviado",
      "delivered": "Entregue",
      "cancelled": "Cancelado",
      "Pendente": "Pendente",
      "Em Preparação": "Em Preparação",
      "Enviado": "Enviado", 
      "Entregue": "Entregue",
      "Cancelado": "Cancelado"
    };
    return statusMap[status] || status;
  };

  // ✅ Get payment method display text
  const getPaymentText = (payment) => {
    const paymentMap = {
      "pix": "PIX",
      "credit_card": "Cartão de Crédito",
      "debit_card": "Cartão de Débito", 
      "boleto": "Boleto",
      "credit": "Cartão de Crédito",
      "debit": "Cartão de Débito"
    };
    return paymentMap[payment] || payment;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Enviado": 
      case "shipped":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Em Preparação": 
      case "processing":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pendente": 
      case "pending":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Entregue": 
      case "delivered":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Cancelado":
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default: 
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentColor = (payment) => {
    switch (payment) {
      case "Cartão de Crédito": 
      case "credit_card":
      case "credit":
        return "bg-green-100 text-green-800";
      case "PIX": 
      case "pix":
        return "bg-blue-100 text-blue-800";
      case "Boleto": 
      case "boleto":
        return "bg-purple-100 text-purple-800";
      case "Cartão de Débito":
      case "debit_card": 
      case "debit":
        return "bg-orange-100 text-orange-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Filter orders based on search
  const filteredOrders = orders.filter(order =>
    order.orderId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.product?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    getStatusText(order.status).toLowerCase().includes(orderSearch.toLowerCase())
  );

  // ✅ Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Order Management</h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              disabled
              className="w-full p-2 pl-10 border border-gray-300 rounded text-gray-400 bg-gray-100"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
          <p className="text-gray-500 text-sm">Fetching data from server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header with Search and Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Order Management</h2>
          <p className="text-gray-600 text-sm mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'Calibri, sans-serif' }}
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
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId || order.order_number}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customer || order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.email || order.customer_email}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date || new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    R$ {order.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(order.payment)}`}>
                      {getPaymentText(order.payment)}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId || order.id, e.target.value)}
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
                      title="View Details"
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      onClick={() => cancelOrder(order.orderId || order.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Cancel Order"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">
              {orderSearch ? 'Try adjusting your search terms' : 'No orders in the system yet'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Order Details</h3>
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
                  <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                  <p><strong>Order ID:</strong> {selectedOrder.orderId || selectedOrder.order_number}</p>
                  <p><strong>Date:</strong> {selectedOrder.date || new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span></p>
                  <p><strong>Total:</strong> R$ {selectedOrder.total?.toFixed(2)}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customer || selectedOrder.customer_name}</p>
                  <p><strong>Email:</strong> {selectedOrder.email || selectedOrder.customer_email}</p>
                  <p><strong>Payment:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getPaymentColor(selectedOrder.payment)}`}>
                    {getPaymentText(selectedOrder.payment)}
                  </span></p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Items</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity} × R$ {item.price?.toFixed(2)}</p>
                    </div>
                    <p className="font-semibold">R$ {item.total?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {selectedOrder.shipping_address && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                  <p>{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}</p>
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
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