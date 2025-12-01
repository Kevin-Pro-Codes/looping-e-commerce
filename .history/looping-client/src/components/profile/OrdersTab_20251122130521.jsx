import React, { useState, useEffect } from 'react';
import { FiPackage, FiTruck, FiCalendar, FiXCircle } from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';
import { Button, Card } from './SharedComponents';

// ✅ CSRF Token Manager (reuse from your checkout)
const CsrfTokenManager = {
  getCsrfToken: async () => {
    try {
      const response = await fetch('http://localhost:8000/sanctum/csrf-cookie', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const cookies = document.cookie;
        const tokenMatch = cookies.match(/XSRF-TOKEN=([^;]+)/);
        
        if (tokenMatch && tokenMatch[1]) {
          return decodeURIComponent(tokenMatch[1]);
        }
      }
      
      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      return metaToken || 'fallback-csrf-token';
      
    } catch (error) {
      console.error('❌ Error getting CSRF token:', error);
      return 'fallback-csrf-token';
    }
  }
};

// ✅ Orders API Service - UPDATED to use your existing endpoint
const OrdersAPI = {
  fetchOrders: async () => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      
      // ✅ USING YOUR EXISTING ENDPOINT from checkout
      const response = await fetch('http://localhost:8000/api/infos', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // If 404, try alternative endpoints
        if (response.status === 404) {
          return await OrdersAPI.tryAlternativeEndpoints(csrfToken);
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch orders');
      }
      
      return result.data || result.orders || result;
    } catch (error) {
      console.error('❌ Orders API Error:', error);
      throw error;
    }
  },

  tryAlternativeEndpoints: async (csrfToken) => {
    const alternativeEndpoints = [
      'http://localhost:8000/api/orders/user',
      'http://localhost:8000/api/user/orders',
      'http://localhost:8000/api/my-orders'
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`🔄 Trying alternative endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': csrfToken,
          },
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Success with endpoint: ${endpoint}`, result);
          return result.data || result.orders || result;
        }
      } catch (error) {
        console.log(`❌ Failed with endpoint ${endpoint}:`, error.message);
        continue;
      }
    }
    
    throw new Error('No orders endpoint found');
  },

  fetchOrderDetails: async (orderId) => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      
      const response = await fetch(`http://localhost:8000/api/infos/${orderId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch order details');
      }
      
      return result.data;
    } catch (error) {
      console.error('❌ Order Details API Error:', error);
      throw error;
    }
  }
};

// ✅ Skeleton Loading Component (keep as is)
const OrdersTabSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded"></div>
      </div>

      {/* Sub Navigation Tabs Skeleton */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[1, 2].map((tab) => (
            <div key={tab} className="py-2 px-1">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="w-8 h-6 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((order) => (
          <Card key={order} className="p-6">
            {/* Order Header Skeleton */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="h-6 bg-gray-200 rounded w-32"></div>
                  <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-6 bg-gray-200 rounded w-20 ml-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
              </div>
            </div>

            {/* Order Items Skeleton */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="space-y-3">
                {[1, 2].map((item) => (
                  <div key={item} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information Skeleton */}
            <div className="border rounded-lg p-4 mb-4 bg-gray-50 border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-5 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((field) => (
                  <div key={field} className="space-y-1">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Footer Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-36"></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <div className="w-24 h-10 bg-gray-200 rounded"></div>
                <div className="w-32 h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Card Skeleton */}
      <Card className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {[1, 2, 3, 4].map((stat) => (
            <div key={stat}>
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const OrdersTab = ({ 
  setActiveTab,
  getStatusColor,
  getStatusText 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('entrega');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      console.log('🔄 Fetching orders from backend...');
      
      const ordersData = await OrdersAPI.fetchOrders();
      console.log('✅ Orders fetched successfully:', ordersData);
      
      // Transform backend data to match frontend structure
      const transformedOrders = transformOrdersData(ordersData);
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError(error.message);
      
      // If no API endpoint works, show empty state with instructions
      if (error.message.includes('No orders endpoint found')) {
        setError('Nenhum endpoint de pedidos encontrado. Configure as rotas do backend.');
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  // ✅ Transform backend data to match frontend structure
  const transformOrdersData = (backendOrders) => {
    // Handle different response formats
    if (!backendOrders) return [];
    
    let ordersArray = [];
    
    // If it's already an array
    if (Array.isArray(backendOrders)) {
      ordersArray = backendOrders;
    } 
    // If it's an object with data property
    else if (backendOrders.data && Array.isArray(backendOrders.data)) {
      ordersArray = backendOrders.data;
    }
    // If it's an object with orders property
    else if (backendOrders.orders && Array.isArray(backendOrders.orders)) {
      ordersArray = backendOrders.orders;
    }
    // If it's a single order object
    else if (backendOrders.id) {
      ordersArray = [backendOrders];
    }
    
    console.log('🔄 Transforming orders data:', ordersArray);

    return ordersArray.map(order => ({
      id: order.id || order.order_id,
      order_number: order.order_number || `ORD-${order.id || ''}`,
      status: mapStatus(order.status),
      order_date: order.created_at || order.order_date || order.date,
      total: parseFloat(order.total) || 0,
      shipping_address: formatShippingAddress(order),
      tracking_number: order.tracking_number || order.tracking_code,
      estimated_delivery: order.estimated_delivery || order.delivery_date,
      cancellation_reason: order.cancellation_reason,
      
      // Items structure - handle different formats
      items: order.items ? order.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name || item.name || item.product_title,
        quantity: item.quantity || item.qty,
        price: parseFloat(item.price) || 0,
        total: parseFloat(item.total) || (parseFloat(item.price) || 0) * (item.quantity || 1),
        
        // Include color and size from backend
        color: item.color,
        size: item.size,
        image: item.image || item.image_url,
        variant_id: item.variant_id,
        sku: item.sku
      })) : [],
      
      // Customer info
      customer: order.customer || {},
      
      // Payment info
      payment_method: order.payment_method,
      payment_status: order.payment_status
    }));
  };

  // ✅ Map backend status to frontend status
  const mapStatus = (backendStatus) => {
    const statusMap = {
      'pending': 'pendente',
      'processing': 'processando',
      'shipped': 'enviado',
      'delivered': 'entregue',
      'out_for_delivery': 'a_caminho',
      'cancelled': 'cancelado',
      'refunded': 'reembolsado',
      // Add your existing statuses
      'pendente': 'pendente',
      'processando': 'processando', 
      'enviado': 'enviado',
      'entregue': 'entregue',
      'a_caminho': 'a_caminho',
      'cancelado': 'cancelado'
    };
    
    return statusMap[backendStatus] || backendStatus || 'pendente';
  };

  // ✅ Format shipping address from backend data
  const formatShippingAddress = (order) => {
    if (order.shipping_address) {
      const addr = order.shipping_address;
      return `${addr.street || addr.logradouro}, ${addr.number || addr.numero}${addr.complement ? `, ${addr.complement}` : ''} - ${addr.neighborhood || addr.bairro}, ${addr.city || addr.cidade} - ${addr.state || addr.estado}, ${addr.zip_code || addr.cep}`;
    }
    
    // Fallback to individual fields (your current structure)
    const parts = [
      order.shipping_street,
      order.shipping_number,
      order.shipping_complement,
      order.shipping_neighborhood,
      order.shipping_city,
      order.shipping_state,
      order.shipping_zip_code
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on active sub-tab
  const filteredOrders = activeSubTab === 'entrega' 
    ? orders.filter(order => 
        order.status === 'enviado' || 
        order.status === 'entregue' || 
        order.status === 'a_caminho' || 
        order.status === 'cancelado'
      )
    : orders;

  // ✅ Error state
  if (error && orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiXCircle size={32} className="text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar pedidos</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <div className="space-y-3">
          <Button onClick={fetchOrders} className="flex items-center space-x-2 mx-auto">
            <IoReload size={16} />
            Tentar Novamente
          </Button>
          <div className="text-sm text-gray-500">
            <p>Verifique se o backend está rodando e as rotas estão configuradas.</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Use skeleton while loading
  if (loadingOrders && orders.length === 0) {
    return <OrdersTabSkeleton />;
  }

  const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{description}</p>
      <Button onClick={() => setActiveTab("carrinho")}>
        Ir para Carrinho
      </Button>
    </div>
  );

  if (filteredOrders.length === 0) {
    if (activeSubTab === 'pedidos') {
      return (
        <EmptyState 
          title="Nenhum pedido encontrado"
          description="Você ainda não realizou nenhum pedido."
          icon={FiPackage}
        />
      );
    } else {
      return (
        <EmptyState 
          title="Nenhuma entrega encontrada"
          description="Você não tem entregas em andamento ou concluídas."
          icon={FiTruck}
        />
      );
    }
  }

  // Função para gerar informações de rastreio realistas
  const generateTrackingInfo = (order) => {
    if (order.status === 'a_caminho') {
      const steps = [
        { status: 'postado', date: new Date(order.order_date), location: 'Centro de Distribuição - SP' },
        { status: 'em_transito', date: new Date(), location: 'Unidade Local - Sua Cidade' },
        { status: 'saiu_entrega', date: null, location: 'Em breve' }
      ];
      return steps;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meus Pedidos</h2>
          <p className="text-gray-500 mt-1">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'item' : 'itens'} encontrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
              Erro: {error}
            </span>
          )}
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="flex items-center space-x-2"
            disabled={loadingOrders}
          >
            <IoReload size={21} className={loadingOrders ? 'animate-spin' : ''} />
            {loadingOrders ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* ... existing JSX code ... */}
    </div>
  );
};

export default OrdersTab;