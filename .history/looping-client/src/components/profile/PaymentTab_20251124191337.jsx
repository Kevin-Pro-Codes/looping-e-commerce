import React, { useState, useEffect } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiLock,
  FiShoppingBag,
  FiX,
  FiExternalLink,
  FiShield,
  FiCheck
} from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

// Skeleton Loading Component
const PaymentTabSkeleton = () => {
  return (
    <div className="w-full min-w-0 space-y-4 p-3 max-w-xl mx-auto animate-pulse">
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4">
        <div className="text-center">
          <div className="h-6 bg-purple-500 rounded w-40 mx-auto mb-2"></div>
          <div className="h-4 bg-purple-400 rounded w-56 mx-auto"></div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="h-5 bg-gray-200 rounded w-36 mx-auto mb-3"></div>
        <div className="space-y-3">
          {[1].map((item) => (
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
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [pixKeys, setPixKeys] = useState([]);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      
      // Dados mockados das chaves PIX
      setPixKeys([
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
      ]);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Integração com Stripe - Adicionar método de pagamento seguro
  const handleStripeIntegration = async () => {
    try {
      setProcessing(true);
      
      // Simular processo de integração com Stripe
      console.log('🔄 Iniciando integração segura com Stripe...');
      
      // Na prática, aqui você:
      // 1. Criaria um Setup Intent no backend
      // 2. Inicializaria o Stripe Elements
      // 3. Coletaria dados do cartão de forma SEGURA (nunca no seu servidor)
      // 4. Receberia apenas um token seguro (pm_xxx)
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulação de sucesso
      alert('✅ Cartão adicionado com segurança via Stripe!');
      console.log('💳 Payment Method criado com ID: pm_1ABC123xyz');
      
    } catch (error) {
      console.error('❌ Erro na integração com Stripe:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessing(false);
      setShowStripeModal(false);
    }
  };

  // Adicionar nova chave PIX
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

  // Remover chave PIX
  const removePixKey = (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta chave PIX?')) return;
    
    setPixKeys(prev => prev.filter(key => key.id !== id));
    alert('Chave PIX removida!');
  };

  // Definir chave PIX como padrão
  const setDefaultPix = (id) => {
    setPixKeys(prev =>
      prev.map(key => ({
        ...key,
        isDefault: key.id === id
      }))
    );
    alert('Chave PIX definida como padrão!');
  };

  if (loading) {
    return <PaymentTabSkeleton />;
  }

  return (
    <div className="w-full min-w-0 space-y-4 p-3 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-red-700 rounded-xl p-4 text-white text-center">
        <h1 className="text-xl font-bold mb-2">Looping Pagamentos</h1>
        <p className="text-purple-100 text-sm mb-3">Pagamentos 100% seguros</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={() => setShowStripeModal(true)}
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

      {/* Seção PIX */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-semibold text-gray-900 text-center sm:text-left">
            Minhas Chaves PIX
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {pixKeys.length} chaves
          </span>
        </div>

        {pixKeys.length === 0 ? (
          <div className="text-center py-8">
            <SiPix className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500 mb-4">Nenhuma chave PIX cadastrada</p>
            <button
              onClick={addPixKey}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Adicionar Primeira Chave
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pixKeys.map((pix) => (
              <div
                key={pix.id}
                className={`border rounded-lg p-4 transition-all ${
                  pix.isDefault
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <SiPix size={24} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          Chave PIX - {pix.type.toUpperCase()}
                        </p>
                        {pix.isDefault && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm font-mono break-all">{pix.key}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cadastrada em {pix.createdAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start space-x-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:border-none">
                    {!pix.isDefault && (
                      <button
                        onClick={() => setDefaultPix(pix.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-green-300"
                        title="Definir como padrão"
                      >
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => removePixKey(pix.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-300"
                      title="Remover chave"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações de Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Segurança Stripe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiShield className="text-purple-500" size={20} />
            <h3 className="font-semibold text-gray-900">Pagamento com Cartão</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Processamento 100% seguro via Stripe. Seus dados de cartão nunca são armazenados em nossos servidores.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded border border-purple-200">
              <FiLock className="text-purple-600" size={14} />
              <span className="text-gray-700">Dados criptografados</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded border border-purple-200">
              <FiShield className="text-purple-600" size={14} />
              <span className="text-gray-700">Certificação PCI Nível 1</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded border border-green-200">
              <SiPix className="text-green-600" size={14} />
              <span className="text-gray-700">Processamento seguro</span>
            </div>
          </div>
        </div>

        {/* Vantagens PIX */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <SiPix className="text-green-500" size={20} />
            <h3 className="font-semibold text-gray-900">Vantagens do PIX</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700">Pagamento instantâneo</span>
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700">Sem taxas</span>
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700">Disponível 24/7</span>
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
              <span className="text-gray-700">Totalmente seguro</span>
              <span className="text-green-600 font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Como Funciona */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-center">Como Funciona</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiCreditCard className="text-purple-600" size={20} />
            </div>
            <h4 className="font-semibold text-sm mb-1">Cartão Seguro</h4>
            <p className="text-xs text-gray-600">Dados processados diretamente pelo Stripe</p>
          </div>
          <div className="p-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <SiPix className="text-green-600" size={20} />
            </div>
            <h4 className="font-semibold text-sm mb-1">PIX Instantâneo</h4>
            <p className="text-xs text-gray-600">Pagamento rápido sem intermediários</p>
          </div>
          <div className="p-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiShield className="text-blue-600" size={20} />
            </div>
            <h4 className="font-semibold text-sm mb-1">Segurança</h4>
            <p className="text-xs text-gray-600">Seus dados sempre protegidos</p>
          </div>
        </div>
      </div>

      {/* Modal Stripe Seguro */}
      {showStripeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pagamento Seguro</h3>
              <button
                onClick={() => setShowStripeModal(false)}
                disabled={processing}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiLock className="text-purple-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Processamento Seguro Stripe</h4>
                <p className="text-gray-600 text-sm">
                  Seus dados de cartão são criptografados e processados diretamente pelo Stripe.
                  <strong> Nunca armazenamos informações sensíveis.</strong>
                </p>
              </div>

              {/* Área para Stripe Elements */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                <div className="flex justify-center space-x-3 mb-3">
                  <div className="w-12 h-8 bg-[#1A1F71] rounded shadow-sm"></div>
                  <div className="w-12 h-8 bg-[#EB001B] rounded shadow-sm"></div>
                  <div className="w-12 h-8 bg-[#016FD0] rounded shadow-sm"></div>
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  Campos seguros do Stripe Elements
                </p>
                <p className="text-xs text-gray-400">
                  Número do cartão, data, CVV - tudo processado com segurança
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <FiShield className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                  <p className="text-green-800 text-xs">
                    <strong>PCI Compliant:</strong> Seus dados são processados com o mais alto 
                    padrão de segurança do setor. Números de cartão nunca chegam aos nossos servidores.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStripeModal(false)}
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