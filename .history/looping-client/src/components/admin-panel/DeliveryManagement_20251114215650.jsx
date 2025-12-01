// src/components/admin/DeliveryManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiTruck, FiClock, FiRefreshCw, FiCheckCircle,
  FiAlertTriangle, FiAlertOctagon, FiMapPin, FiMessageSquare
} from "react-icons/fi";

const DeliveryManagement = () => {
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({});

  // Fetch orders from localStorage
  const fetchOrdersFromStorage = () => {
    try {
      setLoading(true);
      
      // Get recent orders from localStorage
      const recentOrdersKey = 'checkout_recent_orders';
      const storedOrders = JSON.parse(localStorage.getItem(recentOrdersKey) || '[]');
      
      console.log('📦 Found orders in storage:', storedOrders.length);
      
      // Transform stored orders into delivery format
      const deliveryOrders = storedOrders.map((orderData, index) => {
        const order = orderData.order;
        const shipping = order.shipping_address;
        const payment = order.payment;
        
        // Generate a realistic order ID if not present
        const orderId = order.id || `#ORD-${String(index + 1).padStart(3, '0')}`;
        
        // Determine status based on payment status and order data
        let status = "Em Preparação";
        if (payment.status === "paid" || payment.status === "completed") {
          status = "Enviado";
        }
        if (order.status === "delivered" || order.status === "completed") {
          status = "Entregue";
        }
        
        // Get product info from order items
        const firstItem = order.items && order.items.length > 0 ? order.items[0] : {};
        const productName = firstItem.name || "Produto";
        const quantity = firstItem.quantity || 1;
        const price = firstItem.unit_price || order.totals?.total || 0;
        
        // Generate tracking number if not present
        const tracking = order.tracking_number || `BR${Math.random().toString().slice(2, 11)}`;
        
        // Generate estimated delivery date
        const orderDate = new Date(order.created_at);
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(orderDate.getDate() + 7); // +7 days from order
        
        return {
          id: index + 1,
          orderId: orderId,
          customer: order.customer?.name || "Cliente",
          product: productName,
          quantity: quantity,
          price: price,
          city: `${shipping?.city || ''}, ${shipping?.state || ''}`,
          address: `${shipping?.street || ''}, ${shipping?.number || ''}${shipping?.complement ? ` - ${shipping.complement}` : ''} - ${shipping?.neighborhood || ''} - ${shipping?.city || ''}, ${shipping?.state || ''} - ${shipping?.zip_code || ''}`,
          status: status,
          tracking: tracking,
          carrier: order.shipping_method?.company || "Correios",
          estimatedDelivery: estimatedDate.toISOString().split('T')[0],
          shippedDate: status === "Enviado" || status === "Entregue" ? 
            new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : "",
          deliveryDate: status === "Entregue" ? 
            new Date(orderDate.getTime() + 72 * 60 * 60 * 1000).toISOString().split('T')[0] : "",
          notes: order.shipping_method?.description || "Aguardando processamento",
          // Add priority/urgency indicator
          priority: Math.random() > 0.7 ? "high" : Math.random() > 0.5 ? "medium" : "low"
        };
      });
      
      // If no orders in storage, use sample data
      if (deliveryOrders.length === 0) {
        console.log('📝 Using sample delivery data');
        setDeliveries([
          { 
            id: 1, 
            orderId: "#ORD-002", 
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
            priority: "low"
          },
          { 
            id: 2, 
            orderId: "#ORD-001", 
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
            priority: "high"
          },
          { 
            id: 3, 
            orderId: "#ORD-004", 
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
            priority: "medium"
          }
        ]);
      } else {
        setDeliveries(deliveryOrders);
      }
      
    } catch (error) {
      console.error('❌ Error fetching orders from storage:', error);
      // Fallback to sample data
      setDeliveries([
        { 
          id: 1, 
          orderId: "#ORD-002", 
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
          priority: "low"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh delivery data
  const refreshDeliveries = () => {
    fetchOrdersFromStorage();
  };

  // Load deliveries on component mount
  useEffect(() => {
    fetchOrdersFromStorage();
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

  const getActionColor = (deliveryId, actionType) => {
    const status = actionStatus[`${deliveryId}-${actionType}`] || 'default';
    
    switch (status) {
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'default':
      default:
        // Color based on delivery priority and type
        const delivery = deliveries.find(d => d.id === deliveryId);
        if (delivery) {
          if (actionType === 'track') {
            return delivery.priority === 'high' 
              ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
              : delivery.priority === 'medium'
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300'
              : 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300';
          } else if (actionType === 'label') {
            return delivery.status === "Entregue"
              ? 'bg-green-100 hover:bg-green-200 text-green-700 border border-green-300'
              : delivery.status === "Enviado"
              ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700 border border-yellow-300'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300';
          } else if (actionType === 'notify') {
            return delivery.priority === 'high'
              ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300';
          }
        }
        return 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300';
    }
  };

  const getActionIcon = (actionType, deliveryId) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    
    switch (actionType) {
      case 'track':
        return delivery?.priority === 'high' ? <FiAlertOctagon size={14} /> : <FiMapPin size={14} />;
      case 'label':
        return <FiCheckCircle size={14} />;
      case 'notify':
        return delivery?.priority === 'high' ? <FiAlertTriangle size={14} /> : <FiMessageSquare size={14} />;
      default:
        return null;
    }
  };

  const handleActionClick = (deliveryId, actionType) => {
    const key = `${deliveryId}-${actionType}`;
    
    // Simulate different action states
    let newStatus = 'default';
    
    switch (actionType) {
      case 'track':
        newStatus = 'success';
        alert(`📦 Tracking delivery ${deliveryId}. Status: ${deliveries.find(d => d.id === deliveryId)?.status}`);
        break;
      case 'label':
        newStatus = 'warning';
        alert(`🏷️ Generating shipping label for delivery ${deliveryId}`);
        break;
      case 'notify':
        newStatus = 'danger';
        alert(`📢 Sending notification for delivery ${deliveryId}`);
        break;
      default:
        newStatus = 'default';
    }
    
    setActionStatus(prev => ({
      ...prev,
      [key]: newStatus
    }));
    
    // Reset to default after 2 seconds
    setTimeout(() => {
      setActionStatus(prev => ({
        ...prev,
        [key]: 'default'
      }));
    }, 2000);
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
    delivery.orderId.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customer.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.product.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.status.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.tracking.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.address.toLowerCase().includes(deliverySearch.toLowerCase())
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

      {/* Priority Legend */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Priority Legend:</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">High Priority (Red)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Medium Priority (Yellow)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Low Priority (Green)</span>
          </div>
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
                        onClick={() => handleActionClick(delivery.id, 'track')}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${getActionColor(delivery.id, 'track')}`}
                      >
                        {getActionIcon('track', delivery.id)}
                        Track
                      </button>
                      <button 
                        onClick={() => handleActionClick(delivery.id, 'label')}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${getActionColor(delivery.id, 'label')}`}
                      >
                        {getActionIcon('label', delivery.id)}
                        Label
                      </button>
                      <button 
                        onClick={() => handleActionClick(delivery.id, 'notify')}
                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${getActionColor(delivery.id, 'notify')}`}
                      >
                        {getActionIcon('notify', delivery.id)}
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