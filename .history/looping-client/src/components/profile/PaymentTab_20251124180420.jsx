import React, { useState } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiCheck, 
  FiLock,
  FiStar,
  FiShoppingBag,
  FiDollarSign,
  FiPieChart,
  FiX
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

const PaymentTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit',
      brand: 'visa',
      lastFour: '4321',
      cardHolder: 'KEVIN SANTOS',
      expiry: '12/25',
      isDefault: true,
      limit: 5000,
      used: 1250
    },
    {
      id: 2,
      type: 'credit',
      brand: 'mastercard',
      lastFour: '8765',
      cardHolder: 'KEVIN SANTOS',
      expiry: '08/26',
      isDefault: false,
      limit: 3000,
      used: 800
    },
    {
      id: 3,
      type: 'debit',
      brand: 'visa',
      lastFour: '1234',
      cardHolder: 'KEVIN SANTOS',
      expiry: '05/27',
      isDefault: false,
      bank: 'Nubank'
    },
    {
      id: 4,
      type: 'pix',
      isDefault: false,
      bank: 'Itaú',
      key: 'kevin.santos@email.com'
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2024-01-15',
      description: 'Compra Online - Looping Store',
      amount: 249.90,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321',
      category: 'shopping'
    },
    {
      id: 2,
      date: '2024-01-12',
      description: 'Assinatura Premium',
      amount: 29.90,
      status: 'completed',
      paymentMethod: 'PIX',
      category: 'subscription'
    },
    {
      id: 3,
      date: '2024-01-10',
      description: 'Restaurante',
      amount: 89.50,
      status: 'pending',
      paymentMethod: 'Cartão Mastercard ****8765',
      category: 'food'
    },
    {
      id: 4,
      date: '2024-01-08',
      description: 'Supermercado',
      amount: 156.30,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****1234',
      category: 'groceries'
    },
    {
      id: 5,
      date: '2024-01-05',
      description: 'Livraria Cultural',
      amount: 67.80,
      status: 'completed',
      paymentMethod: 'Cartão Visa ****4321',
      category: 'shopping'
    },
    {
      id: 6,
      date: '2024-01-03',
      description: 'Posto de Gasolina',
      amount: 120.00,
      status: 'completed',
      paymentMethod: 'Cartão Mastercard ****8765',
      category: 'transport'
    },
    {
      id: 7,
      date: '2024-01-01',
      description: 'Cinema',
      amount: 45.00,
      status: 'completed',
      paymentMethod: 'PIX',
      category: 'entertainment'
    }
  ]);

  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
    type: 'credit',
    brand: 'visa'
  });

  const getCardBrand = (number) => {
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'visa';
  };

  const formatCardNumber = (number) => {
    return number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    const newPaymentMethod = {
      id: Date.now(),
      type: newCard.type,
      brand: getCardBrand(newCard.number),
      lastFour: newCard.number.slice(-4),
      cardHolder: newCard.holder.toUpperCase(),
      expiry: newCard.expiry,
      isDefault: paymentMethods.length === 0,
      limit: newCard.type === 'credit' ? 5000 : undefined,
      used: 0
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setShowAddCard(false);
    setNewCard({ number: '', holder: '', expiry: '', cvv: '', type: 'credit', brand: 'visa' });
  };

  const setDefaultPayment = (id) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
  };

  const deletePaymentMethod = (id) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'shopping': return <FiShoppingBag className="text-blue-500" size={18} />;
      case 'subscription': return <FiStar className="text-purple-500" size={18} />;
      case 'food': return <FiPieChart className="text-orange-500" size={18} />;
      case 'groceries': return <FiShoppingBag className="text-green-500" size={18} />;
      case 'transport': return <FiDollarSign className="text-red-500" size={18} />;
      case 'entertainment': return <FiStar className="text-pink-500" size={18} />;
      default: return <FiDollarSign className="text-gray-500" size={18} />;
    }
  };

  const CardIcon = ({ brand, className = "w-8 h-8" }) => {
    const brands = {
      visa: (
        <div className={`bg-[#1A1F71] text-white rounded flex items-center justify-center ${className}`}>
          <span className="font-bold text-xs">VISA</span>
        </div>
      ),
      mastercard: (
        <div className={`bg-[#EB001B] text-white rounded flex items-center justify-center ${className}`}>
          <span className="font-bold text-xs">MC</span>
        </div>
      ),
      amex: (
        <div className={`bg-[#2E77BC] text-white rounded flex items-center justify-center ${className}`}>
          <span className="font-bold text-xs">AMEX</span>
        </div>
      )
    };

    return brands[brand] || brands.visa;
  };

  return (
    <div className="w-full space-y-8 p-4 sm:p-8">
      {/* Header Simplificado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">Meus Pagamentos</h1>
            <p className="text-blue-100 text-base sm:text-lg">Gerencie suas formas de pagamento e visualize suas transações</p>
          </div>
          <button
            onClick={() => setShowAddCard(true)}
            className="flex items-center justify-center bg-white text-blue-600 hover:bg-blue-50 p-4 rounded-xl transition-colors w-full sm:w-auto shadow-lg hover:shadow-xl"
          >
            <FiPlus size={24} />
          </button>
        </div>
      </div>

      {/* Conteúdo Principal - LAYOUT EXPANDIDO */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Coluna Esquerda - Métodos de Pagamento - MAIS LARGA */}
        <div className="xl:col-span-3 space-y-8">
          {/* Cartões de Crédito/Débito */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Cartões Cadastrados</h2>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors sm:hidden shadow-md"
              >
                <FiPlus size={18} />
                <span className="font-medium">Adicionar</span>
              </button>
            </div>

            <div className="space-y-6">
              {paymentMethods.filter(m => m.type !== 'pix').map((method) => (
                <div
                  key={method.id}
                  className={`border-2 rounded-2xl p-6 transition-all ${
                    method.isDefault
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start lg:items-center space-x-6 flex-1">
                      <CardIcon brand={method.brand} className="w-14 h-14 lg:w-16 lg:h-16" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
                          <p className="font-semibold text-gray-900 text-lg lg:text-xl">
                            {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'} 
                            <span className="hidden lg:inline ml-2 text-blue-600">{method.brand.toUpperCase()}</span>
                          </p>
                          {method.isDefault && (
                            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full w-fit font-medium">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-base lg:text-lg font-mono">**** {method.lastFour}</p>
                        <p className="text-sm lg:text-base text-gray-500 mt-1">{method.cardHolder} • Expira em {method.expiry}</p>
                        
                        {method.type === 'credit' && (
                          <div className="mt-4 lg:mt-6">
                            <div className="flex justify-between text-sm lg:text-base text-gray-600 mb-2">
                              <span className="font-medium">Limite disponível</span>
                              <span className="font-semibold text-green-600">R$ {(method.limit - method.used).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 lg:h-4">
                              <div
                                className="bg-green-500 h-3 lg:h-4 rounded-full transition-all"
                                style={{ width: `${(method.used / method.limit) * 100}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs lg:text-sm text-gray-500 mt-2">
                              <span>Usado: R$ {method.used.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <span>Total: R$ {method.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end lg:justify-start space-x-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 lg:border-none lg:pl-6">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultPayment(method.id)}
                          className="p-3 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-xl border border-gray-200 hover:border-blue-300 shadow-sm"
                          title="Definir como padrão"
                        >
                          <FiStar size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => deletePaymentMethod(method.id)}
                        className="p-3 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-xl border border-gray-200 hover:border-red-300 shadow-sm"
                        title="Remover cartão"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PIX - EXPANDIDO */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Chaves PIX</h2>
            <div className="space-y-6">
              {paymentMethods.filter(m => m.type === 'pix').map((method) => (
                <div
                  key={method.id}
                  className="border-2 border-green-200 bg-green-50 rounded-2xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center space-x-6 flex-1">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <SiPix size={32} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-lg lg:text-xl">Chave PIX - {method.bank}</p>
                        <p className="text-gray-600 text-base lg:text-lg break-all mt-2">{method.key}</p>
                        <div className="flex flex-wrap gap-3 mt-4">
                          <span className="bg-green-100 text-green-800 text-sm px-3 py-1.5 rounded-full font-medium">E-mail</span>
                          <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1.5 rounded-full font-medium">Ativa</span>
                          <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1.5 rounded-full font-medium">Instantâneo</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePaymentMethod(method.id)}
                      className="p-4 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-xl border border-gray-200 hover:border-red-300 shadow-sm self-end lg:self-auto"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-3 group bg-gray-50 hover:bg-gray-100">
                <FiPlus size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-lg font-medium">Adicionar nova chave PIX</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Transações e Estatísticas - MAIOR */}
        <div className="xl:col-span-1 space-y-8">
          {/* Estatísticas Rápidas */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-lg">Resumo do Mês</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-700 text-base font-medium">Gastos totais</span>
                <span className="font-bold text-red-600 text-lg">R$ 525,60</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-gray-700 text-base font-medium">Cartão principal</span>
                <span className="font-bold text-blue-600 text-base">Visa ****4321</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                <span className="text-gray-700 text-base font-medium">Próxima fatura</span>
                <span className="font-bold text-orange-600 text-lg">R$ 249,90</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <span className="text-gray-700 text-base font-medium">Vencimento</span>
                <span className="font-bold text-green-600 text-base">15/02/2024</span>
              </div>
            </div>
          </div>

          {/* Últimas Transações - CONTAINER AUMENTADO */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 text-lg">Últimas Transações</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{transactions.length} itens</span>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100 group">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-base truncate">{transaction.description}</p>
                      <p className="text-sm text-gray-500 truncate mt-1">{transaction.paymentMethod}</p>
                      <p className="text-xs text-gray-400 mt-1">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-gray-900 text-lg">R$ {transaction.amount.toFixed(2)}</p>
                    <span className={`text-sm px-3 py-1.5 rounded-full ${getStatusColor(transaction.status)} font-medium`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-4 mb-4">
              <FiLock className="text-green-500" size={24} />
              <h3 className="font-semibold text-gray-900 text-lg">Segurança</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">Seus dados de pagamento estão protegidos com criptografia de ponta a ponta e monitoramento 24/7.</p>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Verificação em duas etapas</span>
                <span className="text-green-600 font-bold">Ativa</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Notificações</span>
                <span className="text-green-600 font-bold">Ativas</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-gray-700 font-medium">Monitoramento</span>
                <span className="text-blue-600 font-bold">24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Cartão */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">Adicionar Cartão</h3>
              <button
                onClick={() => setShowAddCard(false)}
                className="text-gray-400 hover:text-gray-600 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    value={formatCardNumber(newCard.number)}
                    onChange={(e) => setNewCard({
                      ...newCard,
                      number: e.target.value.replace(/\s/g, ''),
                      brand: getCardBrand(e.target.value.replace(/\s/g, ''))
                    })}
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Nome do Titular
                  </label>
                  <input
                    type="text"
                    value={newCard.holder}
                    onChange={(e) => setNewCard({ ...newCard, holder: e.target.value })}
                    placeholder="KEVIN SANTOS"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Validade
                  </label>
                  <input
                    type="text"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                    placeholder="MM/AA"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    maxLength={3}
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-base font-medium text-gray-700 mb-3">
                    Tipo do Cartão
                  </label>
                  <select
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="credit">Cartão de Crédito</option>
                    <option value="debit">Cartão de Débito</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-4 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-base font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center space-x-3 text-base font-medium shadow-lg hover:shadow-xl"
                >
                  <FiCheck size={20} />
                  <span>Adicionar Cartão</span>
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