whats causing todos os pedidos product items image box to be gray? 

import React, { useState, useEffect } from 'react';
import { FiPackage, FiTruck, FiCalendar, FiXCircle, FiMapPin, FiHome } from 'react-icons/fi';
import { IoReload } from 'react-icons/io5';
import { Button, Card } from './SharedComponents';

const getColorName = (color) => {
  if (!color || color === 'Não especificada' || color === 'undefined') {
    return 'Não especificada';
  }
  
  const colorMap = {
    "#000000": "Preto",
    "#000": "Preto",
    "#FFFFFF": "Branco", 
    "#fff": "Branco",
    "#1E90FF": "Azul",
    "#FF69B4": "Rosa",
    "#FF0000": "Vermelho",
    "#00FF00": "Verde",
    "#0000FF": "Azul Escuro",
    "#FFFF00": "Amarelo",
    "#FFA500": "Laranja",
    "#800080": "Roxo",
    "#808080": "Cinza",
    "#964B00": "Marrom",
    
    "preto": "Preto",
    "branco": "Branco", 
    "azul": "Azul",
    "rosa": "Rosa",
    "vermelho": "Vermelho",
    "verde": "Verde",
    "amarelo": "Amarelo",
    "laranja": "Laranja",
    "roxo": "Roxo",
    "cinza": "Cinza",
    "marrom": "Marrom",
    
    "black": "Preto",
    "white": "Branco",
    "blue": "Azul",
    "pink": "Rosa", 
    "red": "Vermelho",
    "green": "Verde",
    "yellow": "Amarelo",
    "orange": "Laranja",
    "purple": "Roxo",
    "gray": "Cinza",
    "grey": "Cinza",
    "brown": "Marrom"
  };
  
  const normalizedColor = color.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  if (colorMap[normalizedColor]) {
    return colorMap[normalizedColor];
  }
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (normalizedColor.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedColor)) {
      return value;
    }
  }
  
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return color.toUpperCase();
  }
  
  return color.charAt(0).toUpperCase() + color.slice(1);
};

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

const OrdersAPI = {
  fetchOrders: async () => {
    try {
      const csrfToken = await CsrfTokenManager.getCsrfToken();
      
      const endpoint = 'http://localhost:8000/api/infos';
      
      console.log(`🔄 Fetching orders from: ${endpoint}`);
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Success with endpoint: ${endpoint}`, result);
      
      if (result.data) {
        console.log('📦 Dados recebidos:', result.data);
        console.log('🖼️ Itens com imagens:', result.data.filter(order => 
          order.items?.some(item => item.image)
        ).length);
      }
      
      return result.data || result.orders || result;
      
    } catch (error) {
      console.error('❌ Orders API Error:', error);
      throw error;
    }
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

const OrdersTabSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded"></div>
      </div>

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

      <div className="space-y-4">
        {[1, 2, 3].map((order) => (
          <Card key={order} className="p-6">
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

const AddressDisplay = ({ address }) => {
  if (!address) return <p className="text-gray-500">Endereço não informado</p>;

  if (typeof address === 'object' && address.street) {
    const {
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zip_code
    } = address;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 font-medium">Rua:</p>
              <p className="text-gray-900 font-semibold">{street || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Número:</p>
              <p className="text-gray-900 font-semibold">{number || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Complemento:</p>
              <p className="text-gray-900 font-semibold">{complement || 'Não informado'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 font-medium">Bairro:</p>
              <p className="text-gray-900 font-semibold">{neighborhood || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Cidade:</p>
              <p className="text-gray-900 font-semibold">{city || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Estado:</p>
              <p className="text-gray-900 font-semibold">{state || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">CEP:</p>
              <p className="text-gray-900 font-semibold">{zip_code || 'Não informado'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={16} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {street}, {number}
              {complement && `, ${complement}`} - {neighborhood}, {city} - {state}
            </p>
            <p className="text-gray-500 text-sm">CEP: {zip_code}</p>
          </div>
        </div>
      </div>
    );
  }

  if (typeof address === 'string') {
    return (
      <div className="flex items-start space-x-2">
        <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={16} />
        <p className="text-gray-700">{address}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-2">
      <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={16} />
      <div>
        <p className="text-gray-700 font-medium">Endereço (formato não reconhecido):</p>
        <pre className="text-sm text-gray-600 mt-1">
          {JSON.stringify(address, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const ProductImageDisplay = ({ item, className = "w-35 h-35" }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className={`${className} bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-100 shadow-lg`}>
      {item.image && !imageError ? (
        <div className="w-full h-full flex items-center justify-center p-0">
          <img 
            src={item.image} 
            alt={item.product_name}
            className="w-full h-full object-contain"
            style={{ 
              imageRendering: 'auto',
              transform: 'translateZ(0)'
            }}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <FiPackage size={24} className="text-gray-400" />
        </div>
      )}
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

  useEffect(() => {
    if (orders.length > 0 && !loadingOrders) {
      console.log('🔍 DEBUG - Estrutura completa dos pedidos:');
      
      orders.forEach((order, index) => {
        console.log(`📦 Pedido ${index + 1}:`, {
          orderNumber: order.order_number,
          status: order.status,
          itemsCount: order.items?.length,
          itemsWithImages: order.items?.filter(item => item.image).length,
          itemsStructure: order.items?.map(item => ({
            productName: item.product_name,
            hasImage: !!item.image,
            imageField: item.image,
            allFields: item
          }))
        });
      });

      const entregasOrders = orders.filter(order => 
        order.status === 'enviado' || 
        order.status === 'entregue' || 
        order.status === 'a_caminho' || 
        order.status === 'cancelado'
      );

      const todosOrders = orders;

      console.log('📊 COMPARAÇÃO:');
      console.log('- Entregas:', entregasOrders.length, 'pedidos');
      console.log('- Todos os Pedidos:', todosOrders.length, 'pedidos');
      
      console.log('🖼️ Estatísticas de Imagens:');
      console.log('- Entregas - Itens com imagem:', 
        entregasOrders.reduce((total, order) => 
          total + (order.items?.filter(item => item.image).length || 0), 0)
      );
      console.log('- Todos - Itens com imagem:', 
        todosOrders.reduce((total, order) => 
          total + (order.items?.filter(item => item.image).length || 0), 0)
      );
    }
  }, [orders, loadingOrders]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      setError(null);
      console.log('🔄 Fetching orders from backend...');
      
      const ordersData = await OrdersAPI.fetchOrders();
      console.log('✅ Orders fetched successfully:', ordersData);
      
      const transformedOrders = transformOrdersData(ordersData);
      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const transformOrdersData = (backendOrders) => {
    if (!backendOrders) return [];
    
    let ordersArray = [];
    
    if (Array.isArray(backendOrders)) {
      ordersArray = backendOrders;
    } 
    else if (backendOrders.data && Array.isArray(backendOrders.data)) {
      ordersArray = backendOrders.data;
    }
    else if (backendOrders.orders && Array.isArray(backendOrders.orders)) {
      ordersArray = backendOrders.orders;
    }
    else if (backendOrders.id) {
      ordersArray = [backendOrders];
    }
    
    console.log('🔄 Transforming orders data:', ordersArray);

    return ordersArray.map(order => {
      let shippingAddress = order.shipping_address;
      
      if (typeof shippingAddress === 'string') {
        try {
          const parsed = JSON.parse(shippingAddress);
          if (typeof parsed === 'object') {
            shippingAddress = parsed;
          }
        } catch (e) {
          console.log('📦 Address é string, mantendo como:', shippingAddress);
        }
      }
      
      if (!shippingAddress || (typeof shippingAddress === 'object' && !shippingAddress.street)) {
        shippingAddress = {
          street: order.shipping_street || order.street,
          number: order.shipping_number || order.number,
          complement: order.shipping_complement || order.complement,
          neighborhood: order.shipping_neighborhood || order.neighborhood,
          city: order.shipping_city || order.city,
          state: order.shipping_state || order.state,
          zip_code: order.shipping_zip_code || order.zip_code
        };
      }

      return {
        id: order.id || order.order_id,
        order_number: order.order_number || `ORD-${order.id || ''}`,
        status: mapStatus(order.status),
        order_date: order.created_at || order.order_date || order.date,
        total: parseFloat(order.total) || 0,
        shipping_address: shippingAddress,
        tracking_number: order.tracking_number || order.tracking_code,
        estimated_delivery: order.estimated_delivery || order.delivery_date,
        cancellation_reason: order.cancellation_reason,
        
        items: order.items ? order.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name || item.name || item.product_title,
          quantity: item.quantity || item.qty,
          price: parseFloat(item.price) || 0,
          total: parseFloat(item.total) || (parseFloat(item.price) || 0) * (item.quantity || 1),
          
          color: getColorName(item.color),
          size: item.size,
          image: item.image || 
                 item.image_url || 
                 item.product_image ||
                 item.product_variant?.image ||
                 item.variant?.image ||
                 item.thumbnail ||
                 item.main_image ||
                 null,
          variant_id: item.variant_id,
          sku: item.sku
        })) : [],
        
        customer: order.customer || {},
        
        payment_method: order.payment_method,
        payment_status: order.payment_status
      };
    });
  };

  const mapStatus = (backendStatus) => {
    const statusMap = {
      'pending': 'pendente',
      'processing': 'processando',
      'shipped': 'enviado',
      'delivered': 'entregue',
      'out_for_delivery': 'a_caminho',
      'cancelled': 'cancelado',
      'refunded': 'reembolsado',
      'pendente': 'pendente',
      'processando': 'processando', 
      'enviado': 'enviado',
      'entregue': 'entregue',
      'a_caminho': 'a_caminho',
      'cancelado': 'cancelado'
    };
    
    return statusMap[backendStatus] || backendStatus || 'pendente';
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = activeSubTab === 'entrega' 
    ? orders.filter(order => 
        order.status === 'enviado' || 
        order.status === 'entregue' || 
        order.status === 'a_caminho' || 
        order.status === 'cancelado'
      )
    : orders;

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

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('entrega')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSubTab === 'entrega'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiTruck size={18} />
              <span>Entregas</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {orders.filter(o => 
                  o.status === 'enviado' || 
                  o.status === 'entregue' || 
                  o.status === 'a_caminho' || 
                  o.status === 'cancelado'
                ).length}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveSubTab('pedidos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSubTab === 'pedidos'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FiPackage size={18} />
              <span>Todos os Pedidos</span>
              <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-xs">
                {orders.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const trackingSteps = generateTrackingInfo(order);
          
          return (
            <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {order.order_number}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Pedido realizado em {new Date(order.order_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <ProductImageDisplay item={item} />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {item.product_name}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.size && item.size !== 'Não especificado' && (
                              <span className="text-xs text-gray-500">
                                Tamanho: {item.size}
                              </span>
                            )}
                            {item.color && item.color !== 'Não especificada' && (
                              <span className="text-xs text-gray-500">
                                Cor: {item.color}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Qtd: {item.quantity} × R$ {item.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        R$ {item.total.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(activeSubTab === 'entrega' || activeSubTab === 'pedidos') && (
                <div className={`border rounded-lg p-4 mb-4 ${
                  order.status === 'cancelado' 
                    ? 'bg-red-50 border-red-200' 
                    : order.status === 'a_caminho'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-3">
                    {order.status === 'cancelado' ? (
                      <FiXCircle className="text-red-600" size={18} />
                    ) : (
                      <FiHome className={
                        order.status === 'a_caminho' ? 'text-orange-600' : 'text-blue-600'
                      } size={18} />
                    )}
                    <h4 className={`font-semibold ${
                      order.status === 'cancelado' ? 'text-red-900' : 
                      order.status === 'a_caminho' ? 'text-orange-900' : 'text-blue-900'
                    }`}>
                      {order.status === 'cancelado' ? 'Entrega Cancelada' : 
                       order.status === 'a_caminho' ? 'Entrega a Caminho' : 'Informações de Entrega'}
                    </h4>
                  </div>

                  {order.status === 'cancelado' ? (
                    <div className="space-y-2">
                      <p className="text-red-800 font-medium">Motivo do cancelamento:</p>
                      <p className="text-red-700">
                        {order.cancellation_reason || "Produto indisponível no momento"}
                      </p>
                      <p className="text-red-600 text-sm">
                        Valor reembolsado em: {new Date().toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ) : order.status === 'a_caminho' ? (
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <h5 className="font-semibold text-orange-800 mb-3 flex items-center space-x-2">
                            <FiMapPin size={16} />
                            <span>Endereço de Entrega</span>
                          </h5>
                          <AddressDisplay address={order.shipping_address} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {order.tracking_number && (
                            <div className="bg-white rounded-lg p-4 border border-orange-200">
                              <p className="text-orange-800 font-medium">Código de rastreio:</p>
                              <p className="text-orange-700 font-mono text-lg">{order.tracking_number}</p>
                            </div>
                          )}
                          {order.estimated_delivery && (
                            <div className="bg-white rounded-lg p-4 border border-orange-200">
                              <p className="text-orange-800 font-medium">Previsão de entrega:</p>
                              <div className="flex items-center space-x-2 text-green-700">
                                <FiCalendar size={16} />
                                <span className="font-semibold">
                                  {new Date(order.estimated_delivery).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {trackingSteps && (
                        <div className="border-t border-orange-200 pt-3">
                          <p className="text-orange-800 font-medium mb-2">Andamento da entrega:</p>
                          <div className="space-y-2">
                            {trackingSteps.map((step, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className={`w-3 h-3 rounded-full mt-1 ${
                                  step.date ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                                <div className="flex-1">
                                  <p className={`text-sm ${
                                    step.date ? 'text-green-700 font-medium' : 'text-gray-500'
                                  }`}>
                                    {step.status === 'postado' && 'Pedido postado'}
                                    {step.status === 'em_transito' && 'Em trânsito para entrega'}
                                    {step.status === 'saiu_entrega' && 'Saiu para entrega'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {step.location} {step.date && `• ${step.date.toLocaleDateString('pt-BR')}`}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h5 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                          <FiMapPin size={16} />
                          <span>Endereço de Entrega</span>
                        </h5>
                        <AddressDisplay address={order.shipping_address} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.tracking_number && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-blue-800 font-medium">Código de rastreio:</p>
                            <p className="text-blue-700 font-mono text-lg">{order.tracking_number}</p>
                          </div>
                        )}
                        {order.estimated_delivery && (
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <p className="text-blue-800 font-medium">Previsão de entrega:</p>
                            <div className="flex items-center space-x-2 text-green-700">
                              <FiCalendar size={16} />
                              <span className="font-semibold">
                                {new Date(order.estimated_delivery).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        )}
                        {order.status === 'entregue' && (
                          <div className="bg-white rounded-lg p-4 border border-green-200">
                            <p className="text-green-800 font-medium">Status:</p>
                            <p className="text-green-700 font-semibold">✓ Entregue com sucesso</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {activeSubTab === 'entrega' && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'a_caminho').length}
              </p>
              <p className="text-sm text-orange-700">A Caminho</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {orders.filter(o => o.status === 'enviado').length}
              </p>
              <p className="text-sm text-blue-700">Em Trânsito</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'entregue').length}
              </p>
              <p className="text-sm text-green-700">Entregues</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelado').length}
              </p>
              <p className="text-sm text-red-700">Canceladas</p>
            </div>
          </div>
        </Card>
      )}

      {activeSubTab === 'pedidos' && (
        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'entregue').length}
              </p>
              <p className="text-sm text-gray-600">Entregues</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'a_caminho').length}
              </p>
              <p className="text-sm text-gray-600">A Caminho</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'enviado').length}
              </p>
              <p className="text-sm text-gray-600">Enviados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'cancelado').length}
              </p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrdersTab;