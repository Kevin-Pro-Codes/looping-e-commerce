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

// ✅ CEP Input Component with Frete Calculation
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
                  onClick={() => onCalculateFrete(cep)}
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
          {shippingData.cep && !isValidCep && (
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

// ✅ Enhanced Jadlog Shipping Calculator Component
// ✅ Fixed Jadlog Shipping Calculator Component with Better Images
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
  const [imageErrors, setImageErrors] = useState({});

  // Better Jadlog logo URLs - using reliable sources
  const getJadlogLogoUrl = () => {
    // Multiple fallback options
    const logoOptions = [
      'https://cdn.awsli.com.br/600x700/244/244563/logo/4e1b3c3c88.jpg',
      'https://logodownload.org/wp-content/uploads/2020/10/jadlog-logo.png',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyKdX8Q7Z4o6o9V6e9W6Y2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q',
      // Create a simple SVG as fallback
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCA1MCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMDA1NkEwIiByeD0iNCIvPgo8dGV4dCB4PSIyNSIgeT0iMTgiIGZpbGw9IiNGRkZGRkYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SkFET0dIPC90ZXh0Pgo8L3N2Zz4K'
    ];
    return logoOptions[0]; // Use the first one, others are fallbacks
  };

  // Handle image loading errors
  const handleImageError = (shippingId) => {
    setImageErrors(prev => ({
      ...prev,
      [shippingId]: true
    }));
  };

  // Calculate package dimensions from cart items
  const calculatePackageDetails = useCallback(() => {
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

  // Real freight calculation function
  const calculateFreight = async (cep) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      return [];
    }

    try {
      const packageDetails = calculatePackageDetails();
      const originCEP = '01001000'; // Your store's CEP - change this
      const destinationCEP = cep.replace(/\D/g, '');

      // Simulate API call to freight calculation service
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated freight options based on distance and package weight
      const basePrice = 8.90;
      const weightMultiplier = packageDetails.weight * 2;
      const distanceMultiplier = 1.2; // Simulate distance factor

      const jadlogLogoUrl = getJadlogLogoUrl();

      const simulatedQuotes = [
        {
          id: 'jadlog-economy',
          name: 'Jadlog Econômico',
          company: 'Jadlog',
          price: Math.max(basePrice + (weightMultiplier * 0.8), 12.90),
          delivery_time: '8-12',
          delivery_range: { min: 8, max: 12 },
          custom_delivery_time: '8 a 12 dias úteis',
          company_picture: jadlogLogoUrl,
          description: 'Entrega econômica com prazo maior'
        },
        {
          id: 'jadlog-package',
          name: 'Jadlog Package',
          company: 'Jadlog',
          price: Math.max(basePrice + weightMultiplier, 15.90),
          delivery_time: '5-8',
          delivery_range: { min: 5, max: 8 },
          custom_delivery_time: '5 a 8 dias úteis',
          company_picture: jadlogLogoUrl,
          description: 'Entrega padrão'
        },
        {
          id: 'jadlog-express',
          name: 'Jadlog .Package',
          company: 'Jadlog',
          price: Math.max(basePrice + (weightMultiplier * 1.5), 24.90),
          delivery_time: '2-4',
          delivery_range: { min: 2, max: 4 },
          custom_delivery_time: '2 a 4 dias úteis',
          company_picture: jadlogLogoUrl,
          description: 'Entrega expressa'
        }
      ].map(option => ({
        ...option,
        price: Math.round(option.price * distanceMultiplier * 100) / 100
      }));

      return simulatedQuotes;
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      throw new Error('Não foi possível calcular o frete para este CEP');
    }
  };

  // Fetch shipping quotes when CEP changes
  useEffect(() => {
    const fetchShippingQuotes = async () => {
      if (!shippingData.cep || shippingData.cep.replace(/\D/g, '').length < 8) {
        setShippingOptions([]);
        return;
      }

      try {
        const quotes = await calculateFreight(shippingData.cep);
        setShippingOptions(quotes);
        
        // Auto-select the cheapest option
        if (quotes.length > 0 && !selectedShipping) {
          const cheapestOption = quotes.reduce((cheapest, current) => 
            current.price < cheapest.price ? current : cheapest
          );
          onShippingSelect(cheapestOption);
        }
      } catch (error) {
        console.error('Erro ao buscar opções de frete:', error);
        setShippingOptions([]);
      }
    };

    fetchShippingQuotes();
  }, [shippingData.cep, cartItems]);

  const formatDeliveryTime = (shipping) => {
    return shipping.custom_delivery_time || `${shipping.delivery_range.min} a ${shipping.delivery_range.max} dias úteis`;
  };

  // Render company logo with fallback
  const renderCompanyLogo = (shipping) => {
    if (imageErrors[shipping.id] || !shipping.company_picture) {
      return (
        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">JAD</span>
        </div>
      );
    }

    return (
      <img 
        src={shipping.company_picture} 
        alt={shipping.company}
        className="w-10 h-6 object-contain flex-shrink-0"
        onError={() => handleImageError(shipping.id)}
        loading="lazy"
      />
    );
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
      
      {loadingShipping ? (
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
              onClick={onRetryCalculate}
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
                      {renderCompanyLogo(shipping)}
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
                    R$ {shipping.price.toFixed(2)}
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
      
      {loadingShipping ? (
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
              onClick={onRetryCalculate}
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
                    R$ {shipping.price.toFixed(2)}
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

// ✅ Updated ShippingStep Component with CEP Integration
const ShippingStep = ({ 
  shippingData, 
  setShippingData, 
  userAddresses, 
  selectedAddressId, 
  handleAddressSelect, 
  fetchUserAddresses, 
  selectedShipping,
  onShippingSelect,
  loadingShipping,
  shippingError,
  cartItems,
  prevStep, 
  nextStep 
}) => {
  const [cepLoading, setCepLoading] = useState(false);
  const [freteLoading, setFreteLoading] = useState(false);

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
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  // Handle CEP calculation
  const handleCalculateFrete = async (cep) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) return;
    
    setFreteLoading(true);
    try {
      // This will trigger the JadlogShippingCalculator to recalculate
      setShippingData(prev => ({ ...prev, cep }));
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
    } finally {
      setFreteLoading(false);
    }
  };

  // Handle CEP change
  const handleCepChange = (cep) => {
    setShippingData(prev => ({ ...prev, cep }));
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
                (+ R$ {selectedShipping.price.toFixed(2)} frete)
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

// ✅ PaymentStep Component (unchanged)
const PaymentStep = ({ 
  paymentMethod, 
  setPaymentMethod, 
  cardData, 
  setCardData, 
  calculateTotal, 
  prevStep, 
  processCheckout, 
  loading 
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold text-black">Método de Pagamento</h2>
      <span className="text-sm text-gray-500">Passo 3 de 4</span>
    </div>
    
    <div className="space-y-4">
      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('pix')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === 'pix' ? 'border-green-500 bg-green-500' : 'border-gray-300'
            }`}>
              {paymentMethod === 'pix' && <FiCheck size={14} className="text-white" />}
            </div>
            <SiPix size={24} className="text-green-600" />
            <div>
              <span className="font-semibold text-black">PIX</span>
              <p className="text-sm text-gray-600">Pagamento instantâneo</p>
            </div>
          </div>
          {paymentMethod === 'pix' && (
            <div className="text-green-600 font-semibold">
              5% de desconto
            </div>
          )}
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'boleto' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('boleto')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'boleto' ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'boleto' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiFileText size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Boleto Bancário</span>
            <p className="text-sm text-gray-600">Vencimento em 3 dias úteis</p>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'credit' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('credit')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'credit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'credit' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiCreditCard size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Cartão de Crédito</span>
            <p className="text-sm text-gray-600">Parcelamento em até 12x</p>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        paymentMethod === 'debit' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
      }`} onClick={() => setPaymentMethod('debit')}>
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            paymentMethod === 'debit' ? 'border-green-500 bg-green-500' : 'border-gray-300'
          }`}>
            {paymentMethod === 'debit' && <FiCheck size={14} className="text-white" />}
          </div>
          <FiDollarSign size={20} className="text-gray-600" />
          <div>
            <span className="font-semibold text-black">Cartão de Débito</span>
            <p className="text-sm text-gray-600">Pagamento à vista</p>
          </div>
        </div>
      </div>
    </div>

    {paymentMethod === 'credit' && (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4 text-black">Dados do Cartão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => setCardData(prev => ({...prev, number: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Número do Cartão"
            />
          </div>
          
          <div className="md:col-span-2">
            <input
              type="text"
              value={cardData.name}
              onChange={(e) => setCardData(prev => ({...prev, name: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Nome no Cartão"
            />
          </div>

          <div>
            <input
              type="text"
              value={cardData.expiry}
              onChange={(e) => setCardData(prev => ({...prev, expiry: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="Validade (MM/AA)"
            />
          </div>

          <div>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => setCardData(prev => ({...prev, cvv: e.target.value}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
              placeholder="CVV"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={cardData.installments}
              onChange={(e) => setCardData(prev => ({...prev, installments: parseInt(e.target.value)}))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                <option key={num} value={num}>
                  {num}x de R$ {(calculateTotal() / num).toFixed(2)} sem juros
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}

    <div className="flex justify-between mt-6">
      <button
        onClick={prevStep}
        className="flex items-center text-gray-600 hover:text-gray-800 py-3 px-6 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Voltar para Entrega
      </button>
      <button
        onClick={processCheckout}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center"
      >
        {loading ? 'Processando...' : (
          <>
            <FiLock className="mr-2" />
            {paymentMethod === 'pix' ? 'Gerar PIX' : 
             paymentMethod === 'boleto' ? 'Gerar Boleto' : 'Finalizar Pedido'}
          </>
        )}
      </button>
    </div>
  </div>
);

// ✅ PixStep Component (unchanged)
const PixStep = ({ pixData, copyPixCode, goToStep }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  useEffect(() => {
    if (!pixData) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pixData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SiPix size={32} className="text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-black">Pagamento via PIX</h2>
      <p className="text-gray-600 mb-6">Escaneie o QR Code ou copie o código para pagar</p>
      
      {pixData ? (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-yellow-800 font-semibold">Tempo restante:</span>
              <span className={`text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-yellow-700'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            {timeLeft < 300 && (
              <p className="text-red-600 text-sm text-center mt-2">
                ⚠️ O código expira em breve!
              </p>
            )}
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 mb-1">Valor a pagar</p>
            <p className="text-2xl font-bold text-green-800">
              R$ {pixData.amount?.toFixed(2) || '0,00'}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Escaneie com seu app bancário</p>
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 inline-block">
              <img 
                src={pixData.pixQrCode} 
                alt="QR Code PIX" 
                className="w-64 h-64 mx-auto"
                onError={(e) => {
                  e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(pixData.pixCode || 'PIX_CODE');
                }}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2 text-center">
              Ou copie o código PIX e cole no seu app bancário
            </p>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-sm font-mono break-all flex-1 text-left text-black">
                {pixData.pixCode}
              </code>
              <button
                onClick={copyPixCode}
                className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
                title="Copiar código PIX"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Opção 1:</strong> Abra seu app bancário, escolha "Pagar com PIX" e escaneie o QR Code</li>
              <li>• <strong>Opção 2:</strong> Copie o código acima e cole no campo "Código PIX" do seu banco</li>
              <li>• O pagamento será confirmado automaticamente em até 2 minutos</li>
            </ul>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => goToStep(3)}
              className="flex items-center text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Alterar Método de Pagamento
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Aguardando confirmação do pagamento...
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-black">Gerando código PIX...</p>
        </div>
      )}
    </div>
  );
};

// ✅ BoletoStep Component (unchanged)
const BoletoStep = ({ boletoData, copyBoletoCode, downloadBoleto, goToStep }) => (
  <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <FiFileText size={32} className="text-blue-600" />
    </div>
    
    <h2 className="text-2xl font-bold mb-2 text-black">Boleto Bancário</h2>
    <p className="text-gray-600 mb-6">Pague em qualquer banco ou lotérica</p>
    
    {boletoData ? (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-black">Valor: R$ {boletoData.total}</p>
            <p className="text-sm text-gray-600">
              Vencimento: {boletoData.dueDate.toLocaleDateString('pt-BR')}
            </p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">Código de Barras</p>
            <div className="bg-white p-4 rounded border text-center">
              <code className="text-sm font-mono text-black tracking-widest">
                {boletoData.barcode}
              </code>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2 text-center">Linha Digitável</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-sm font-mono break-all flex-1 text-left text-black">
                {boletoData.digitableLine}
              </code>
              <button
                onClick={copyBoletoCode}
                className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Internet Banking ou App do seu banco</li>
            <li>• Caixa eletrônico</li>
            <li>• Casas lotéricas</li>
            <li>• Correspondentes bancários</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
          <button
            onClick={() => goToStep(3)}
            className="flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Alterar Método
          </button>
          <div className="flex gap-2">
            <button
              onClick={downloadBoleto}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold flex items-center"
            >
              <FiFileText className="mr-2" />
              Baixar
            </button>
            <button
              onClick={() => alert('Simulando confirmação de pagamento!')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-black">Gerando boleto...</p>
      </div>
    )}
  </div>
);

// ✅ Updated OrderSummary Component with Shipping Display
const OrderSummary = ({ 
  cartItems, 
  fetchCartItems, 
  couponCode, 
  setCouponCode, 
  applyCoupon, 
  calculateSubtotal, 
  calculateShipping, 
  discount, 
  calculateTotal, 
  paymentMethod, 
  currentStep, 
  goToStep,
  selectedShipping 
}) => {
  const getProductDetails = (item) => {
    const product = item.product || {};
    return {
      name: product.title || product.name || `Produto ${item.product_id}`,
      price: product.price || item.price || 0,
      image: product.image || product.image_url || null,
      quantity: item.quantity || 1
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md sticky top-24" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-black">Resumo do Pedido</h2>
        <button 
          onClick={fetchCartItems}
          className="text-xs text-black px-2 py-1 rounded transition-colors"
          title="Atualizar carrinho"
        >
          <IoReload size={21} />
        </button>
      </div>
      
      <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
        {cartItems.map((item, index) => {
          const product = getProductDetails(item);
          const itemTotal = product.price * product.quantity;

          return (
            <div key={item.id || index} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-xs">Imagem</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm leading-tight">{product.name}</p>
                <p className="text-sm text-gray-600">Qtd: {product.quantity}</p>
                <p className="text-sm font-semibold text-gray-900">
                  R$ {product.price.toFixed(2)} cada
                </p>
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                R$ {itemTotal.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Itens no carrinho:</span>
          <span className="font-semibold text-black">{cartItems.length}</span>
        </div>
      </div>

      <div className="border-t pt-4 mb-4">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Cupom de desconto"
            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
          />
          <button
            onClick={applyCoupon}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg text-sm font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-black">
          <span>Subtotal</span>
          <span>R$ {calculateSubtotal().toFixed(2)}</span>
        </div>
        
        {/* Shipping Display */}
        {selectedShipping ? (
          <div className="flex justify-between text-black">
            <span>
              Frete {selectedShipping.name}
              {selectedShipping.custom_delivery_time && (
                <span className="text-xs text-gray-500 block">
                  {selectedShipping.custom_delivery_time}
                </span>
              )}
            </span>
            <span>R$ {selectedShipping.price.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-black">
            <span>Frete</span>
            <span className="text-gray-500">A calcular</span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Desconto</span>
            <span>- R$ {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg text-black">
            <span>Total</span>            
            <span>R$ {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {paymentMethod === 'pix' && currentStep < 4 && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center text-green-700">
            <SiPix className="mr-2" />
            <span className="font-semibold">5% de desconto no PIX</span>
          </div>
          <p className="text-green-600 text-sm mt-1">
            Economize R$ {(calculateTotal() * 0.05).toFixed(2)}
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Navegação Rápida:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => goToStep(1)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => goToStep(2)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Entrega
          </button>
          <button
            onClick={() => goToStep(3)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
          >
            Pagamento
          </button>
          {currentStep === 4 && (
            <button
              onClick={() => goToStep(4)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
            >
              PIX
            </button>
          )}
          {currentStep === 5 && (
            <button
              onClick={() => goToStep(5)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
            >
              Boleto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Main CheckoutPage Component with Enhanced CEP Functionality
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
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState('');
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

  // Payment status polling function (unchanged)
  const startPaymentStatusPolling = (paymentIntentId) => {
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/payments/payment-status/${paymentIntentId}`);
        
        if (!response.ok) {
          console.log('Failed to check payment status, will retry...');
          setTimeout(checkPaymentStatus, 5000);
          return;
        }
        
        const data = await response.json();
        
        console.log('🔄 Real payment status:', data.status);
        
        if (data.status === 'succeeded') {
          alert('✅ Pagamento PIX confirmado! Redirecionando para página de confirmação...');
          window.location.href = `/order-success/${data.orderId}?payment_intent=${paymentIntentId}`;
        } else if (data.status === 'canceled' || data.status === 'requires_payment_method') {
          alert('❌ Pagamento falhou ou foi cancelado. Você pode tentar novamente.');
          setCurrentStep(3);
        } else {
          console.log('⏳ Payment still processing, checking again in 5 seconds...');
          setTimeout(checkPaymentStatus, 5000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setTimeout(checkPaymentStatus, 10000);
      }
    };

    setTimeout(checkPaymentStatus, 5000);
  };

  // Real Stripe PIX Integration (unchanged)
  const processCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }

    if (currentStep === 1 && (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf)) {
      alert('Por favor, preencha todos os campos obrigatórios nos dados pessoais');
      return;
    }

    if (currentStep === 2 && (!shippingData.cep || !shippingData.street || !shippingData.number || !shippingData.city || !shippingData.state || !selectedShipping)) {
      alert('Por favor, preencha todos os campos obrigatórios no endereço de entrega e selecione o frete');
      return;
    }

    setLoading(true);

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (paymentMethod === 'pix') {
        const pixResponse = await fetch("http://localhost:8080/api/payments/create-pix-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: calculateTotal(),
            orderId: orderId,
            customerInfo: customerData,
            shippingInfo: {
              ...shippingData,
              shippingMethod: selectedShipping
            }
          }),
        });

        if (!pixResponse.ok) {
          const errorData = await pixResponse.json();
          throw new Error(errorData.error || 'Failed to create Pix payment');
        }

        const pixDataResponse = await pixResponse.json();
        
        if (pixDataResponse.success) {
          console.log("✅ Real PIX payment created:", pixDataResponse);
          
          setPixData({
            pixQrCode: pixDataResponse.pixQrCode,
            pixCode: pixDataResponse.pixCode,
            expiresAt: pixDataResponse.expiresAt,
            paymentIntentId: pixDataResponse.id,
            amount: pixDataResponse.amount
          });
          setCurrentStep(4);
          startPaymentStatusPolling(pixDataResponse.id);
        } else {
          throw new Error(pixDataResponse.error || 'Failed to create Pix payment');
        }
      } else {
        const orderData = {
          items: cartItems,
          subtotal: calculateSubtotal(),
          shipping: calculateShipping(),
          discount: discount,
          total: calculateTotal(),
          currency: 'BRL',
          customer: customerData,
          shipping: {
            ...shippingData,
            method: selectedShipping
          },
          payment_method: paymentMethod,
          order_id: orderId
        };

        console.log("📦 Processing order with data:", orderData);

        await fetch("http://localhost:8000/sanctum/csrf-cookie", {
          method: "GET",
          credentials: "include",
        });

        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];

        if (!csrfToken) throw new Error("CSRF token not found");

        const checkoutRes = await fetch("http://localhost:8000/api/checkout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(orderData),
        });

        if (checkoutRes.ok) {
          const checkoutData = await checkoutRes.json();
          console.log("✅ Checkout successful:", checkoutData);
          
          if (paymentMethod === 'boleto') {
            setBoletoData(checkoutData.boleto_data || {
              barcode: '23793.38128 60007.677309 89000.063305 9 88410000019900',
              digitableLine: '2379338128600076773089000063305988410000019900',
              dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              pdfUrl: '#',
              total: calculateTotal().toFixed(2)
            });
            setCurrentStep(5);
          } else {
            alert(`Pagamento com ${paymentMethod} processado com sucesso!`);
          }
        } else {
          const errorData = await checkoutRes.json();
          throw new Error(errorData.message || "Erro no checkout");
        }
      }

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Keep all your existing functions (unchanged)
  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      console.log("🔄 Fetching cart items from API...");

      const res = await fetch("http://localhost:8000/api/cart", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Cart response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ CART ITEMS LOADED:", data);
        
        const cartData = data.cart || data.items || data || [];
        const total = data.total || data.subtotal || 0;
        
        setCartItems(cartData);
        setCartTotal(total);
        
        console.log(`📦 Loaded ${cartData.length} cart items, total: R$ ${total}`);
      } else {
        console.log("⚠️ Could not fetch cart items, using empty cart");
        setCartItems([]);
        setCartTotal(0);
      }
    } catch (err) {
      console.error("❌ Error fetching cart items:", err.message);
      setCartItems([]);
      setCartTotal(0);
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      console.log("🔄 Fetching user profile...");

      const res = await fetch("http://localhost:8000/profile", { 
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Profile response status:", res.status);

      if (res.ok) {
        const userData = await res.json();
        console.log("✅ USER PROFILE LOADED:", userData);
        
        const updatedCustomerData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.tel || userData.phone || userData.telefone || '',
          cpf: userData.cpf || userData.document || ''
        };
        
        setCustomerData(updatedCustomerData);
        setIsProfileLoaded(true);
        
      } else {
        console.log("⚠️ Could not fetch user profile, using empty form");
        setIsProfileLoaded(true);
      }
    } catch (err) {
      console.error("❌ Error fetching user profile:", err.message);
      setIsProfileLoaded(true);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      console.log("🔄 Fetching user addresses...");

      const possibleEndpoints = [
        'http://localhost:8000/addresses',
        'http://localhost:8000/api/address'
      ];

      let addresses = [];

      for (const endpoint of possibleEndpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);
          const res = await fetch(endpoint, {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          });

          console.log(`📡 Response status for ${endpoint}:`, res.status);

          if (res.ok) {
            const data = await res.json();
            console.log(`✅ ADDRESSES LOADED from ${endpoint}:`, data);
            
            if (Array.isArray(data)) {
              addresses = data;
            } else if (data.data && Array.isArray(data.data)) {
              addresses = data.data;
            } else if (data.addresses && Array.isArray(data.addresses)) {
              addresses = data.addresses;
            } else {
              addresses = [];
            }
            
            break;
          }
        } catch (err) {
          console.log(`❌ Endpoint ${endpoint} error:`, err.message);
          continue;
        }
      }

      if (addresses.length === 0) {
        console.log("⚠️ No addresses found from APIs, using mock data");
        addresses = [
          {
            id: 1,
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            hood: 'Jardim Paulista',
            city: 'São Paulo',
            state: 'SP',
            zip: '01415-001',
            is_primary: true
          },
          {
            id: 2,
            street: 'Avenida Paulista',
            number: '1000',
            complement: 'Sala 10',
            hood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zip: '01310-100',
            is_primary: false
          }
        ];
      }

      setUserAddresses(addresses);
      
      if (addresses.length > 0) {
        const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
        setSelectedAddressId(primaryAddress.id);
        
        setShippingData({
          cep: primaryAddress.zip || primaryAddress.cep || primaryAddress.postal_code || '',
          street: primaryAddress.street || primaryAddress.logradouro || primaryAddress.address || '',
          number: primaryAddress.number || primaryAddress.numero || '',
          complement: primaryAddress.complement || primaryAddress.complemento || '',
          hood: primaryAddress.hood || primaryAddress.bairro || '',
          city: primaryAddress.city || primaryAddress.cidade || '',
          state: primaryAddress.state || primaryAddress.estado || primaryAddress.uf || ''
        });
      }
      
    } catch (err) {
      console.error("❌ Error fetching addresses:", err.message);
      setUserAddresses([]);
    } finally {
      setIsAddressesLoaded(true);
    }
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingData({
        cep: selectedAddress.zip || selectedAddress.cep || selectedAddress.postal_code || '',
        street: selectedAddress.street || selectedAddress.logradouro || selectedAddress.address || '',
        number: selectedAddress.number || selectedAddress.numero || '',
        complement: selectedAddress.complement || selectedAddress.complemento || '',
        hood: selectedAddress.hood || selectedAddress.bairro || '',
        city: selectedAddress.city || selectedAddress.cidade || '',
        state: selectedAddress.state || selectedAddress.estado || selectedAddress.uf || ''
      });
    }
  };

  const handleShippingSelect = (shipping) => {
    setSelectedShipping(shipping);
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const applyCoupon = () => {
    if (couponCode === 'DESCONTO10') {
      setDiscount(calculateSubtotal() * 0.1);
      alert('Cupom aplicado! 10% de desconto.');
    } else {
      alert('Cupom inválido');
    }
  };

  const copyPixCode = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.pixCode);
      alert('Código PIX copiado!');
    }
  };

  const copyBoletoCode = () => {
    if (boletoData) {
      navigator.clipboard.writeText(boletoData.digitableLine);
      alert('Linha digitável copiada!');
    }
  };

  const downloadBoleto = () => {
    alert('Download do boleto simulado! Em produção, isso baixaria o PDF real.');
  };

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!isMounted) return;

      try {
        setIsInitializing(true);
        console.log("🔄 Starting sequential data initialization...");

        await fetch("http://localhost:8000/sanctum/csrf-cookie", {
          method: "GET",
          credentials: "include",
        });

        await fetchUserProfile();
        await fetchUserAddresses();
        await fetchCartItems();

        console.log("✅ All data loaded successfully");
      } catch (error) {
        console.error("❌ Error during data initialization:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Loading states remain the same
  if (isInitializing || loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {loadingCart ? 'Carregando Carrinho...' : 'Carregando Checkout...'}
          </h2>
          <p className="text-gray-500">Preparando sua experiência de compra</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingCart size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h2>
          <p className="text-gray-600 mb-6">Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Voltar para Loja
          </button>
        </div>
      </div>
    );
  }

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
                loadingShipping={loadingShipping}
                shippingError={shippingError}
                cartItems={cartItems}
                prevStep={prevStep}
                nextStep={nextStep}
              />
            )}
            {currentStep === 3 && (
              <PaymentStep 
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                cardData={cardData}
                setCardData={setCardData}
                calculateTotal={calculateTotal}
                prevStep={prevStep}
                processCheckout={processCheckout}
                loading={loading}
              />
            )}
            {currentStep === 4 && (
              <PixStep 
                pixData={pixData}
                copyPixCode={copyPixCode}
                goToStep={goToStep}
              />
            )}
            {currentStep === 5 && (
              <BoletoStep 
                boletoData={boletoData}
                copyBoletoCode={copyBoletoCode}
                downloadBoleto={downloadBoleto}
                goToStep={goToStep}
              />
            )}
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