import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, FiPlus, FiTrash2, FiCheck, 
  FiLock, FiStar, FiShoppingBag, FiX 
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

const PaymentTabSkeleton = () => {
  return (
    <div className="w-full min-w-0 space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 p-4">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-purple-400 rounded w-56 mx-auto"></div>
        </div>
      </div>

      {/* Cartões Skeleton */}
      <div className="bg-white border-t border-b border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-36 mx-auto mb-3"></div>
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
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
    // ✅ REMOVIDO: Todo padding e margin lateral
    <div className="w-full min-w-0 space-y-0">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 p-4 text-white">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Looping Pagamentos</h1>
          <p className="text-purple-100 text-sm mb-3">Gerencie suas formas de pagamento</p>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors w-full max-w-xs mx-auto text-sm font-medium"
          >
            <FiPlus size={16} className="mr-2" />
            Adicionar Cartão
          </button>
        </div>
      </div>

      {/* Cartões */}
      <div className="bg-white border-t border-b border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">Cartões</h2>
        <div className="space-y-3">
          {paymentMethods.filter(m => m.type !== 'pix').map((method) => (
            <div key={method.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-8 h-8 bg-[#1A1F71] text-white rounded flex items-center justify-center">
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

      {/* PIX */}
      <div className="bg-white border-t border-b border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-3">PIX</h2>
        <div className="space-y-3">
          {paymentMethods.filter(m => m.type === 'pix').map((method) => (
            <div key={method.id} className="border border-green-200 bg-green-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <SiPix size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">PIX - {method.bank}</p>
                    <p className="text-gray-600 text-xs break-all mt-1">{method.key}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-400">
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          
          <button className="w-full border border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2 bg-gray-50">
            <FiPlus size={16} />
            <span className="text-sm font-medium">Adicionar PIX</span>
          </button>
        </div>
      </div>

      {/* Transações */}
      <div className="bg-white border-t border-b border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Minhas Compras</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {transactions.length}
          </span>
        </div>
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="text-red-600" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">R$ {transaction.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full h-full overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Cartão</h3>
              <button onClick={() => setShowAddCard(false)} className="p-1 text-gray-400">
                <FiX size={18} />
              </button>
            </div>

            <form className="p-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button type="button" className="flex-1 py-2 border border-gray-300 rounded text-sm">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded text-sm">
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