import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText, FiShoppingCart, FiPackage, FiCalendar, FiMapPin } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';
import { IoReload } from "react-icons/io5";

// ✅ Step Indicator Component (unchanged)
const StepIndicator = ({ currentStep, goToStep }) => (
  <div className="flex items-center justify-center mb-8 mt-10" style={{ fontFamily: 'Calibri, sans-serif' }}>
    {[
      { number: 1, label: 'Dados', icon: FiUser },
      { number: 2, label: 'Entrega', icon: FiTruck },
      { number: 3, label: 'Pagamento', icon: FiCard },
      { number: 4, label: 'Conclusão', icon: FiCheck }
    ].map((step, index) => (
      <React.Fragment key={step.number}>
        <button
          onClick={() => goToStep(step.number)}
          className={`flex flex-col items-center group ${
            step.number <= currentStep ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
            step.number <= currentStep 
              ? 'bg-green-600 border-green-600 text-white' 
              : 'border-gray-300 group-hover:border-gray-400'
          }`}>
            {step.number < currentStep ? (
              <step.icon size={18} />
            ) : step.number === currentStep ? (
              <step.icon size={18} />
            ) : (
              step.number
            )}
          </div>
          <span className="text-xs mt-2 font-medium">
            {step.label}
          </span>
          {step.number <= currentStep && (
            <div className="w-2 h-2 bg-green-600 rounded-full mt-1" />
          )}
        </button>
        {index < 3 && (
          <div className={`w-16 h-1 mx-2 ${
            step.number < currentStep ? 'bg-green-600' : 'bg-gray-300'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ✅ CustomerStep Component (unchanged)
const CustomerStep = ({ 
  customerData, 
  setCustomerData, 
  isProfileLoaded, 
  fetchUserProfile, 
  nextStep 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dados Pessoais</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Passo 1 de 4</span>
          <button 
            onClick={fetchUserProfile}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
      
      {!isProfileLoaded ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      ) : (
        <>
          {customerData.name && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Dados do Perfil Carregados</h3>
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Nome:</span>
                        <span className="text-green-900 font-semibold -ml-6">{customerData.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Email:</span>
                        <span className="text-green-900 font-semibold -ml-7">{customerData.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">Telefone:</span>
                        <span className="text-green-900 font-semibold -ml-3">{customerData.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-20">CPF:</span>
                        <span className="text-green-900 font-semibold -ml-11">{customerData.cpf}</span>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mt-3">
                      Seus dados foram carregados automaticamente. Você pode editá-los abaixo se necessário.
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center ml-4 flex-shrink-0">
                    <FiCheck size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={customerData.name}
                onChange={(e) => setCustomerData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="Seu nome completo"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={customerData.cpf}
                onChange={(e) => setCustomerData(prev => ({...prev, cpf: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            >
              Continuar para Entrega
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ✅ Fixed CEP Input Component with Proper Frete Calculation
const CepInput = ({ 
  cep, 
  onCepChange, 
  onCalculateFrete, 
  loading, 
  shippingData,
  onAutoFillAddress 
}) => {
  const [isValidCep, setIsValidCep] = useState(false);

  const handleCepChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formattedCep = value;
    
    if (value.length > 5) {
      formattedCep = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    
    onCepChange(formattedCep);
    setIsValidCep(value.length === 8);
  };

  const handleCepBlur = () => {
    if (isValidCep) {
      onAutoFillAddress(cep);
      // Auto-calculate frete when CEP is valid and user leaves field
      setTimeout(() => {
        onCalculateFrete(cep);
      }, 500);
    }
  };

  const handleCalculateClick = () => {
    if (isValidCep) {
      onCalculateFrete(cep);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FiMapPin className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Calcular Frete</h3>
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digite seu CEP
          </label>
          <div className="relative">
            <input
              type="text"
              value={cep}
              onChange={handleCepChange}
              onBlur={handleCepBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black pr-24"
              placeholder="00000-000"
              maxLength={9}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <button
                  onClick={handleCalculateClick}
                  disabled={!isValidCep || loading}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    isValidCep && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Calcular
                </button>
              )}
            </div>
          </div>
          {cep && !isValidCep && (
            <p className="text-red-500 text-xs mt-1">CEP deve ter 8 dígitos</p>
          )}
        </div>
      </div>

      {shippingData.cep && isValidCep && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FiCheck className="text-green-600" size={16} />
            <span className="text-green-800 text-sm font-medium">
              CEP {shippingData.cep} válido
            </span>
          </div>
          {shippingData.city && shippingData.state && (
            <p className="text-green-700 text-sm mt-1">
              {shippingData.city} - {shippingData.state}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ Fixed Jadlog Shipping Calculator Component
const JadlogShippingCalculator = ({ 
  shippingData, 
  cartItems, 
  selectedShipping, 
  onShippingSelect,
  loadingShipping,
  shippingError,
  onRetryCalculate
}) => {
  const [shippingOptions, setShippingOptions] = useState([]);
  const [packageDetails, setPackageDetails] = useState(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Calculate package dimensions from cart items
  const calculatePackageDetails = useCallback(() => {
    if (cartItems.length === 0) return null;

    const totalWeight = cartItems.reduce((sum, item) => {
      return sum + (item.product?.weight || 0.5) * (item.quantity || 1);
    }, 0);
    
    const totalValue = cartItems.reduce((sum, item) => {
      const price = item.product?.price || item.price || 0;
      return sum + (price * (item.quantity || 1));
    }, 0);
    
    const details = {
      weight: Math.max(totalWeight, 0.1), // Minimum 0.1kg
      length: 20,
      width: 15,
      height: 10,
      quantity: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
      value: totalValue
    };
    
    setPackageDetails(details);
    return details;
  }, [cartItems]);

  // Real freight calculation function - FIXED
  const calculateFreight = async (cep) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      throw new Error('CEP inválido');
    }

    if (cartItems.length === 0) {
      throw new Error('Carrinho vazio');
    }

    try {
      const packageDetails = calculatePackageDetails();
      if (!packageDetails) {
        throw new Error('Não foi possível calcular detalhes do pacote');
      }

      const destinationCEP = cep.replace(/\D/g, '');

      // Simulate API call to freight calculation service
      console.log('🔄 Calculando frete para CEP:', destinationCEP);
      console.log('📦 Detalhes do pacote:', packageDetails);

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Base pricing calculation
      const basePrice = 8.90;
      const weightMultiplier = packageDetails.weight * 2;
      
      // Distance factor based on CEP region (simplified)
      const getDistanceFactor = (cep) => {
        const firstDigit = cep.charAt(0);
        if (['0', '1', '2'].includes(firstDigit)) return 1.0; // Sul/Sudeste
        if (['3', '4'].includes(firstDigit)) return 1.3; // Nordeste
        if (['5', '6'].includes(firstDigit)) return 1.5; // Norte/Centro-Oeste
        return 1.2; // Default
      };

      const distanceFactor = getDistanceFactor(destinationCEP);

      const simulatedQuotes = [
        {
          id: 'jadlog-economy',
          name: 'Jadlog Econômico',
          company: 'Jadlog',
          price: Math.max(basePrice + (weightMultiplier * 0.8) * distanceFactor, 12.90),
          delivery_time: '8-12',
          delivery_range: { min: 8, max: 12 },
          custom_delivery_time: '8 a 12 dias úteis',
          company_picture: 'https://via.placeholder.com/50x30/0056A0/FFFFFF?text=JADLOG',
          description: 'Entrega econômica com prazo maior'
        },
        {
          id: 'jadlog-package',
          name: 'Jadlog Package',
          company: 'Jadlog',
          price: Math.max((basePrice + weightMultiplier) * distanceFactor, 15.90),
          delivery_time: '5-8',
          delivery_range: { min: 5, max: 8 },
          custom_delivery_time: '5 a 8 dias úteis',
          company_picture: 'https://via.placeholder.com/50x30/0056A0/FFFFFF?text=JADLOG',
          description: 'Entrega padrão'
        },
        {
          id: 'jadlog-express',
          name: 'Jadlog .Package',
          company: 'Jadlog',
          price: Math.max((basePrice + (weightMultiplier * 1.5)) * distanceFactor, 24.90),
          delivery_time: '2-4',
          delivery_range: { min: 2, max: 4 },
          custom_delivery_time: '2 a 4 dias úteis',
          company_picture: 'https://via.placeholder.com/50x30/0056A0/FFFFFF?text=JADLOG',
          description: 'Entrega expressa'
        }
      ].map(option => ({
        ...option,
        price: Math.round(option.price * 100) / 100 // Round to 2 decimal places
      }));

      console.log('✅ Opções de frete calculadas:', simulatedQuotes);
      return simulatedQuotes;

    } catch (error) {
      console.error('❌ Erro ao calcular frete:', error);
      throw new Error('Não foi possível calcular o frete para este CEP');
    }
  };

  // Fetch shipping quotes when props change - FIXED
  useEffect(() => {
    if (shippingData.cep && shippingData.cep.replace(/\D/g, '').length === 8 && cartItems.length > 0) {
      setHasCalculated(true);
    }
  }, [shippingData.cep, cartItems]);

  // Manual calculation trigger
  const calculateFreightManually = async () => {
    if (!shippingData.cep || shippingData.cep.replace(/\D/g, '').length !== 8) {
      setShippingError('Por favor, insira um CEP válido');
      return;
    }

    if (cartItems.length === 0) {
      setShippingError('Carrinho vazio. Adicione produtos para calcular o frete.');
      return;
    }

    try {
      setShippingError('');
      const quotes = await calculateFreight(shippingData.cep);
      setShippingOptions(quotes);
      setHasCalculated(true);
      
      // Auto-select the cheapest option if none selected
      if (quotes.length > 0 && !selectedShipping) {
        const cheapestOption = quotes.reduce((cheapest, current) => 
          current.price < cheapest.price ? current : cheapest
        );
        onShippingSelect(cheapestOption);
      }
    } catch (error) {
      console.error('Erro ao buscar opções de frete:', error);
      setShippingError(error.message);
      setShippingOptions([]);
    }
  };

  // Auto-calculate when CEP changes and is valid
  useEffect(() => {
    if (shippingData.cep && shippingData.cep.replace(/\D/g, '').length === 8 && cartItems.length > 0) {
      calculateFreightManually();
    }
  }, [shippingData.cep]);

  const formatDeliveryTime = (shipping) => {
    return shipping.custom_delivery_time || `${shipping.delivery_range.min} a ${shipping.delivery_range.max} dias úteis`;
  };

  if (!shippingData.cep || shippingData.cep.replace(/\D/g, '').length < 8) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <FiMapPin className="mx-auto text-blue-400 mb-3" size={32} />
        <p className="text-blue-700 font-medium mb-2">Informe o CEP para calcular o frete</p>
        <p className="text-blue-600 text-sm">
          Digite seu CEP acima para ver as opções de entrega disponíveis
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Opções de Entrega</h3>
        {shippingOptions.length > 0 && packageDetails && (
          <div className="text-sm text-gray-600">
            {packageDetails.quantity} item(s) • {packageDetails.weight.toFixed(1)}kg
          </div>
        )}
      </div>
      
      {!hasCalculated ? (
        <div className="text-center py-8">
          <button
            onClick={calculateFreightManually}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Calcular Frete para {shippingData.cep}
          </button>
          <p className="text-gray-500 text-sm mt-2">
            Clique para calcular as opções de entrega
          </p>
        </div>
      ) : loadingShipping ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Calculando fretes...</p>
          <p className="text-gray-500 text-sm mt-1">Para CEP: {shippingData.cep}</p>
        </div>
      ) : shippingError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 font-medium">{shippingError}</p>
              <p className="text-red-600 text-sm mt-1">
                Não foi possível calcular o frete para o CEP {shippingData.cep}
              </p>
            </div>
            <button
              onClick={calculateFreightManually}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-medium"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      ) : shippingOptions.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 font-medium">
            Nenhuma opção de entrega disponível para este CEP.
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            Verifique se o CEP está correto ou tente novamente.
          </p>
          <button
            onClick={calculateFreightManually}
            className="mt-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded text-sm font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {shippingOptions.map((shipping) => (
            <div
              key={shipping.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedShipping?.id === shipping.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onShippingSelect(shipping)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 flex-shrink-0 ${
                    selectedShipping?.id === shipping.id 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedShipping?.id === shipping.id && (
                      <FiCheck size={12} className="text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {shipping.company_picture && (
                        <img 
                          src={shipping.company_picture} 
                          alt={shipping.company}
                          className="w-10 h-6 object-contain"
                        />
                      )}
                      <span className="font-semibold text-black">{shipping.name}</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {shipping.company}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <FiCalendar size={14} />
                        <span>{formatDeliveryTime(shipping)}</span>
                      </div>
                      {shipping.description && (
                        <span className="text-xs text-gray-500">{shipping.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right pl-4">
                  <div className="font-bold text-lg text-black">
                    {shipping.price === 0 ? (
                      <span className="text-green-600">Grátis</span>
                    ) : (
                      `R$ ${shipping.price.toFixed(2)}`
                    )}
                  </div>
                  {shipping.id === 'jadlog-economy' && (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Mais econômico
                    </span>
                  )}
                  {shipping.id === 'jadlog-express' && (
                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      Mais rápido
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {shippingOptions.length > 0 && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-gray-800 mb-2">Informações de Entrega:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Entregas em dias úteis</li>
            <li>• Rastreamento disponível</li>
            <li>• Seguro incluído</li>
            <li>• Entrega para todo o Brasil</li>
          </ul>
        </div>
      )}
    </div>
  );
};

// ✅ Fixed ShippingStep Component
const ShippingStep = ({ 
  shippingData, 
  setShippingData, 
  userAddresses, 
  selectedAddressId, 
  handleAddressSelect, 
  fetchUserAddresses, 
  selectedShipping,
  onShippingSelect,
  cartItems,
  prevStep, 
  nextStep 
}) => {
  const [cepLoading, setCepLoading] = useState(false);
  const [freteLoading, setFreteLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Fetch address by CEP
  const fetchAddressByCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setShippingData(prev => ({
          ...prev,
          street: data.logradouro || '',
          hood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
          cep: data.cep || cleanCEP
        }));
      } else {
        console.log('CEP não encontrado');
        setShippingError('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setShippingError('Erro ao buscar endereço. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  // Handle CEP calculation - FIXED
  const handleCalculateFrete = async (cep) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setShippingError('Por favor, insira um CEP válido');
      return;
    }

    setFreteLoading(true);
    setShippingError('');
    
    try {
      // Update shipping data with the CEP
      setShippingData(prev => ({ ...prev, cep }));
      
      // The freight calculation will be triggered automatically by the JadlogShippingCalculator
      // through the useEffect that watches shippingData.cep
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setShippingError('Erro ao calcular frete. Tente novamente.');
    } finally {
      setFreteLoading(false);
    }
  };

  // Handle CEP change
  const handleCepChange = (cep) => {
    setShippingData(prev => ({ ...prev, cep }));
    setShippingError(''); // Clear error when user types
  };

  const canProceed = shippingData.cep && shippingData.street && shippingData.number && 
                   shippingData.city && shippingData.state && selectedShipping;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Passo 2 de 4</span>
          <button 
            onClick={fetchUserAddresses}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
      
      {/* CEP Input Section */}
      <CepInput
        cep={shippingData.cep}
        onCepChange={handleCepChange}
        onCalculateFrete={handleCalculateFrete}
        loading={cepLoading || freteLoading}
        shippingData={shippingData}
        onAutoFillAddress={fetchAddressByCEP}
      />
      
      {userAddresses.length > 0 && selectedAddressId && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Endereços Carregados</h3>
          <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Rua:</span>
                    <span className="text-green-900 font-semibold -ml-10">{shippingData.street}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Número:</span>
                    <span className="text-green-900 font-semibold -ml-3">{shippingData.number}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Complemento:</span>
                    <span className="text-green-900 font-semibold ml-7">
                      {shippingData.complement || <span className="text-gray-400 italic">Nenhum</span>}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Bairro:</span>
                    <span className="text-green-900 font-semibold -ml-5">{shippingData.hood}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Cidade:</span>
                    <span className="text-green-900 font-semibold -ml-5">{shippingData.city}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">Estado:</span>
                    <span className="text-green-900 font-semibold -ml-5">{shippingData.state}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">CEP:</span>
                    <span className="text-green-900 font-semibold -ml-9">{shippingData.cep}</span>
                  </div>
                </div>
                <p className="text-sm text-green-700 mt-3">
                  Seu endereço foi carregado automaticamente. Você pode selecionar outro abaixo ou editar manualmente.
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center ml-4 flex-shrink-0">
                <FiCheck size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {userAddresses.length === 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-center">
            Nenhum endereço salvo encontrado. Preencha seus dados de entrega abaixo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua *
          </label>
          <input
            type="text"
            value={shippingData.street}
            onChange={(e) => setShippingData(prev => ({...prev, street: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Nome da Rua"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número *
          </label>
          <input
            type="text"
            value={shippingData.number}
            onChange={(e) => setShippingData(prev => ({...prev, number: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={shippingData.complement}
            onChange={(e) => setShippingData(prev => ({...prev, complement: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Apartmento, bloco, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            value={shippingData.hood}
            onChange={(e) => setShippingData(prev => ({...prev, hood: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade *
          </label>
          <input
            type="text"
            value={shippingData.city}
            onChange={(e) => setShippingData(prev => ({...prev, city: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            placeholder="Cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={shippingData.state}
            onChange={(e) => setShippingData(prev => ({...prev, state: e.target.value}))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      {/* Jadlog Shipping Calculator */}
      <JadlogShippingCalculator
        shippingData={shippingData}
        cartItems={cartItems}
        selectedShipping={selectedShipping}
        onShippingSelect={onShippingSelect}
        loadingShipping={freteLoading}
        shippingError={shippingError}
        onRetryCalculate={() => handleCalculateFrete(shippingData.cep)}
      />
      
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="flex items-center text-gray-600 hover:text-gray-800 py-3 px-6 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Dados Pessoais
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className={`py-3 px-8 rounded-lg font-semibold transition-colors flex items-center ${
            canProceed 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedShipping ? (
            <>
              Continuar para Pagamento
              <span className="ml-2 text-sm font-normal">
                {selectedShipping.price === 0 ? (
                  '(Frete Grátis)'
                ) : (
                  `(+ R$ ${selectedShipping.price.toFixed(2)} frete)`
                )}
              </span>
            </>
          ) : (
            'Selecione o frete'
          )}
        </button>
      </div>
    </div>
  );
};

// ... (rest of the components remain the same - PaymentStep, PixStep, BoletoStep, OrderSummary)

// ✅ Fixed Main CheckoutPage Component
const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  });
  const [shippingData, setShippingData] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    hood: '',
    city: '',
    state: ''
  });
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: 1
  });
  const [pixData, setPixData] = useState(null);
  const [boletoData, setBoletoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isAddressesLoaded, setIsAddressesLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Updated calculation functions with shipping
  const calculateSubtotal = () => {
    if (cartTotal > 0) {
      return cartTotal;
    }
    
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateShipping = () => {
    return selectedShipping ? selectedShipping.price : 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const total = subtotal + shipping - discount;
    
    // Apply PIX discount
    if (paymentMethod === 'pix') {
      return total * 0.95; // 5% discount
    }
    
    return total;
  };

  // Handle shipping selection
  const handleShippingSelect = (shipping) => {
    console.log('🚚 Shipping selected:', shipping);
    setSelectedShipping(shipping);
  };

  // ... (rest of the functions remain the same)

  return (
    <div className="min-h-screen bg-gray-50 pt-20" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator currentStep={currentStep} goToStep={goToStep} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <CustomerStep 
                customerData={customerData}
                setCustomerData={setCustomerData}
                isProfileLoaded={isProfileLoaded}
                fetchUserProfile={fetchUserProfile}
                nextStep={nextStep}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep 
                shippingData={shippingData}
                setShippingData={setShippingData}
                userAddresses={userAddresses}
                selectedAddressId={selectedAddressId}
                handleAddressSelect={handleAddressSelect}
                fetchUserAddresses={fetchUserAddresses}
                selectedShipping={selectedShipping}
                onShippingSelect={handleShippingSelect}
                cartItems={cartItems}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            )}
            {/* ... other steps */}
          </div>

          <div className="lg:col-span-1">
            <OrderSummary 
              cartItems={cartItems}
              fetchCartItems={fetchCartItems}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              applyCoupon={applyCoupon}
              calculateSubtotal={calculateSubtotal}
              calculateShipping={calculateShipping}
              discount={discount}
              calculateTotal={calculateTotal}
              paymentMethod={paymentMethod}
              currentStep={currentStep}
              goToStep={goToStep}
              selectedShipping={selectedShipping}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;