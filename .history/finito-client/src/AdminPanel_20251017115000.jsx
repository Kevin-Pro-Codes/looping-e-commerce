// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHeart, FiShoppingCart, FiPlus, FiTrash2, FiSearch, FiImage, 
  FiEdit, FiUpload, FiUsers, FiPackage, FiTruck, FiDollarSign, 
  FiBarChart2, FiSettings, FiMail, FiBell, FiUser, FiShoppingBag,
  FiPieChart, FiTrendingUp, FiTrendingDown, FiArchive, FiTag,
  FiCreditCard, FiTrello, FiSend, FiEye, FiDownload, FiKey,
  FiShield, FiMoon, FiDatabase, FiMessageSquare, FiMapPin,
  FiBox, FiRefreshCw, FiClipboard, FiCalendar, FiBarChart,
  FiLayers, FiAlertCircle, FiCheckCircle, FiClock
} from "react-icons/fi";

// ... (SaleProducts component remains exactly the same as in your original code)

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  // Search states
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [deliverySearch, setDeliverySearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");

  // Dashboard stats
  const [dashboardStats] = useState({
    totalSales: 12450,
    totalUsers: 892,
    totalOrders: 345,
    totalRevenue: 45280,
    revenueChange: 12.5,
    salesChange: 8.2,
    userChange: 15.7,
    orderChange: -3.4
  });

  // Sample data
  const [orders, setOrders] = useState([
    { id: 1, orderId: "#ORD-001", customer: "João Silva", email: "joao@email.com", product: "Camiseta Finito", quantity: 2, total: 89.90, payment: "Cartão de Crédito", city: "São Paulo, SP", status: "Em Preparação", date: "2024-01-15" },
    { id: 2, orderId: "#ORD-002", customer: "Maria Santos", email: "maria@email.com", product: "Boné Finito", quantity: 1, total: 45.00, payment: "PIX", city: "Rio de Janeiro, RJ", status: "Enviado", date: "2024-01-14" },
    { id: 3, orderId: "#ORD-003", customer: "Pedro Costa", email: "pedro@email.com", product: "Caneca Finito", quantity: 3, total: 75.00, payment: "Boleto", city: "Belo Horizonte, MG", status: "Pendente", date: "2024-01-14" }
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: "João Silva", email: "joao@email.com", phone: "+55 11 99999-9999", cpf: "123.456.789-00", address: "Rua das Flores, 123 - São Paulo, SP", orders: 5, totalSpent: 450.00, status: "active", lastPurchase: "2024-01-15" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "+55 21 88888-8888", cpf: "987.654.321-00", address: "Av. Copacabana, 456 - Rio de Janeiro, RJ", orders: 3, totalSpent: 180.00, status: "active", lastPurchase: "2024-01-14" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", phone: "+55 31 77777-7777", cpf: "456.789.123-00", address: "Rua da Liberdade, 789 - Belo Horizonte, MG", orders: 2, totalSpent: 120.00, status: "suspended", lastPurchase: "2024-01-10" }
  ]);

  // Enhanced Deliveries Data
  const [deliveries, setDeliveries] = useState([
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
      notes: "Entregue na portaria"
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
      notes: "Aguardando confirmação de pagamento"
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
      notes: "Assinatura digital confirmada"
    }
  ]);

  // Stock Management Data
  const [stockItems, setStockItems] = useState([
    {
      id: 1,
      productId: "PROD-001",
      name: "Camiseta Finito Branca",
      sku: "CT-FINITO-WHITE",
      currentStock: 45,
      minimumStock: 10,
      reservedStock: 5,
      incomingStock: 20,
      lastUpdated: "2024-01-15",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 15.00,
      status: "In Stock"
    },
    {
      id: 2,
      productId: "PROD-002",
      name: "Boné Finito Preto",
      sku: "BN-FINITO-BLACK",
      currentStock: 8,
      minimumStock: 5,
      reservedStock: 3,
      incomingStock: 0,
      lastUpdated: "2024-01-15",
      category: "Acessórios",
      supplier: "Fabricante B",
      cost: 8.50,
      status: "Low Stock"
    },
    {
      id: 3,
      productId: "PROD-003",
      name: "Caneca Finito Azul",
      sku: "CN-FINITO-BLUE",
      currentStock: 0,
      minimumStock: 15,
      reservedStock: 0,
      incomingStock: 50,
      lastUpdated: "2024-01-14",
      category: "Casa",
      supplier: "Fabricante C",
      cost: 6.00,
      status: "Out of Stock"
    },
    {
      id: 4,
      productId: "PROD-004",
      name: "Moletom Finito Cinza",
      sku: "ML-FINITO-GRAY",
      currentStock: 25,
      minimumStock: 8,
      reservedStock: 12,
      incomingStock: 30,
      lastUpdated: "2024-01-15",
      category: "Roupas",
      supplier: "Fabricante A",
      cost: 35.00,
      status: "In Stock"
    }
  ]);

  const [coupons, setCoupons] = useState([
    { id: 1, code: "WELCOME10", discount: 10, type: "percentage", used: 45, maxUses: 100, validUntil: "2024-12-31" },
    { id: 2, code: "FREESHIP", discount: 0, type: "shipping", used: 23, maxUses: 50, validUntil: "2024-06-30" }
  ]);

  const [adminUsers, setAdminUsers] = useState([
    { id: 1, name: "Admin Master", email: "admin@store.com", role: "Super Admin", lastLogin: "2024-01-15 14:30", permissions: "All" },
    { id: 2, name: "Manager", email: "manager@store.com", role: "Content Manager", lastLogin: "2024-01-14 09:15", permissions: "Products, Content" }
  ]);

  // Delivery Settings
  const [deliverySettings, setDeliverySettings] = useState({
    shippingZones: [
      { id: 1, name: "São Paulo Capital", cities: ["São Paulo"], rate: 15.00, freeShippingMin: 100.00 },
      { id: 2, name: "Rio de Janeiro Capital", cities: ["Rio de Janeiro"], rate: 18.00, freeShippingMin: 120.00 },
      { id: 3, name: "Outras Capitais", cities: ["Belo Horizonte", "Curitiba", "Porto Alegre"], rate: 25.00, freeShippingMin: 150.00 }
    ],
    carriers: [
      { id: 1, name: "Correios", enabled: true, services: ["PAC", "SEDEX"] },
      { id: 2, name: "Loggi", enabled: true, services: ["Express", "Standard"] },
      { id: 3, name: "Jadlog", enabled: false, services: [".COM", "Package"] }
    ],
    deliveryTimes: {
      standard: "3-5 dias úteis",
      express: "1-2 dias úteis",
      sameDay: false
    }
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("loginStateChange"));
    navigate("/logar");
  };

  // Filter functions
  const filteredOrders = orders.filter(order =>
    order.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.product.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.address.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.orderId.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.customer.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.product.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.status.toLowerCase().includes(deliverySearch.toLowerCase()) ||
    delivery.tracking.toLowerCase().includes(deliverySearch.toLowerCase())
  );

  const filteredStockItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.status.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Enviado": 
      case "Shipped":
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Em Preparação": 
      case "Processing":
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Pendente": 
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Entregue": 
      case "Delivered":
        return "bg-purple-100 text-purple-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      case "active": 
        return "bg-green-100 text-green-800";
      case "suspended": 
        return "bg-red-100 text-red-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case "Entregue": return "bg-purple-100 text-purple-800 border border-purple-200";
      case "Enviado": return "bg-green-100 text-green-800 border border-green-200";
      case "Em Preparação": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Pendente": return "bg-blue-100 text-blue-800 border border-blue-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case "In Stock": return "bg-green-100 text-green-800 border border-green-200";
      case "Low Stock": return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Out of Stock": return "bg-red-100 text-red-800 border border-red-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.orderId === orderId ? { ...order, status: newStatus } : order
    ));
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

  const updateStockQuantity = (itemId, newQuantity) => {
    setStockItems(stockItems.map(item => 
      item.id === itemId ? { 
        ...item, 
        currentStock: newQuantity,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: newQuantity === 0 ? "Out of Stock" : newQuantity <= item.minimumStock ? "Low Stock" : "In Stock"
      } : item
    ));
  };

  const addIncomingStock = (itemId, quantity) => {
    setStockItems(stockItems.map(item => 
      item.id === itemId ? { 
        ...item, 
        incomingStock: item.incomingStock + quantity
      } : item
    ));
  };

  const receiveIncomingStock = (itemId) => {
    setStockItems(stockItems.map(item => 
      item.id === itemId ? { 
        ...item, 
        currentStock: item.currentStock + item.incomingStock,
        incomingStock: 0,
        lastUpdated: new Date().toISOString().split('T')[0],
        status: "In Stock"
      } : item
    ));
  };

  const toggleCustomerStatus = (customerId, currentStatus) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { ...customer, status: currentStatus === "active" ? "suspended" : "active" } : customer
    ));
  };

  // ... (renderDashboard, renderProducts, renderOrders, renderCustomers, renderMarketing, renderSettings, renderReports remain exactly the same)

  const renderDelivery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Delivery Management</h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search deliveries..."
            value={deliverySearch}
            onChange={(e) => setDeliverySearch(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>
      </div>

      {/* Delivery Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                {deliveries.filter(d => d.status === "Pendente").length}
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

      {/* Delivery Tracking Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer & Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier & Tracking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{delivery.orderId}</div>
                    <div className="text-sm text-gray-500">R$ {delivery.price}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                    <div className="text-sm text-gray-500">{delivery.city}</div>
                    <div className="text-xs text-gray-400 mt-1">{delivery.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{delivery.product}</div>
                    <div className="text-sm text-gray-500">Qty: {delivery.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{delivery.carrier}</div>
                    <div className="text-sm text-gray-500">{delivery.tracking}</div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-indigo-600 hover:text-indigo-900">Track</button>
                    <button className="text-green-600 hover:text-green-900">Label</button>
                    <button className="text-blue-600 hover:text-blue-900">Notify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiSettings className="mr-2" />
          Delivery Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Zones */}
          <div>
            <h4 className="font-semibold mb-3">Shipping Zones</h4>
            <div className="space-y-3">
              {deliverySettings.shippingZones.map(zone => (
                <div key={zone.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{zone.name}</span>
                    <span className="text-sm text-gray-600">R$ {zone.rate}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Free shipping over R$ {zone.freeShippingMin}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carriers */}
          <div>
            <h4 className="font-semibold mb-3">Carriers</h4>
            <div className="space-y-3">
              {deliverySettings.carriers.map(carrier => (
                <div key={carrier.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{carrier.name}</span>
                    <div className="text-sm text-gray-500">
                      {carrier.services.join(', ')}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${carrier.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stock Management</h2>
        <div className="flex space-x-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search stock items..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center">
            <FiPlus className="mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stockItems.length}</p>
            </div>
            <FiPackage className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => item.status === "In Stock").length}
              </p>
            </div>
            <FiCheckCircle className="text-2xl text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => item.status === "Low Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {stockItems.filter(item => item.status === "Out of Stock").length}
              </p>
            </div>
            <FiAlertCircle className="text-2xl text-red-500" />
          </div>
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incoming</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.currentStock}
                        onChange={(e) => updateStockQuantity(item.id, parseInt(e.target.value))}
                        className="w-20 p-1 border border-gray-300 rounded text-sm text-black"
                      />
                      <span className="text-xs text-gray-500">Min: {item.minimumStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.reservedStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{item.incomingStock}</span>
                      {item.incomingStock > 0 && (
                        <button
                          onClick={() => receiveIncomingStock(item.id)}
                          className="text-green-600 hover:text-green-800 text-xs"
                        >
                          Receive
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lastUpdated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">History</button>
                    <button 
                      onClick={() => addIncomingStock(item.id, 10)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {stockItems.filter(item => item.status === "Low Stock").map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-100 rounded">
                <div>
                  <span className="font-medium text-yellow-800">{item.name}</span>
                  <div className="text-sm text-yellow-600">
                    Current: {item.currentStock} | Min: {item.minimumStock}
                  </div>
                </div>
                <button 
                  onClick={() => addIncomingStock(item.id, 20)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                >
                  Reorder
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Out of Stock Alerts */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <FiAlertCircle className="mr-2" />
            Out of Stock
          </h3>
          <div className="space-y-3">
            {stockItems.filter(item => item.status === "Out of Stock").map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-100 rounded">
                <div>
                  <span className="font-medium text-red-800">{item.name}</span>
                  <div className="text-sm text-red-600">
                    Incoming: {item.incomingStock} units
                  </div>
                </div>
                <button 
                  onClick={() => addIncomingStock(item.id, 50)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                >
                  Urgent Order
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'} p-15 mt-30`}>
      <div className={`max-w-7xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <FiMoon />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 relative">
              <FiBell />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-lg">Welcome, Admin!</p>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>You have successfully logged in as an administrator.</p>
        </div>

        {/* Navigation Tabs - Updated with Delivery and Stock */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "dashboard", name: "Dashboard", icon: FiBarChart2 },
              { id: "products", name: "Products", icon: FiPackage },
              { id: "orders", name: "Orders", icon: FiShoppingBag },
              { id: "customers", name: "Customers", icon: FiUsers },
              { id: "delivery", name: "Delivery", icon: FiTruck },
              { id: "stock", name: "Stock", icon: FiBox },
              { id: "marketing", name: "Marketing", icon: FiSend },
              { id: "reports", name: "Reports", icon: FiPieChart },
              { id: "settings", name: "Settings", icon: FiSettings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "products" && renderProducts()}
          {activeTab === "orders" && renderOrders()}
          {activeTab === "customers" && renderCustomers()}
          {activeTab === "delivery" && renderDelivery()}
          {activeTab === "stock" && renderStock()}
          {activeTab === "marketing" && renderMarketing()}
          {activeTab === "reports" && renderReports()}
          {activeTab === "settings" && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;