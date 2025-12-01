import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiMenu, FiX, FiUser, FiMapPin, FiCreditCard, FiPackage, FiHeart, FiShoppingBag, FiTag, FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";

const mockUserProfile = {
  name: "",
  email: "",
  tel: "",
  cpf: "",
  birth_date: "",
  avatar: "",
  marketing: true,
  addresses: [],
  payment: [],
};

// Design System Constants
const DESIGN_SYSTEM = {
  colors: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      500: '#10b981',
      600: '#059669',
    },
    warning: {
      500: '#f59e0b',
      600: '#d97706',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  typography: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    small: 'text-sm',
  }
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Cart state
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchWishlist();
    fetchCart();
  }, []);

  // Navigation items with icons
  const navigationItems = [
    { id: "perfil", label: "Perfil", icon: FiUser },
    { id: "enderecos", label: "Endereço", icon: FiMapPin },
    { id: "pagamento", label: "Pagamento", icon: FiCreditCard },
    { id: "pedidos", label: "Pedidos", icon: FiPackage },
    { id: "desejos", label: "Desejos", icon: FiHeart },
    { id: "carrinho", label: "Carrinho", icon: FiShoppingBag },
    { id: "cupons", label: "Cupons & Créditos", icon: FiTag },
    { id: "configuracoes", label: "Configurações", icon: FiSettings },
    { id: "suporte", label: "Suporte e Ajuda", icon: FiHelpCircle },
  ];

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <h1 className="text-lg font-semibold text-gray-800">
            {navigationItems.find(item => item.id === activeTab)?.label || "Minha Conta"}
          </h1>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="bg-white h-full w-80 max-w-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Minha Conta</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{user.name || 'Usuário'}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                
                {/* Logout Button */}
                <li className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      // window.location.href = '/login';
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={20} />
                    <span className="font-medium">Sair</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <aside className="hidden lg:block w-80 bg-white shadow-lg border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Minha Conta</h2>
        <p className="text-gray-500 text-sm mb-8">Gerencie suas informações</p>
        
        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xl">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.name || 'Usuário'}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200 transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
            
            {/* Logout Button */}
            <li className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.clear();
                  // window.location.href = '/login';
                }}
                className="w-full flex items-center space-x-3 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all hover:shadow-md"
              >
                <FiLogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );

  // Responsive Container Component
  const ResponsiveContainer = ({ children, maxWidth = "max-w-6xl" }) => (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth}`}>
      {children}
    </div>
  );

  // Card Component
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );

  // Button Components
  const Button = ({ 
    children, 
    variant = "primary", 
    size = "md",
    className = "",
    ...props 
  }) => {
    const baseClasses = "font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variants = {
      primary: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-6 py-4 text-lg"
    };

    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Input Component
  const Input = ({ label, className = "", ...props }) => (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );

  // Tab Content Wrapper
  const TabContent = ({ children }) => (
    <div className="min-h-screen bg-gray-50 py-6 lg:py-8">
      <ResponsiveContainer>
        <Card className="p-6 lg:p-8">
          {children}
        </Card>
      </ResponsiveContainer>
    </div>
  );

  // Loading Component
  const LoadingSpinner = ({ size = "md" }) => {
    const sizes = {
      sm: "h-6 w-6",
      md: "h-12 w-12",
      lg: "h-16 w-16"
    };

    return (
      <div className="flex justify-center items-center py-8">
        <div className={`animate-spin rounded-full border-b-2 border-red-600 ${sizes[size]}`}></div>
      </div>
    );
  };

  // Empty State Component
  const EmptyState = ({ 
    title, 
    description, 
    icon: Icon, 
    action 
  }) => (
    <div className="text-center py-12 lg:py-16">
      {Icon && (
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon size={32} className="text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action}
    </div>
  );

  // Rest of your existing functions (fetchProfile, saveProfile, etc.) remain the same...
  // [Keep all your existing fetch functions, state handlers, and tab components here]

  // Updated WishlistTab with new design system
  const WishlistTab = () => {
    if (loadingWishlist) {
      return <LoadingSpinner />;
    }

    if (wishlist.length === 0) {
      return (
        <EmptyState
          icon={FiHeart}
          title="Sua lista de desejos está vazia"
          description="Adicione produtos que você gosta para vê-los aqui!"
          action={
            <Button onClick={fetchWishlist}>
              🔄 Recarregar Lista
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meus Desejos</h2>
            <p className="text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchWishlist}
            className="flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Atualizar</span>
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {wishlist.map((item, index) => {
            const product = item.product || {};
            const productTitle = product.title || product.name || `Produto ${item.product_id}`;
            const productPrice = product.price || 0;
            const productImage = product.image || product.image_url || null;
            const productDescription = product.description || 'Informação do produto não disponível';
            const productCategory = product.category || 'Desconhecida';

            const formattedPrice = productPrice 
              ? parseFloat(productPrice).toFixed(2).replace('.', ',')
              : '0,00';

            return (
              <Card key={item.id || index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={productTitle}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {productTitle}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {productDescription}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-xl font-bold text-gray-900">
                            R$ {formattedPrice}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                            {productCategory}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFromWishlist(item.product_id)}
                          className="flex items-center justify-center space-x-2"
                        >
                          <span>×</span>
                          <span>Remover</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            console.log('Add to cart:', item.product_id);
                            alert(`Produto "${productTitle}" adicionado ao carrinho!`);
                          }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <FiShoppingCart size={16} />
                          <span>Comprar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Wishlist Summary */}
        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumo da Lista de Desejos
            </h3>
            <div className="text-right">
              <p className="text-gray-600">
                Total de itens: <span className="font-bold text-gray-900">{wishlist.length}</span>
              </p>
              <p className="text-gray-600">
                Valor total: <span className="font-bold text-green-600 text-lg">
                  R$ {wishlist.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // Updated main return with responsive layout
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Mobile Navigation */}
      <MobileNavigation />

      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Mobile padding top */}
          <div className="lg:hidden pt-20"></div>
          
          {/* Tab Content */}
          {activeTab === "perfil" && (
            <TabContent>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Informações do Usuário</h2>
                  <Button
                    variant={isEditingProfile ? "outline" : "primary"}
                    onClick={toggleEditProfile}
                  >
                    {isEditingProfile ? "Cancelar" : "Editar Perfil"}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nome"
                    name="name"
                    value={user?.name || ''}
                    onChange={handleProfileChange}
                    placeholder="Seu nome completo"
                    disabled={!isEditingProfile}
                  />
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={user?.email || ''}
                    onChange={handleProfileChange}
                    placeholder="seu@email.com"
                    disabled={!isEditingProfile}
                  />
                  <Input
                    label="Telefone"
                    name="tel"
                    value={user?.tel || ''}
                    onChange={handleProfileChange}
                    placeholder="(11) 99999-9999"
                    disabled={!isEditingProfile}
                  />
                  <Input
                    label="CPF"
                    name="cpf"
                    value={user?.cpf || ''}
                    onChange={handleProfileChange}
                    placeholder="000.000.000-00"
                    disabled={!isEditingProfile}
                  />
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    name="birth_date"
                    value={user?.birth_date || ''}
                    onChange={handleProfileChange}
                    disabled={!isEditingProfile}
                    className="md:col-span-2"
                  />
                </div>

                {isEditingProfile && (
                  <div className="flex justify-end pt-4">
                    <Button onClick={saveProfile} size="lg">
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </div>
            </TabContent>
          )}

          {activeTab === "desejos" && (
            <TabContent>
              <WishlistTab />
            </TabContent>
          )}

          {/* Add other tabs following the same pattern... */}
          {activeTab === "carrinho" && (
            <TabContent>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Meu Carrinho</h2>
                    <p className="text-gray-500 mt-1">
                      {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
                {/* Your CartTab content here */}
              </div>
            </TabContent>
          )}

          {/* Add other tabs... */}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;