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
      {/* ✅ CORRIGIDO: Header com alinhamento simétrico */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-3 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between">
          {/* Botão esquerdo - tamanho fixo */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center flex-shrink-0"
          >
            {isMobileMenuOpen ? (
              <FiX size={20} className="text-black" />
            ) : (
              getActiveTabIcon()
            )}
          </button>

          {/* Título centralizado */}
          <h1 className="text-lg font-semibold text-black text-center flex-1 px-2">
            {navigationItems.find(item => item.id === activeTab)?.label || "Minha Conta"}
          </h1>

          {/* ✅ CORRIGIDO: Espaço simétrico à direita */}
          <div className="w-10 h-10 flex-shrink-0"></div>
        </div>
      </div>

      {/* ✅ CORRIGIDO: Espaço para o header fixo */}
      <div className="h-16"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="bg-white h-full w-full overflow-y-auto">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Minha Conta</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-12 h-12 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-lg truncate">
                      {user.name || 'Usuário'}
                    </p>
                    <p className="text-gray-500 text-sm truncate">{user.email}</p>
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
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          activeTab === item.id
                            ? 'bg-red-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium text-base">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                
                {/* Logout Button */}
                <li className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = '/login';
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                  >
                    <FiLogOut size={20} />
                    <span className="font-medium text-base">Sair</span>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="h-4"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;