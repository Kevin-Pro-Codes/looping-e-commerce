import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, FiPlus, FiTrash2, FiCheck, 
  FiLock, FiStar, FiShoppingBag, FiX 
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

// Skeleton Loading Component
const PaymentTabSkeleton = () => {
  return (
    // ✅ CORRIGIDO: Container mais estreito e menos padding
    <div className="w-full min-w-0 space-y-4 p-2 sm:p-3 max-w-4xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-3">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-1"></div>
          <div className="h-3 bg-purple-400 rounded w-48 mx-auto"></div>
        </div>
      </div>

      {/* Cartões Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
        <div className="space-y-2">
          {[1, 2].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PaymentTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1, type: 'credit', brand: 'visa', lastFour: '4321',
      cardHolder: 'JOÃO SILVA', expiry: '12/25', isDefault: true
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1, date: '2024-01-15', description: 'Camiseta Metallica',
      amount: 89.90, status: 'completed', paymentMethod: 'Cartão Visa ****4321'
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ number: '', holder: '', expiry: '', cvv: '', type: 'credit' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <PaymentTabSkeleton />;

  return (
    // ✅ CORRIGIDO: Container principal otimizado
    <div className="w-full min-w-0 space-y-4 p-2 sm:p-3 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-3 text-white text-center">
        <h1 className="text-lg font-bold mb-1">Pagamentos</h1>
        <p className="text-purple-100 text-xs">Gerencie suas formas de pagamento</p>
        <button
          onClick={() => setShowAddCard(true)}
          className="mt-2 flex items-center justify-center bg-white text-purple-600 px-3 py-1.5 rounded text-sm w-full max-w-xs mx-auto"
        >
          <FiPlus size={14} className="mr-1" />
          Adicionar Cartão
        </button>
      </div>

      {/* Cartões */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <h2 className="text-base font-semibold text-gray-900 text-center mb-2">Cartões</h2>
        <div className="space-y-2">
          {paymentMethods.filter(m => m.type !== 'pix').map((method) => (
            <div key={method.id} className="border rounded-lg p-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-6 h-6 bg-[#1A1F71] text-white rounded flex items-center justify-center">
                    <span className="text-xs font-bold">VISA</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {method.type === 'credit' ? 'Crédito' : 'Débito'} •••• {method.lastFour}
                    </p>
                    <p className="text-xs text-gray-500">{method.cardHolder}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400">
                    <FiStar size={12} />
                  </button>
                  <button className="p-1 text-gray-400">
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showAddCard && (
        // ✅ CORRIGIDO: Modal responsivo com margem lateral
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-xl w-full max-w-sm mx-2 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Adicionar Cartão</h3>
              <button onClick={() => setShowAddCard(false)} className="p-1 text-gray-400">
                <FiX size={16} />
              </button>
            </div>

            <form className="p-2 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input className="w-full p-1.5 border border-gray-300 rounded text-sm" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button type="button" className="flex-1 py-1.5 border border-gray-300 rounded text-sm">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-1.5 bg-purple-600 text-white rounded text-sm">
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTab;