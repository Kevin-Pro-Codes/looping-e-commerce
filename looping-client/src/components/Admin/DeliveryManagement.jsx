// src/components/admin/DeliveryManagement.jsx
import React, { useState, useEffect } from "react";
import { 
  FiSearch, FiTruck, FiClock, FiRefreshCw, FiCheckCircle,
  FiMapPin, FiPackage, FiUser, FiCalendar
} from "react-icons/fi";

const DeliveryManagement = () => {
  const [deliverySearch, setDeliverySearch] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // ✅ API Configuration
  const API_BASE_URL = 'http://localhost:8000/api';
  const API_ENDPOINTS = {
    infos: `${API_BASE_URL}/infos`,
    updateStatus: (id) => `${API_BASE_URL}/infos/${id}/status`,
  };

  // ✅ Fetch orders from Laravel backend
  const fetchOrdersFromBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Fetching orders from Laravel backend...');
      
      const response = await fetch(API_ENDPOINTS.infos, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log(`📦 Fetched ${result.data.length} orders from backend`);
        
        // Transform backend data to delivery format
        const deliveryOrders = transformBackendDataToDeliveries(result.data);
        setDeliveries(deliveryOrders);
        setLastRefresh(new Date().toLocaleTimeString());
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
      
    } catch (error) {
      console.error("❌ Error fetching orders from backend:", error);
      setError(error.message);
      // Fallback to sample data
      const fallbackDeliveries = generateSampleDeliveries();
      setDeliveries(fallbackDeliveries);
      setLastRefresh(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  // ✅ Transform backend Info data to delivery format
  const transformBackendDataToDeliveries = (infos) => {
    return infos.map((info, index) => {
      // Determine delivery status based on order status
      let status = "Em Preparação";
      let statusColor = "yellow";
      
      switch (info.status) {
        case "pending":
          status = "Pendente";
          statusColor = "blue";
          break;
        case "processing":
          status = "Em Preparação";
          statusColor = "yellow";
          break;
        case "shipped":
          status = "Enviado";
          statusColor = "green";
          break;
        case "delivered":
          status = "Entregue";
          statusColor = "purple";
          break;
        case "cancelled":
          status = "Cancelado";
          statusColor = "red";
          break;
        default:
          status = "Em Preparação";
          statusColor = "yellow";
      }

      // Parse items if they're stored as JSON string
      let items = [];
      try {
        if (typeof info.items === 'string') {
          items = JSON.parse(info.items);
        } else if (Array.isArray(info.items)) {
          items = info.items;
        }
      } catch (e) {
        console.warn('Could not parse items:', e);
        items = [];
      }

      // Get first product info
      const firstItem = items.length > 0 ? items[0] : {};
      const productName = firstItem.product_name || firstItem.name || "Produto";
      const quantity = firstItem.quantity || 1;
      
      // Generate tracking number if not present
      const tracking = info.tracking_number || `BR${Math.random().toString().slice(2, 11)}`;
      
      // Calculate dates
      const orderDate = new Date(info.created_at || Date.now());
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

      // Determine carrier based on location or random
      const carriers = ["Correios", "Loggi", "Jadlog", "Azul Cargo", "DHL"];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];

      return {
        id: info.id,
        orderId: info.order_number || `ORD-${1000 + index}`,
        customer: info.customer_name || "Cliente",
        product: productName,
        quantity: quantity,
        price: parseFloat(info.total) || 0,
        city: `${info.shipping_city || ''}, ${info.shipping_state || ''}`,
        address: `${info.shipping_street || ''}, ${info.shipping_number || ''}${info.shipping_complement ? ` - ${info.shipping_complement}` : ''} - ${info.shipping_neighborhood || ''} - ${info.shipping_city || ''}, ${info.shipping_state || ''} - ${info.shipping_zip_code || ''}`,
        status: status,
        statusColor: statusColor,
        tracking: tracking,
        carrier: carrier,
        estimatedDelivery: estimatedDate.toISOString().split('T')[0],
        shippedDate: shippedDate,
        deliveryDate: deliveryDate,
        notes: getDeliveryNotes(status),
        isTracked: false,
        paymentStatus: info.payment_status || 'pending',
        // Keep original backend data
        originalInfo: info
      };
    });
  };

  // ✅ Get delivery notes based on status
  const getDeliveryNotes = (status) => {
    switch (status) {
      case "Pendente": return "Aguardando confirmação de pagamento";
      case "Em Preparação": return "Produto em separação no estoque";
      case "Enviado": return "Produto em trânsito com transportadora";
      case "Entregue": return "Entrega concluída com sucesso";
      case "Cancelado": return "Pedido cancelado";
      default: return "Aguardando processamento";
    }
  };

  // ✅ Update delivery status in backend
  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    try {
      // Map frontend status to backend status
      const statusMap = {
        "Pendente": "pending",
        "Em Preparação": "processing", 
        "Enviado": "shipped",
        "Entregue": "delivered",
        "Cancelado": "cancelled"
      };

      const backendStatus = statusMap[newStatus] || "processing";
      
      const response = await fetch(API_ENDPOINTS.updateStatus(deliveryId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          status: backendStatus,
          payment_status: 'paid' // You might want to handle this differently
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setDeliveries(deliveries.map(delivery => 
          delivery.id === deliveryId ? { 
            ...delivery, 
            status: newStatus,
            statusColor: getStatusColor(newStatus),
            ...(newStatus === "Enviado" && !delivery.shippedDate && { shippedDate: new Date().toISOString().split('T')[0] }),
            ...(newStatus === "Entregue" && !delivery.deliveryDate && { deliveryDate: new Date().toISOString().split('T')[0] }),
            notes: getDeliveryNotes(newStatus)
          } : delivery
        ));
        
        console.log(`✅ Delivery ${deliveryId} status updated to ${newStatus}`);
      } else {
        throw new Error(result.message || 'Failed to update status');
      }
      
    } catch (error) {
      console.error("❌ Error updating delivery status:", error);
      alert(`Erro ao atualizar status: ${error.message}`);
    }
  };

  // ✅ Generate sample deliveries (fallback)
  const generateSampleDeliveries = () => {
    return [
      { 
        id: 1, 
        orderId: "ORD-1001",
        customer: "Maria Santos", 
        product: "Boné Finito", 
        quantity: 1,
        price: 45.00, 
        city: "Rio de Janeiro, RJ", 
        address: "Av. Copacabana, 456 - Rio de Janeiro, RJ",
        status: "Enviado", 
        statusColor: "green",
        tracking: "BR123456789",
        carrier: "Correios",
        estimatedDelivery: "2024-01-20",
        shippedDate: "2024-01-14",
        deliveryDate: "",
        notes: "Entregue na portaria",
        isTracked: false,
        paymentStatus: "paid"
      },
      { 
        id: 2, 
        orderId: "ORD-1002",
        customer: "João Silva", 
        product: "Camiseta Finito", 
        quantity: 2,
        price: 89.90, 
        city: "São Paulo, SP", 
        address: "Rua das Flores, 123 - São Paulo, SP",
        status: "Em Preparação", 
        statusColor: "yellow",
        tracking: "Preparando envio",
        carrier: "Loggi",
        estimatedDelivery: "2024-01-18",
        shippedDate: "",
        deliveryDate: "",
        notes: "Aguardando confirmação de pagamento",
        isTracked: false,
        paymentStatus: "paid"
      },
      { 
        id: 3, 
        orderId: "ORD-1003",
        customer: "Ana Oliveira", 
        product: "Moletom Finito", 
        quantity: 1,
        price: 120.00, 
        city: "Curitiba, PR", 
        address: "Rua XV de Novembro, 789 - Curitiba, PR",
        status: "Entregue", 
        statusColor: "purple",
        tracking: "BR987654321",
        carrier: "Jadlog",
        estimatedDelivery: "2024-01-16",
        shippedDate: "2024-01-12",
        deliveryDate: "2024-01-15",
        notes: "Assinatura digital confirmada",
        isTracked: true,
        paymentStatus: "paid"
      }
    ];
  };

  // Refresh delivery data
  const refreshDeliveries = () => {
    fetchOrdersFromBackend();
  };

  // Load deliveries on component mount
  useEffect(() => {
    fetchOrdersFromBackend();
  }, []);

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "Entregue": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Enviado": return "bg-green-100 text-green-800 border border-green-200";
      case "Em Preparação": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pendente": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Cancelado": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Entregue": return "purple";
      case "Enviado": return "green";
      case "Em Preparação": return "yellow";
      case "Pendente": return "blue";
      case "Cancelado": return "red";
      default: return "gray";
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
    alert(`📦 Rastreando entrega ${deliveryId}\nPedido: ${delivery?.orderId}\nTransportadora: ${delivery?.carrier}\nCódigo: ${delivery?.tracking}`);
  };

  const handlePrintLabel = (delivery) => {
    alert(`📋 Gerando etiqueta para:\nPedido: ${delivery.orderId}\nCliente: ${delivery.customer}\nEndereço: ${delivery.address}`);
  };

  const handleNotifyCustomer = (delivery) => {
    alert(`📧 Notificando cliente:\n${delivery.customer}\nPedido: ${delivery.orderId}\nStatus: ${delivery.status}`);
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.orderId?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customer?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.product?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.status?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.tracking?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.address?.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.carrier?.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === "Pendente" || d.status === "Em Preparação").length,
    inTransit: deliveries.filter(d => d.status === "Enviado").length,
    delivered: deliveries.filter(d => d.status === "Entregue").length,
    cancelled: deliveries.filter(d => d.status === "Cancelado").length
  };

  // ✅ BEAUTIFUL SKELETON LOADING LAYOUT
  if (loading) {
    return (
      <div className="p-6 space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full sm:w-64 h-9 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header Skeleton */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-4 sm:px-6 py-4 animate-pulse">
                <div className="grid grid-cols-7 gap-4">
                  {[...Array(7)].map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <li><strong>2. CORS instalado?</strong> <code>composer require fruitcake/laravel-cors</code></li>
            <li><strong>3. Rota /api/infos existe?</strong> Verifique routes/api.php</li>
            <li><strong>4. Limpe cache:</strong> <code>php artisan config:clear</code></li>
            <li><strong>5. Verifique logs:</strong> <code>tail -f storage/logs/laravel.log</code></li>
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button onClick={fetchOrdersFromBackend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Tentar Novamente
          </button>
          <button onClick={() => { setError(null); setLoading(false); }} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
            Continuar Offline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: 'Calibri, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Gerenciamento de Entregas</h2>
          <button
            onClick={refreshDeliveries}
            className="flex items-center gap-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            <FiRefreshCw size={14} />
            Atualizar
          </button>
          {lastRefresh && (
            <p className="text-sm text-gray-600">
              Atualizado em: {lastRefresh}
            </p>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar entregas..."
            value={deliverySearch}
            onChange={(e) => setDeliverySearch(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Entregas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiTruck className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <FiClock className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Trânsito</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
            </div>
            <FiRefreshCw className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
            <FiCheckCircle className="text-2xl text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Canceladas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
            </div>
            <FiUser className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <table className="min-w-[800px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pedido</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cliente & Endereço</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Produto</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Transportadora & Rastreio</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cronograma</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                    <div className="text-sm text-gray-500">R$ {delivery.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {delivery.originalInfo?.created_at ? new Date(delivery.originalInfo.created_at).toLocaleDateString('pt-BR') : ''}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">{delivery.city}</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={delivery.address}>
                      {delivery.address}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">{delivery.product}</div>
                    <div className="text-sm text-gray-500">Qtd: {delivery.quantity}</div>
                    <div className="text-xs text-gray-400 mt-1">{delivery.notes}</div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900">{delivery.carrier}</div>
                    <div className="text-sm text-gray-500 font-mono">{delivery.tracking}</div>
                    {delivery.paymentStatus && (
                      <div className={`text-xs mt-1 px-1 rounded ${
                        delivery.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delivery.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900">
                      {delivery.shippedDate && `Enviado: ${new Date(delivery.shippedDate).toLocaleDateString('pt-BR')}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {delivery.estimatedDelivery && `Previsto: ${new Date(delivery.estimatedDelivery).toLocaleDateString('pt-BR')}`}
                    </div>
                    {delivery.deliveryDate && (
                      <div className="text-sm text-green-600">
                        Entregue: {new Date(delivery.deliveryDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <select 
                      value={delivery.status}
                      onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getDeliveryStatusColor(delivery.status)}`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em Preparação">Preparação</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1">
                      <button 
                        onClick={() => handleTrackClick(delivery.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${getTrackButtonColor(delivery)}`}
                      >
                        <FiMapPin size={12} />
                        Rastrear
                      </button>
                      <button 
                        onClick={() => handlePrintLabel(delivery)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 transition-all"
                      >
                        <FiCheckCircle size={12} />
                        Etiqueta
                      </button>
                      <button 
                        onClick={() => handleNotifyCustomer(delivery)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all"
                      >
                        Notificar
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma entrega encontrada</h3>
          <p className="text-gray-600">
            {deliverySearch ? 'Tente ajustar os termos de busca' : 'Nenhum pedido de entrega disponível'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;