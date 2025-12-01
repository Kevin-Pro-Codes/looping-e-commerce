import React from 'react';
import { FiMenu, FiX, FiUser, FiMapPin, FiCreditCard, FiPackage, FiHeart, FiShoppingBag, FiTag, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';

const MobileNavigation = ({ 
  activeTab, 
  setActiveTab, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen, 
  user 
}) => {
  const navigationItems = [
    { id: "perfil", label: "Perfil", icon: FiUser },
    { id: "enderecos", label: "Endereço", icon: FiMapPin },
    { id: "pagamentos", label: "Pagamento", icon: FiCreditCard },
    { id: "pedidos", label: "Pedidos", icon: FiPackage },
    { id: "desejos", label: "Desejos", icon: FiHeart },
    { id: "carrinho", label: "Carrinho", icon: FiShoppingBag },
    { id: "cupons", label: "Cupons & Créditos", icon: FiTag },
    { id: "configuracoes", label: "Configurações", icon: FiSettings },
    { id: "suporte", label: "Suporte e Ajuda", icon: FiHelpCircle },
  ];

  const getActiveTabIcon = () => {
    const activeItem = navigationItems.find(item => item.id === activeTab);
    const IconComponent = activeItem ? activeItem.icon : FiMenu;
    return <IconComponent size={24} className="text-black" />;
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Header - MOVED DOWN POSITION */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 pt-15 fixed top-16 left-0 right-0 z-40">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            {isMobileMenuOpen ? (
              <FiX size={20} className="text-black" />
            ) : (
              getActiveTabIcon()
            )}
          </button>
          <h1 className="text-lg font-semibold text-black flex-1 text-center mx-3">
            {navigationItems.find(item => item.id === activeTab)?.label || "Minha Conta"}
          </h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Mobile Menu Overlay - FULL SCREEN VERSION */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          {/* Full screen container */}
          <div className="bg-white h-full w-full overflow-y-auto">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Minha Conta</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-lg truncate">{user.name || 'Usuário'}</p>
                    <p className="text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Items - Full height content */}
            <nav className="p-6">
              <ul className="space-y-3">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all ${
                          activeTab === item.id
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={24} />
                        <span className="font-medium text-lg">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                
                {/* Logout Button */}
                <li className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center space-x-0 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                  >
                    <FiLogOut size={24} />
                    <span className="font-medium text-lg">Sair</span>
                  </button>
                </li>
              </ul>
            </nav>

            {/* Bottom padding for better scrolling */}
            <div className="h-20"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;