import React from 'react';
import { FiUser, FiMapPin, FiCreditCard, FiPackage, FiHeart, FiShoppingBag, FiTag, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';

const DesktopSidebar = ({ activeTab, setActiveTab, user }) => {
  const navigationItems = [
    { id: "perfil", label: "Perfil", icon: FiUser },
    { id: "enderecos", label: "Endereço", icon: FiMapPin },
    { id: "pagamentos", label: "Pagamento", icon: FiCreditCard }, // ← CHANGED from "pagamento" to "pagamentos"
    { id: "pedidos", label: "Pedidos", icon: FiPackage },
    { id: "desejos", label: "Desejos", icon: FiHeart },
    { id: "carrinho", label: "Carrinho", icon: FiShoppingBag },
    { id: "cupons", label: "Cupons & Créditos", icon: FiTag },
    { id: "configuracoes", label: "Configurações", icon: FiSettings },
    { id: "suporte", label: "Suporte e Ajuda", icon: FiHelpCircle },
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white shadow-lg border-r border-gray-200 h-screen sticky top-0 overflow-y-auto pt-30 drawer-scroll">
      <div className="p-6">
        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center">
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
                        ? 'bg-black text-white shadow-sm shadow-gray-800'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
                  window.location.href = '/login';
                }}
                className="w-full flex items-center space-x-3 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all"
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
};

export default DesktopSidebar;