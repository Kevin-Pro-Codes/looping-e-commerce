import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Tênis Esportivo Premium', price: 299.90, quantity: 1, image: '/api/placeholder/80/80' },
    { id: 2, name: 'Camiseta Básica', price: 49.90, quantity: 2, image: '/api/placeholder/80/80' }
  ]);
  
  // Fetch user profile and addresses from API
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
    neighborhood: '',
    city: '',
    state: ''
  });

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
  const [addressError, setAddressError] = useState('');

  // ✅ FIXED: Sequential data fetching to prevent race conditions
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!isMounted) return;

      try {
        setIsInitializing(true);
        console.log("🔄 Starting sequential data initialization...");

        // 1. First, get CSRF token once for all requests
        await fetch("http://localhost:8000/sanctum/csrf-cookie", {
          method: "GET",
          credentials: "include",
        });

        // 2. Fetch profile first
        await fetchUserProfile();
        
        // 3. Then fetch addresses after profile is loaded
        await fetchUserAddresses();

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

  // ✅ FIXED: Fetch user profile from API
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

  // ✅ IMPROVED: fetchUserAddresses with better debugging and fallbacks
  const fetchUserAddresses = async () => {
    try {
      console.log("🔄 Fetching user addresses...");
      setAddressError('');

      // Try multiple possible API endpoints
      const possibleEndpoints = [
        'http://localhost:8000/api/addresses',
        'http://localhost:8000/api/user/addresses',
        'http://localhost:8000/addresses',
        'http://localhost:8000/api/address'
      ];

      let addresses = [];
      let lastError = null;

      // Try each endpoint until one works
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
            
            // Handle different response formats
            if (Array.isArray(data)) {
              addresses = data;
            } else if (data.data && Array.isArray(data.data)) {
              addresses = data.data;
            } else if (data.addresses && Array.isArray(data.addresses)) {
              addresses = data.addresses;
            } else {
              addresses = [];
            }
            
            break; // Exit loop if successful
          } else {
            console.log(`❌ Endpoint ${endpoint} failed with status:`, res.status);
            lastError = `HTTP ${res.status}`;
          }
        } catch (err) {
          console.log(`❌ Endpoint ${endpoint} error:`, err.message);
          lastError = err.message;
          continue; // Try next endpoint
        }
      }

      // If no addresses found from APIs, use mock data for testing
      if (addresses.length === 0) {
        console.log("⚠️ No addresses found from APIs, using mock data");
        addresses = [
          {
            id: 1,
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Jardim Paulista',
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
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zip: '01310-100',
            is_primary: false
          }
        ];
        setAddressError('Usando endereços de exemplo. Configure sua API de endereços.');
      }

      setUserAddresses(addresses);
      
      // Auto-select first address if available
      if (addresses.length > 0) {
        const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
        setSelectedAddressId(primaryAddress.id);
        
        setShippingData({
          cep: primaryAddress.zip || primaryAddress.cep || primaryAddress.postal_code || '',
          street: primaryAddress.street || primaryAddress.logradouro || primaryAddress.address || '',
          number: primaryAddress.number || primaryAddress.numero || '',
          complement: primaryAddress.complement || primaryAddress.complemento || '',
          neighborhood: primaryAddress.neighborhood || primaryAddress.bairro || '',
          city: primaryAddress.city || primaryAddress.cidade || '',
          state: primaryAddress.state || primaryAddress.estado || primaryAddress.uf || ''
        });
      }
      
    } catch (err) {
      console.error("❌ Error fetching addresses:", err.message);
      setAddressError('Erro ao carregar endereços. Por favor, preencha manualmente.');
      setUserAddresses([]);
    } finally {
      setIsAddressesLoaded(true);
    }
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingData({
        cep: selectedAddress.zip || selectedAddress.cep || selectedAddress.postal_code || '',
        street: selectedAddress.street || selectedAddress.logradouro || selectedAddress.address || '',
        number: selectedAddress.number || selectedAddress.numero || '',
        complement: selectedAddress.complement || selectedAddress.complemento || '',
        neighborhood: selectedAddress.neighborhood || selectedAddress.bairro || '',
        city: selectedAddress.city || selectedAddress.cidade || '',
        state: selectedAddress.state || selectedAddress.estado || selectedAddress.uf || ''
      });
    }
  };

  // Format address to single line with proper spacing
  const formatAddressLine = (address) => {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.number) parts.push(address.number);
    if (address.complement) parts.push(address.complement);
    
    const addressLine1 = parts.join(', ');
    
    const parts2 = [];
    if (address.neighborhood) parts2.push(address.neighborhood);
    if (address.city) parts2.push(address.city);
    if (address.state) parts2.push(address.state);
    if (address.zip) parts2.push(address.zip);
    
    const addressLine2 = parts2.join(' - ');
    
    return `${addressLine1}, ${addressLine2}`;
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return 15.90;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - discount;
  };

  // Navigation functions
  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Process checkout function
  const processCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }

    // Validate required fields based on current step
    if (currentStep === 1 && (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf)) {
      alert('Por favor, preencha todos os campos obrigatórios nos dados pessoais');
      return;
    }

    if (currentStep === 2 && (!shippingData.cep || !shippingData.street || !shippingData.number || !shippingData.city || !shippingData.state)) {
      alert('Por favor, preencha todos os campos obrigatórios no endereço de entrega');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        discount: discount,
        total: calculateTotal(),
        currency: 'BRL',
        customer: customerData,
        shipping: shippingData,
        paymentMethod: paymentMethod
      };

      // Simulate API call
      setTimeout(() => {
        if (paymentMethod === 'pix') {
          const mockPixData = {
            pixQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_EXAMPLE_CODE',
            pixCode: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740005204000053039865406100.005802BR5913Merchant Name6008Sao Paulo62070503***6304E2CA',
            expiration: new Date(Date.now() + 30 * 60 * 1000)
          };
          setPixData(mockPixData);
          setCurrentStep(4);
        } else if (paymentMethod === 'boleto') {
          const mockBoletoData = {
            barcode: '23793.38128 60007.677309 89000.063305 9 88410000019900',
            digitableLine: '2379338128600076773089000063305988410000019900',
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
            pdfUrl: '#',
            total: calculateTotal().toFixed(2)
          };
          setBoletoData(mockBoletoData);
          setCurrentStep(5);
        } else {
          alert(`Pagamento com ${paymentMethod} processado com sucesso!`);
        }
        setLoading(false);
      }, 2000);

    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
      setLoading(false);
    }
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

  // ✅ IMPROVED: Loading state for entire checkout
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando Checkout...</h2>
          <p className="text-gray-500">Preparando sua experiência de compra</p>
        </div>
      </div>
    );
  }

  // Steps component with clickable steps
  const StepIndicator = () => (
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

  // Customer Info Step
  const CustomerStep = () => {
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
            {/* Customer Data Confirmation Box */}
            {customerData.name && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Dados do Perfil Carregados</h3>
                <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Nome:</span>
                          <span className="text-green-900 font-semibold ml-2">{customerData.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Email:</span>
                          <span className="text-green-900 font-semibold ml-2">{customerData.email}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Telefone:</span>
                          <span className="text-green-900 font-semibold ml-2">{customerData.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">CPF:</span>
                          <span className="text-green-900 font-semibold ml-2">{customerData.cpf}</span>
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
                  onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  onChange={(e) => setCustomerData({...customerData, cpf: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                Continuar para Entrega
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // ✅ IMPROVED: Shipping Step with better address handling
  const ShippingStep = () => (
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

      {/* Address Error Message */}
      {addressError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">{addressError}</p>
        </div>
      )}
      
      {/* Saved Addresses Section */}
      {userAddresses.length > 0 ? (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Endereços Salvos</h3>
          <div className="space-y-3">
            {userAddresses.map((address) => (
              <div
                key={address.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAddressId === address.id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAddressSelect(address.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 break-words leading-tight">
                      {address.street || address.logradouro || address.address}, {address.number || address.numero}
                    </p>
                    
                    <div className="mt-2 space-y-1">
                      {address.complement && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Complemento:</span> {address.complement}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Bairro:</span> {address.neighborhood || address.bairro}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cidade/Estado:</span> {address.city || address.cidade} - {address.state || address.estado || address.uf}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">CEP:</span> {address.zip || address.cep || address.postal_code}
                      </p>
                    </div>
                    
                    {selectedAddressId === address.id && (
                      <p className="text-sm text-green-700 mt-2">
                        ✓ Endereço selecionado para entrega
                      </p>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0 ${
                    selectedAddressId === address.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                  }`}>
                    {selectedAddressId === address.id && <FiCheck size={14} className="text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Ou preencha um novo endereço:</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-center">
            Nenhum endereço salvo encontrado. Preencha seus dados de entrega abaixo.
          </p>
        </div>
      )}

      {/* Address Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP *
          </label>
          <input
            type="text"
            value={shippingData.cep}
            onChange={(e) => setShippingData({...shippingData, cep: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="00000-000"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua *
          </label>
          <input
            type="text"
            value={shippingData.street}
            onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Nome da rua"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número *
          </label>
          <input
            type="text"
            value={shippingData.number}
            onChange={(e) => setShippingData({...shippingData, number: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            onChange={(e) => setShippingData({...shippingData, complement: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Apartmento, bloco, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro *
          </label>
          <input
            type="text"
            value={shippingData.neighborhood}
            onChange={(e) => setShippingData({...shippingData, neighborhood: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Seu bairro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade *
          </label>
          <input
            type="text"
            value={shippingData.city}
            onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Sua cidade"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={shippingData.state}
            onChange={(e) => setShippingData({...shippingData, state: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="SP">São Paulo</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="MG">Minas Gerais</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          className="flex items-center text-gray-600 hover:text-gray-800 py-3 px-6"
          style={{ fontFamily: 'Calibri, sans-serif' }}
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Dados Pessoais
        </button>
        <button
          onClick={nextStep}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
          style={{ fontFamily: 'Calibri, sans-serif' }}
        >
          Continuar para Pagamento
        </button>
      </div>
    </div>
  );

  // ... rest of your components remain the same (PaymentStep, PixStep, BoletoStep, OrderSummary)

  return (
    <div className="min-h-screen bg-gray-50 pt-20" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <StepIndicator />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && <CustomerStep />}
            {currentStep === 2 && <ShippingStep />}
            {currentStep === 3 && <PaymentStep />}
            {currentStep === 4 && <PixStep />}
            {currentStep === 5 && <BoletoStep />}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;