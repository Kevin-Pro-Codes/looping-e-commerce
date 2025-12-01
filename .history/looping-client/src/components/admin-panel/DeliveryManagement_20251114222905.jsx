// src/components/admin/DeliveryManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiTruck, FiClock, FiRefreshCw, FiCheckCircle,
  FiMapPin
} from "react-icons/fi";

const DeliveryManagement = () => {
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch orders from checkout system JSON storage (same as OrdersManagement)
  const fetchOrdersFromCheckout = () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching orders from checkout system JSON for deliveries...');
      
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
        key.startsWith('checkout_order_') ||
        key === 'checkout_recent_orders'
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

      console.log(`📦 Processed ${uniqueOrders.length} orders for delivery management`);
      
      // Transform orders into delivery format
      const deliveryOrders = uniqueOrders.map((order, index) => {
        const shipping = order.shipping_address || {};
        const payment = order.payment || {};
        
        // Use the same order ID format as OrdersManagement
        const orderId = order.orderId || order.order_number || `LOOP-${1000 + index}`;
        
        // Determine delivery status based on order status
        let status = "Em Preparação";
        if (order.status === "shipped" || order.status === "Enviado") {
          status = "Enviado";
        }
        if (order.status === "delivered" || order.status === "Entregue") {
          status = "Entregue";
        }
        if (order.status === "pending" || order.status === "Pendente") {
          status = "Pendente";
        }
        
        // Get product info from order items
        const firstItem = order.items && order.items.length > 0 ? order.items[0] : {};
        const productName = firstItem.product_name || firstItem.name || "Produto";
        const quantity = firstItem.quantity || 1;
        const price = order.total || firstItem.price || 0;
        
        // Generate tracking number if not present
        const tracking = order.tracking_number || `BR${Math.random().toString().slice(2, 11)}`;
        
        // Generate dates
        const orderDate = new Date(order.created_at || Date.now());
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(orderDate.getDate() + 7);
        
        // Set shipped and delivery dates based on status
        let shippedDate = "";
        let deliveryDate = "";
        
        if (status === "Enviado" || status === "Entregue") {
          shippedDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
        if (status === "Entregue") {
          deliveryDate = new Date(orderDate.getTime() + 72 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
        
        return {
          id: order.id || `delivery_${index + 1}`,
          orderId: orderId, // ✅ Same ID as OrdersManagement
          customer: order.customer_name || order.customer || "Cliente",
          product: productName,
          quantity: quantity,
          price: price,
          city: `${shipping?.city || ''}, ${shipping?.state || ''}`,
          address: `${shipping?.street || ''}, ${shipping?.number || ''}${shipping?.complement ? ` - ${shipping.complement}` : ''} - ${shipping?.neighborhood || ''} - ${shipping?.city || ''}, ${shipping?.state || ''} - ${shipping?.zip_code || ''}`,
          status: status,
          tracking: tracking,
          carrier: order.carrier || "Correios",
          estimatedDelivery: estimatedDate.toISOString().split('T')[0],
          shippedDate: shippedDate,
          deliveryDate: deliveryDate,
          notes: "Aguardando processamento",
          isTracked: false,
          // Keep original order reference
          originalOrder: order
        };
      });
      
      setDeliveries(deliveryOrders);
      
    } catch (error) {
      console.error("❌ Error fetching orders for delivery management:", error);
      // Fallback to sample data with same ID format
      const fallbackDeliveries = generateSampleDeliveries();
      setDeliveries(fallbackDeliveries);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Normalize checkout order data (same as OrdersManagement)
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

      // Generate LOOP- order number (same as OrdersManagement)
      const orderNumber = order.order_number || order.id ? `LOOP-${order.id.replace('order_', '').substring(0, 8)}` : `LOOP-${Date.now().toString().slice(-6)}`;

      const normalizedItems = items.map(item => {
        const quantity = item.quantity || 1;
        const price = item.price || item.unit_price || 0;
        const total = item.total || item.total_price || (price * quantity);
        
        return {
          product_name: item.name || item.product_name || 'Produto',
          quantity: quantity,
          price: price,
          total: total
        };
      });

      return {
        id: order.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order_number: orderNumber,
        orderId: orderNumber, // ✅ This is the key field for matching
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
        items: normalizedItems,
        source: sourceKey,
        metadata: order.metadata || {}
      };
    } catch (error) {
      console.log('❌ Error normalizing order:', error);
      return null;
    }
  };

  // ✅ Generate sample deliveries with same ID format
  const generateSampleDeliveries = () => {
    return [
      { 
        id: 1, 
        orderId: "LOOP-1001", // ✅ Same format as OrdersManagement
        customer: "Maria Santos", 
        product: "Boné Finito", 
        quantity: 1,
        price: 45.00, 
        city: "Rio de Janeiro, RJ", 
        address: "Av. Copacabana, 456 - Rio de Janeiro, RJ",
        status: "Enviado", 
        tracking: "BR123456789",
        carrier: "Correios",
        estimatedDelivery: "2024-01-20",
        shippedDate: "2024-01-14",
        deliveryDate: "",
        notes: "Entregue na portaria",
        isTracked: false
      },
      { 
        id: 2, 
        orderId: "LOOP-1002", // ✅ Same format as OrdersManagement
        customer: "João Silva", 
        product: "Camiseta Finito", 
        quantity: 2,
        price: 89.90, 
        city: "São Paulo, SP", 
        address: "Rua das Flores, 123 - São Paulo, SP",
        status: "Em Preparação", 
        tracking: "Preparando envio",
        carrier: "Loggi",
        estimatedDelivery: "2024-01-18",
        shippedDate: "",
        deliveryDate: "",
        notes: "Aguardando confirmação de pagamento",
        isTracked: false
      },
      { 
        id: 3, 
        orderId: "LOOP-1003", // ✅ Same format as OrdersManagement
        customer: "Ana Oliveira", 
        product: "Moletom Finito", 
        quantity: 1,
        price: 120.00, 
        city: "Curitiba, PR", 
        address: "Rua XV de Novembro, 789 - Curitiba, PR",
        status: "Entregue", 
        tracking: "BR987654321",
        carrier: "Jadlog",
        estimatedDelivery: "2024-01-16",
        shippedDate: "2024-01-12",
        deliveryDate: "2024-01-15",
        notes: "Assinatura digital confirmada",
        isTracked: true
      }
    ];
  };

  // Refresh delivery data
  const refreshDeliveries = () => {
    fetchOrdersFromCheckout();
  };

  // Load deliveries on component mount
  useEffect(() => {
    fetchOrdersFromCheckout();
  }, []);

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "Entregue": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Enviado": return "bg-green-100 text-green-800 border border-green-200";
      case "Em Preparação": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pendente": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getTrackButtonColor = (delivery) => {
    return delivery.isTracked 
      ? 'bg-green-500 hover:bg-green-600 text-white border border-green-600' 
      : 'bg-red-500 hover:bg-red-600 text-white border border-red-600';
  };

  const handleTrackClick = (deliveryId) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId 
        ? { ...delivery, isTracked: true }
        : delivery
    ));
    
    const delivery = deliveries.find(d => d.id === deliveryId);
    alert(`📦 Tracking delivery ${deliveryId}\nOrder: ${delivery?.orderId}\nCarrier: ${delivery?.carrier}\nTracking: ${delivery?.tracking}`);
  };

  const updateDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === deliveryId ? { 
        ...delivery, 
        status: newStatus,
        ...(newStatus === "Enviado" && !delivery.shippedDate && { shippedDate: new Date().toISOString().split('T')[0] }),
        ...(newStatus === "Entregue" && !delivery.deliveryDate && { deliveryDate: new Date().toISOString().split('T')[0] })
      } : delivery
    ));
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.orderId?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customer?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.product?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.status?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.tracking?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.address?.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Delivery Management</h2>
          <button
            onClick={refreshDeliveries}
            className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search deliveries..."
            value={deliverySearch}
            onChange={(e) => setDeliverySearch(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900">{deliveries.length}</p>
            </div>
            <FiTruck className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Pendente" || d.status === "Em Preparação").length}
              </p>
            </div>
            <FiClock className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Enviado").length}
              </p>
            </div>
            <FiRefreshCw className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">
                {deliveries.filter(d => d.status === "Entregue").length}
              </p>
            </div>
            <FiCheckCircle className="text-2xl text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Address</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier & Tracking</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                    <div className="text-sm text-gray-500">R$ {delivery.price.toFixed(2)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">{delivery.city}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={delivery.address}>
                      {delivery.address}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">{delivery.product}</div>
                    <div className="text-sm text-gray-500">Qty: {delivery.quantity}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.carrier}</div>
                    <div className="text-sm text-gray-500">{delivery.tracking}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {delivery.shippedDate && `Shipped: ${delivery.shippedDate}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {delivery.estimatedDelivery && `Est: ${delivery.estimatedDelivery}`}
                    </div>
                    {delivery.deliveryDate && (
                      <div className="text-sm text-green-600">Delivered: {delivery.deliveryDate}</div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select 
                      value={delivery.status}
                      onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getDeliveryStatusColor(delivery.status)}`}
                    >
                      <option value="Pendente">Pending</option>
                      <option value="Em Preparação">Processing</option>
                      <option value="Enviado">Shipped</option>
                      <option value="Entregue">Delivered</option>
                    </select>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleTrackClick(delivery.id)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${getTrackButtonColor(delivery)}`}
                      >
                        <FiMapPin size={14} />
                        Track
                      </button>
                      <button 
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 transition-all"
                      >
                        <FiCheckCircle size={14} />
                        Label
                      </button>
                      <button 
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all"
                      >
                        Notify
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg border">
          <FiTruck className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No deliveries found</h3>
          <p className="text-gray-600">
            {deliverySearch ? 'Try adjusting your search terms' : 'No delivery orders available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;