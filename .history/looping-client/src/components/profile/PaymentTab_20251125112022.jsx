import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiTrash2, 
  FiCheck, 
  FiLock,
  FiStar,
  FiShoppingBag,
  FiX,
  FiExternalLink
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

// Skeleton Loading Component
const PaymentTabSkeleton = () => {
  return (
    <div className="w-full space-y-4 p-4 animate-pulse">
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-purple-400 rounded w-56 mx-auto"></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pixKeys, setPixKeys] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Simular carregamento
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Dados mockados - Stripe
        const mockPaymentMethods = [
          {
            id: 'pm_1ABC123',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025
            },
            isDefault: true
          },
          {
            id: 'pm_1DEF456',
            type: 'card',
            card: {
              brand: 'mastercard',
              last4: '8888',
              exp_month: 8,
              exp_year: 2026
            },
            isDefault: false
          }
        ];

        // Dados mockados - PIX
        const mockPixKeys = [
          {
            id: 1,
            type: 'email',
            key: 'cliente@email.com',
            isDefault: true,
            createdAt: '2024-01-15'
          },
          {
            id: 2,
            type: 'cpf',
            key: '123.456.789-00',
            isDefault: false,
            createdAt: '2024-01-10'
          }
        ];

        // Transações
        const mockTransactions = [
          {
            id: 'pi_1XYZ789',
            date: '2024-01-15',
            description: 'Camiseta Metallica - Master of Puppets',
            amount: 89.90,
            status: 'succeeded',
            paymentMethod: 'Cartão Visa ****4242'
          },
          {
            id: 'pi_2ABC123',
            date: '2024-01-12',
            description: 'Camiseta Iron Maiden - Eddie Trooper',
            amount: 79.90,
            status: 'succeeded',
            paymentMethod: 'PIX'
          },
          {
            id: 'pi_3DEF456',
            date: '2024-01-10',
            description: 'Camiseta Nirvana - Nevermind',
            amount: 69.90,
            status: 'succeeded',
            paymentMethod: 'Cartão Mastercard ****8888'
          }
        ];

        setPaymentMethods(mockPaymentMethods);
        setPixKeys(mockPixKeys);
        setTransactions(mockTransactions);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Stripe Integration
  const handleStripeIntegration = async () => {
    try {
      setProcessing(true);
      console.log('🔄 Iniciando integração com Stripe...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular novo cartão adicionado
      const newPaymentMethod = {
        id: 'pm_' + Date.now(),
        type: 'card',
        card: {
          brand: 'visa',
          last4: '1234',
          exp_month: 6,
          exp_year: 2027
        },
        isDefault: false
      };
      
      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      alert('✅ Cartão adicionado com sucesso via Stripe!');
      
    } catch (error) {
      console.error('Erro na integração com Stripe:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
      setShowStripeForm(false);
    }
  };

  // PIX Functions
  const addPixKey = () => {
    const newKey = {
      id: Date.now(),
      type: 'email',
      key: 'nova.chave@email.com',
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setPixKeys(prev => [...prev, newKey]);
    alert('Chave PIX adicionada com sucesso!');
  };

  const removePixKey = (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta chave PIX?')) return;
    setPixKeys(prev => prev.filter(key => key.id !== id));
    alert('Chave PIX removida!');
  };

  const setDefaultPix = (id) => {
    setPixKeys(prev => prev.map(key => ({
      ...key,
      isDefault: key.id === id
    })));
    alert('Chave PIX definida como padrão!');
  };

  // Stripe Functions
  const detachPaymentMethod = async (paymentMethodId) => {
    if (!window.confirm('Tem certeza que deseja remover este cartão?')) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaymentMethods(prev => prev.filter(method => method.id !== paymentMethodId));
      alert('Cartão removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover cartão:', error);
      alert('Erro ao remover cartão.');
    }
  };

  const setDefaultPayment = async (paymentMethodId) => {
    try {
      setPaymentMethods(prev => prev.map(method => ({
        ...method,
        isDefault: method.id === paymentMethodId
      })));
      alert('Método de pagamento definido como padrão!');
    } catch (error) {
      console.error('Erro ao definir método padrão:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'succeeded': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const CardIcon = ({ brand, size = "w-10 h-10" }) => {
    const brands = {
      visa: (
        <div className={`bg-[#1A1F71] text-white rounded flex items-center justify-center ${size}`}>
          <span className="font-bold text-xs">VISA</span>
        </div>
      ),
      mastercard: (
        <div className={`bg-[#EB001B] text-white rounded flex items-center justify-center ${size}`}>
          <span className="font-bold text-xs">MC</span>
        </div>
      ),
      amex: (
        <div className={`bg-[#016FD0] text-white rounded flex items-center justify-center ${size}`}>
          <span className="font-bold text-xs">AMEX</span>
        </div>
      )
    };
    return brands[brand] || brands.visa;
  };

  const totalSpent = transactions
    .filter(t => t.status === 'succeeded')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    <div className="w-full space-y-4 p-4 mt-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4 text-white text-center">
        <h1 className="text-xl font-bold mb-2">Looping Pagamentos</h1>
        <p className="text-purple-100 text-sm mb-3">Múltiplas formas de pagamento seguras</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => setShowStripeForm(true)}
            disabled={processing}
            className="flex items-center justify-center bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            <FiCreditCard size={16} className="mr-2" />
            {processing ? 'Processando...' : 'Adicionar Cartão'}
          </button>
          <button
            onClick={addPixKey}
            className="flex items-center justify-center bg-transparent border border-white text-white hover:bg-white hover:text-purple-600 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <SiPix size={16} className="mr-2" />
            Adicionar PIX
          </button>
        </div>
      </div>

      {/* Grid de Métodos de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Cartões do Stripe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Meus Cartões</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {paymentMethods.length} cartões
            </span>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="text-center py-6">
              <FiCreditCard className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-500 mb-3">Nenhum cartão cadastrado</p>
              <button
                onClick={() => setShowStripeForm(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Adicionar Cartão
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-3 transition-all ${
                    method.isDefault
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <CardIcon brand={method.card.brand} size="w-10 h-10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            Cartão {method.card.brand.charAt(0).toUpperCase() + method.card.brand.slice(1)}
                          </p>
                          {method.isDefault && (
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs font-mono truncate">**** {method.card.last4}</p>
                        <p className="text-xs text-gray-500">
                          Expira em {String(method.card.exp_month).padStart(2, '0')}/{method.card.exp_year}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!method.isDefault && (
                        <button
                          onClick={() => setDefaultPayment(method.id)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors bg-white rounded border border-gray-200 hover:border-purple-300"
                          title="Definir como padrão"
                        >
                          <FiStar size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => detachPaymentMethod(method.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white rounded border border-gray-200 hover:border-red-300"
                        title="Remover cartão"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chaves PIX */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Minhas Chaves PIX</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {pixKeys.length} chaves
            </span>
          </div>

          {pixKeys.length === 0 ? (
            <div className="text-center py-6">
              <SiPix className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-500 mb-3">Nenhuma chave PIX cadastrada</p>
              <button
                onClick={addPixKey}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Adicionar PIX
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pixKeys.map((pix) => (
                <div
                  key={pix.id}
                  className={`border rounded-lg p-3 transition-all ${
                    pix.isDefault
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <SiPix size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            PIX - {pix.type.toUpperCase()}
                          </p>
                          {pix.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs font-mono break-all">{pix.key}</p>
                        <p className="text-xs text-gray-500">
                          Cadastrada em {pix.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!pix.isDefault && (
                        <button
                          onClick={() => setDefaultPix(pix.id)}
                          className="p-1.5 text-gray-400 hover:text-green-600 transition-colors bg-white rounded border border-gray-200 hover:border-green-300"
                          title="Definir como padrão"
                        >
                          <FiCheck size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => removePixKey(pix.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white rounded border border-gray-200 hover:border-red-300"
                        title="Remover chave"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Transações */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h3 className="font-semibold text-gray-900 text-lg">Histórico de Pagamentos</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full shrink-0">
            {transactions.length} transações
          </span>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                  <FiShoppingBag className="text-red-600" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500 truncate">{transaction.paymentMethod}</p>
                  <p className="text-xs text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="font-bold text-gray-900 text-sm whitespace-nowrap">R$ {transaction.amount.toFixed(2)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)} font-medium inline-block mt-0.5 whitespace-nowrap`}>
                  {getStatusText(transaction.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estatísticas e Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Resumo Financeiro</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
              <span className="text-gray-700 font-medium">Total gasto</span>
              <span className="font-bold text-red-600 whitespace-nowrap">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded border border-purple-200">
              <span className="text-gray-700 font-medium">Compras realizadas</span>
              <span className="font-bold text-purple-600 whitespace-nowrap">{transactions.length}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Método preferido</span>
              <span className="font-bold text-green-600 text-xs whitespace-nowrap">
                {paymentMethods.find(m => m.isDefault) ? 'Cartão' : 'PIX'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiLock className="text-green-500" size={20} />
            <h3 className="font-semibold text-gray-900">Segurança</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">Pagamentos criptografados</span>
              <span className="text-green-600 font-bold whitespace-nowrap">Ativo</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
              <span className="text-gray-700 font-medium">Proteção Stripe</span>
              <span className="text-blue-600 font-bold whitespace-nowrap">Ativa</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700 font-medium">PIX Seguro</span>
              <span className="text-green-600 font-bold whitespace-nowrap">Ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Stripe */}
      {showStripeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Cartão</h3>
              <button
                onClick={() => setShowStripeForm(false)}
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="text-center mb-6">
                <FiCreditCard className="mx-auto text-purple-600 mb-3" size={48} />
                <h4 className="font-semibold text-gray-900 mb-2">Pagamento Seguro com Stripe</h4>
                <p className="text-gray-600 text-sm">
                  Seus dados são processados diretamente pelo Stripe e nunca armazenados em nossos servidores.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <div className="flex justify-center space-x-2 mb-3">
                  <div className="w-10 h-6 bg-[#1A1F71] rounded"></div>
                  <div className="w-10 h-6 bg-[#EB001B] rounded"></div>
                  <div className="w-10 h-6 bg-[#016FD0] rounded"></div>
                </div>
                <p className="text-xs text-gray-400">
                  Integração segura com Stripe Elements
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStripeForm(false)}
                  disabled={processing}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleStripeIntegration}
                  disabled={processing}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-medium disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <FiExternalLink size={16} />
                      <span>Continuar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTab;