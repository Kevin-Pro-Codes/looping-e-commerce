import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText, FiShoppingCart } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';
import { IoReload } from "react-icons/io5";

const CheckoutPage = () => {
  // ✅ UPDATED: Fetch cart items from API instead of mock data
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);
  
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
  const [cartError, setCartError] = useState(null);

  // ✅ FIXED: Added proper error handling and dependency optimization
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!isMounted) return;

      try {
        setIsInitializing(true);
        setCartError(null);
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

        // 4. Finally fetch cart items
        await fetchCartItems();

        console.log("✅ All data loaded successfully");
      } catch (error) {
        console.error("❌ Error during data initialization:", error);
        if (isMounted) {
          setCartError("Erro ao carregar dados. Tente recarregar a página.");
        }
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

  // ✅ FIXED: Enhanced cart fetching with better error handling
  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      setCartError(null);
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
        
        // Handle different response formats
        const cartData = data.cart || data.items || data || [];
        const total = data.total || data.subtotal || 0;
        
        setCartItems(cartData);
        setCartTotal(total);
        
        console.log(`📦 Loaded ${cartData.length} cart items, total: R$ ${total}`);
        
        if (cartData.length === 0) {
          setCartError("Seu carrinho está vazio");
        }
      } else {
        console.log("⚠️ Could not fetch cart items, using empty cart");
        setCartItems([]);
        setCartTotal(0);
        setCartError("Erro ao carregar carrinho");
      }
    } catch (err) {
      console.error("❌ Error fetching cart items:", err.message);
      setCartItems([]);
      setCartTotal(0);
      setCartError("Erro de conexão ao carregar carrinho");
    } finally {
      setLoadingCart(false);
    }
  };

  // ✅ FIXED: Enhanced profile fetching with validation
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
        
        // Validate required fields
        if (!updatedCustomerData.name || !updatedCustomerData.email) {
          console.warn("⚠️ Profile loaded but missing required fields");
        }
        
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

  // ✅ FIXED: Enhanced address fetching with better state management
  const fetchUserAddresses = async () => {
    try {
      console.log("🔄 Fetching user addresses...");

      // Try multiple possible API endpoints
      const possibleEndpoints = [
        'http://localhost:8000/addresses',
        'http://localhost:8000/api/address'
      ];

      let addresses = [];
      let successfulEndpoint = '';

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
            successfulEndpoint = endpoint;
            
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
          }
        } catch (err) {
          console.log(`❌ Endpoint ${endpoint} error:`, err.message);
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
      setUserAddresses([]);
    } finally {
      setIsAddressesLoaded(true);
    }
  };

  // ✅ FIXED: Enhanced address selection with validation
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

  // ✅ FIXED: Enhanced address formatting with null checks
  const formatAddressLine = (address) => {
    if (!address) return '';
    
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

  // ✅ FIXED: Enhanced calculation functions with proper fallbacks
  const calculateSubtotal = () => {
    if (cartTotal > 0) {
      return cartTotal;
    }
    
    // Fallback calculation if cartTotal is not available
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const calculateShipping = () => {
    // You can make this dynamic based on cart value or address
    const subtotal = calculateSubtotal();
    return subtotal > 100 ? 0 : 15.90; // Free shipping over R$ 100
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return subtotal + shipping - discount;
  };

  // ✅ FIXED: Enhanced navigation with validation
  const goToStep = (step) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf) {
        alert('Por favor, preencha todos os campos obrigatórios nos dados pessoais');
        return;
      }
    } else if (currentStep === 2) {
      if (!shippingData.cep || !shippingData.street || !shippingData.number || !shippingData.city || !shippingData.state) {
        alert('Por favor, preencha todos os campos obrigatórios no endereço de entrega');
        return;
      }
    }
    
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // ✅ FIXED: Enhanced checkout process with comprehensive validation
  const processCheckout = async () => {
    // Comprehensive validation
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio');
      return;
    }

    // Validate customer data
    if (!customerData.name || !customerData.email || !customerData.phone || !customerData.cpf) {
      alert('Por favor, preencha todos os campos obrigatórios nos dados pessoais');
      goToStep(1);
      return;
    }

    // Validate shipping data
    if (!shippingData.cep || !shippingData.street || !shippingData.number || !shippingData.city || !shippingData.state) {
      alert('Por favor, preencha todos os campos obrigatórios no endereço de entrega');
      goToStep(2);
      return;
    }

    // Validate payment method specific data
    if (paymentMethod === 'credit') {
      if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
        alert('Por favor, preencha todos os dados do cartão de crédito');
        return;
      }
    }

    setLoading(true);

    try {
      // ✅ FIXED: Enhanced order data structure
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          quantity: item.quantity || 1,
          price: item.product?.price || item.price || 0
        })),
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        discount: discount,
        total: calculateTotal(),
        currency: 'BRL',
        customer: customerData,
        shipping_address: shippingData,
        payment_method: paymentMethod,
        ...(paymentMethod === 'credit' && { card_data: cardData })
      };

      console.log("📦 Processing order with data:", orderData);

      // Get CSRF token for checkout request
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Extract CSRF token
      const getCsrfToken = () => {
        return document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];
      };

      const csrfToken = getCsrfToken();
      if (!csrfToken) throw new Error("CSRF token not found");

      // Send actual checkout request to your API
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
        
        // Handle different payment methods based on API response
        if (paymentMethod === 'pix') {
          setPixData(checkoutData.pix_data || {
            pixQrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_EXAMPLE_CODE',
            pixCode: '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740005204000053039865406100.005802BR5913Merchant Name6008Sao Paulo62070503***6304E2CA',
            expiration: new Date(Date.now() + 30 * 60 * 1000)
          });
          setCurrentStep(4);
        } else if (paymentMethod === 'boleto') {
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
          // Redirect to success page or clear cart
        }
      } else {
        const errorData = await checkoutRes.json();
        throw new Error(errorData.message || "Erro no checkout");
      }

    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      alert(error.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Enhanced coupon application with validation
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Por favor, insira um código de cupom');
      return;
    }

    const subtotal = calculateSubtotal();
    
    if (couponCode === 'DESCONTO10') {
      const newDiscount = subtotal * 0.1;
      setDiscount(newDiscount);
      alert(`Cupom aplicado! 10% de desconto (R$ ${newDiscount.toFixed(2)})`);
    } else if (couponCode === 'DESCONTO20') {
      const newDiscount = subtotal * 0.2;
      setDiscount(newDiscount);
      alert(`Cupom aplicado! 20% de desconto (R$ ${newDiscount.toFixed(2)})`);
    } else if (couponCode === 'FRETEGRATIS') {
      // Special handling for free shipping coupon
      if (calculateShipping() > 0) {
        setDiscount(discount + calculateShipping());
        alert('Cupom aplicado! Frete grátis!');
      } else {
        alert('Seu pedido já tem frete grátis!');
      }
    } else {
      alert('Cupom inválido ou expirado');
    }
  };

  // ✅ FIXED: Enhanced copy functions with error handling
  const copyPixCode = async () => {
    if (pixData) {
      try {
        await navigator.clipboard.writeText(pixData.pixCode);
        alert('Código PIX copiado! Cole no seu aplicativo bancário.');
      } catch (err) {
        console.error('Failed to copy PIX code:', err);
        alert('Erro ao copiar código PIX. Tente manualmente.');
      }
    }
  };

  const copyBoletoCode = async () => {
    if (boletoData) {
      try {
        await navigator.clipboard.writeText(boletoData.digitableLine);
        alert('Linha digitável copiada!');
      } catch (err) {
        console.error('Failed to copy boleto code:', err);
        alert('Erro ao copiar linha digitável. Tente manualmente.');
      }
    }
  };

  const downloadBoleto = () => {
    if (boletoData && boletoData.pdfUrl) {
      window.open(boletoData.pdfUrl, '_blank');
    } else {
      alert('Download do boleto simulado! Em produção, isso baixaria o PDF real.');
    }
  };

  // ✅ FIXED: Enhanced loading state with error display
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

  // ✅ FIXED: Enhanced empty cart state with retry option
  if (cartItems.length === 0 && !loadingCart) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShoppingCart size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {cartError ? 'Erro ao Carregar Carrinho' : 'Carrinho Vazio'}
          </h2>
          <p className="text-gray-600 mb-6">
            {cartError || 'Seu carrinho está vazio. Adicione produtos antes de finalizar a compra.'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Voltar para Loja
            </button>
            {cartError && (
              <button
                onClick={fetchCartItems}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center"
              >
                <IoReload className="mr-2" />
                Tentar Novamente
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Enhanced StepIndicator with better accessibility
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
            onClick={() => step.number <= currentStep && goToStep(step.number)}
            disabled={step.number > currentStep}
            className={`flex flex-col items-center group ${
              step.number <= currentStep 
                ? 'text-green-600 cursor-pointer' 
                : 'text-gray-400 cursor-not-allowed'
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

  // Customer Info Step - Enhanced with better validation
  const CustomerStep = () => {
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
      const errors = {};
      if (!customerData.name.trim()) errors.name = 'Nome é obrigatório';
      if (!customerData.email.trim()) errors.email = 'Email é obrigatório';
      if (!customerData.phone.trim()) errors.phone = 'Telefone é obrigatório';
      if (!customerData.cpf.trim()) errors.cpf = 'CPF é obrigatório';
      
      // Basic email validation
      if (customerData.email && !/\S+@\S+\.\S+/.test(customerData.email)) {
        errors.email = 'Email inválido';
      }
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
      if (validateForm()) {
        nextStep();
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Dados Pessoais</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Passo 1 de 4</span>
            <button 
              onClick={fetchUserProfile}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center"
            >
              <IoReload size={12} className="mr-1" />
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
                  onChange={(e) => {
                    setCustomerData({...customerData, name: e.target.value});
                    if (formErrors.name) setFormErrors({...formErrors, name: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => {
                    setCustomerData({...customerData, email: e.target.value});
                    if (formErrors.email) setFormErrors({...formErrors, email: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => {
                    setCustomerData({...customerData, phone: e.target.value});
                    if (formErrors.phone) setFormErrors({...formErrors, phone: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF *
                </label>
                <input
                  type="text"
                  value={customerData.cpf}
                  onChange={(e) => {
                    setCustomerData({...customerData, cpf: e.target.value});
                    if (formErrors.cpf) setFormErrors({...formErrors, cpf: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    formErrors.cpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="000.000.000-00"
                />
                {formErrors.cpf && <p className="text-red-500 text-sm mt-1">{formErrors.cpf}</p>}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleNextStep}
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

  // Shipping Step - Enhanced with address selection and validation
  const ShippingStep = () => {
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
      const errors = {};
      if (!shippingData.cep.trim()) errors.cep = 'CEP é obrigatório';
      if (!shippingData.street.trim()) errors.street = 'Rua é obrigatória';
      if (!shippingData.number.trim()) errors.number = 'Número é obrigatório';
      if (!shippingData.neighborhood.trim()) errors.neighborhood = 'Bairro é obrigatório';
      if (!shippingData.city.trim()) errors.city = 'Cidade é obrigatória';
      if (!shippingData.state.trim()) errors.state = 'Estado é obrigatório';
      
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleNextStep = () => {
      if (validateForm()) {
        nextStep();
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Endereço de Entrega</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Passo 2 de 4</span>
            <button 
              onClick={fetchUserAddresses}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center"
            >
              <IoReload size={12} className="mr-1" />
              Recarregar
            </button>
          </div>
        </div>
        
        {/* Address Selection */}
        {userAddresses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Selecione um endereço salvo</h3>
            <div className="space-y-3">
              {userAddresses.map((address) => (
                <div
                  key={address.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAddressId === address.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleAddressSelect(address.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {address.street}, {address.number}
                        {address.complement && `, ${address.complement}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.neighborhood}, {address.city} - {address.state}
                      </p>
                      <p className="text-sm text-gray-500">{address.zip}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAddressId === address.id 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAddressId === address.id && <FiCheck size={14} className="text-white" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Address Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP *
            </label>
            <input
              type="text"
              value={shippingData.cep}
              onChange={(e) => {
                setShippingData({...shippingData, cep: e.target.value});
                if (formErrors.cep) setFormErrors({...formErrors, cep: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                formErrors.cep ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="00000-000"
            />
            {formErrors.cep && <p className="text-red-500 text-sm mt-1">{formErrors.cep}</p>}
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua *
            </label>
            <input
              type="text"
              value={shippingData.street}
              onChange={(e) => {
                setShippingData({...shippingData, street: e.target.value});
                if (formErrors.street) setFormErrors({...formErrors, street: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                formErrors.street ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome da Rua"
            />
            {formErrors.street && <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número *
            </label>
            <input
              type="text"
              value={shippingData.number}
              onChange={(e) => {
                setShippingData({...shippingData, number: e.target.value});
                if (formErrors.number) setFormErrors({...formErrors, number: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                formErrors.number ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123"
            />
            {formErrors.number && <p className="text-red-500 text-sm mt-1">{formErrors.number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              value={shippingData.complement}
              onChange={(e) => setShippingData({...shippingData, complement: e.target.value})}
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
              value={shippingData.neighborhood}
              onChange={(e) => {
                setShippingData({...shippingData, neighborhood: e.target.value});
                if (formErrors.neighborhood) setFormErrors({...formErrors, neighborhood: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                formErrors.neighborhood ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Bairro"
            />
            {formErrors.neighborhood && <p className="text-red-500 text-sm mt-1">{formErrors.neighborhood}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              value={shippingData.city}
              onChange={(e) => {
                setShippingData({...shippingData, city: e.target.value});
                if (formErrors.city) setFormErrors({...formErrors, city: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                formErrors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Cidade"
            />
            {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={shippingData.state}
              onChange={(e) => {
                setShippingData({...shippingData, state: e.target.value});
                if (formErrors.state) setFormErrors({...formErrors, state: ''});
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                formErrors.state ? 'border-red-500' : 'border-gray-300'
              }`}
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
            {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
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
            onClick={handleNextStep}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-semibold transition-colors"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          >
            Continuar para Pagamento
          </button>
        </div>
      </div>
    );
  };

  // Payment Step - Enhanced with card validation
  const PaymentStep = () => {
    const [cardErrors, setCardErrors] = useState({});

    const validateCard = () => {
      if (paymentMethod !== 'credit') return true;
      
      const errors = {};
      if (!cardData.number.trim()) errors.number = 'Número do cartão é obrigatório';
      if (!cardData.name.trim()) errors.name = 'Nome no cartão é obrigatório';
      if (!cardData.expiry.trim()) errors.expiry = 'Validade é obrigatória';
      if (!cardData.cvv.trim()) errors.cvv = 'CVV é obrigatório';
      
      setCardErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleProcessCheckout = () => {
      if (validateCard()) {
        processCheckout();
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Método de Pagamento</h2>
          <span className="text-sm text-gray-500">Passo 3 de 4</span>
        </div>
        
        <div className="space-y-4">
          {/* PIX Option */}
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

          {/* Boleto Option */}
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

          {/* Credit Card Option */}
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

          {/* Debit Card Option */}
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

        {/* Credit Card Form */}
        {paymentMethod === 'credit' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4 text-black">Dados do Cartão</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => {
                    setCardData({...cardData, number: e.target.value});
                    if (cardErrors.number) setCardErrors({...cardErrors, number: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    cardErrors.number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Número do Cartão"
                />
                {cardErrors.number && <p className="text-red-500 text-sm mt-1">{cardErrors.number}</p>}
              </div>
              
              <div className="md:col-span-2">
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => {
                    setCardData({...cardData, name: e.target.value});
                    if (cardErrors.name) setCardErrors({...cardErrors, name: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    cardErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome no Cartão"
                />
                {cardErrors.name && <p className="text-red-500 text-sm mt-1">{cardErrors.name}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => {
                    setCardData({...cardData, expiry: e.target.value});
                    if (cardErrors.expiry) setCardErrors({...cardErrors, expiry: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    cardErrors.expiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Validade (MM/AA)"
                />
                {cardErrors.expiry && <p className="text-red-500 text-sm mt-1">{cardErrors.expiry}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => {
                    setCardData({...cardData, cvv: e.target.value});
                    if (cardErrors.cvv) setCardErrors({...cardErrors, cvv: ''});
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black ${
                    cardErrors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="CVV"
                />
                {cardErrors.cvv && <p className="text-red-500 text-sm mt-1">{cardErrors.cvv}</p>}
              </div>

              <div className="md:col-span-2">
                <select
                  value={cardData.installments}
                  onChange={(e) => setCardData({...cardData, installments: parseInt(e.target.value)})}
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
            className="flex items-center text-gray-600 hover:text-gray-800 py-3 px-6"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          >
            <FiArrowLeft className="mr-2" />
            Voltar para Entrega
          </button>
          <button
            onClick={handleProcessCheckout}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-8 rounded-lg font-semibold transition-colors flex items-center"
            style={{ fontFamily: 'Calibri, sans-serif' }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
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
  };

  // PIX Payment Step - Enhanced with better UX
  const PixStep = () => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <SiPix size={32} className="text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-black">Pagamento via PIX</h2>
      <p className="text-gray-600 mb-6">Escaneie o QR Code ou copie o código para pagar</p>
      
      {pixData ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 inline-block">
            <img 
              src={pixData.pixQrCode} 
              alt="QR Code PIX" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Código PIX (copie e cole no seu app)</p>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <code className="text-sm font-mono break-all flex-1 text-left text-black">
                {pixData.pixCode}
              </code>
              <button
                onClick={copyPixCode}
                className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0 hover:bg-gray-100 rounded transition-colors"
                title="Copiar código PIX"
              >
                <FiCopy size={18} />
              </button>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Atenção:</strong> O pedido será confirmado automaticamente após a confirmação do pagamento.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <button
              onClick={() => goToStep(3)}
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 px-4"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              <FiArrowLeft className="mr-2" />
              Alterar Método de Pagamento
            </button>
            <button
              onClick={() => alert('Simulando confirmação de pagamento!')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Já Paguei
            </button>
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

  // Boleto Payment Step - Enhanced with better UX
  const BoletoStep = () => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center" style={{ fontFamily: 'Calibri, sans-serif' }}>
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiFileText size={32} className="text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2 text-black">Boleto Bancário</h2>
      <p className="text-gray-600 mb-6">Pague em qualquer banco ou lotérica</p>
      
      {boletoData ? (
        <div className="space-y-6">
          {/* Boleto Info */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-blue-300">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-black">Valor: R$ {boletoData.total}</p>
              <p className="text-sm text-gray-600">
                Vencimento: {boletoData.dueDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            {/* Código de Barras */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2 text-center">Código de Barras</p>
              <div className="bg-white p-4 rounded border text-center">
                <code className="text-sm font-mono text-black tracking-widest">
                  {boletoData.barcode}
                </code>
              </div>
            </div>
            
            {/* Linha Digitável */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2 text-center">Linha Digitável</p>
              <div className="flex items-center justify-between bg-white p-3 rounded border">
                <code className="text-sm font-mono break-all flex-1 text-left text-black">
                  {boletoData.digitableLine}
                </code>
                <button
                  onClick={copyBoletoCode}
                  className="ml-2 p-2 text-gray-600 hover:text-gray-800 flex-shrink-0 hover:bg-gray-100 rounded transition-colors"
                  title="Copiar linha digitável"
                >
                  <FiCopy size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
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
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 py-2 px-4"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              <FiArrowLeft className="mr-2" />
              Alterar Método
            </button>
            <div className="flex gap-2">
              <button
                onClick={downloadBoleto}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold flex items-center"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                <FiFileText className="mr-2" />
                Baixar Boleto
              </button>
              <button
                onClick={() => alert('Simulando confirmação de pagamento!')}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold"
                style={{ fontFamily: 'Calibri, sans-serif' }}
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

  // ✅ FIXED: Enhanced Order Summary Component with better error handling
  const OrderSummary = () => {
    // Helper function to get product details from cart item
    const getProductDetails = (item) => {
      const product = item.product || {};
      return {
        name: product.title || product.name || `Produto ${item.product_id || item.id}`,
        price: product.price || item.price || 0,
        image: product.image || product.image_url || product.images?.[0] || null,
        quantity: item.quantity || 1
      };
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md sticky top-24" style={{ fontFamily: 'Calibri, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-black">Resumo do Pedido</h2>
          <button 
            onClick={fetchCartItems}
            className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
            title="Atualizar carrinho"
            disabled={loadingCart}
          >
            <IoReload size={18} className={loadingCart ? 'animate-spin' : ''} />
          </button>
        </div>
        
        {cartError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 text-sm">{cartError}</p>
            <button
              onClick={fetchCartItems}
              className="text-red-600 hover:text-red-800 text-sm mt-2 flex items-center"
            >
              <IoReload size={14} className="mr-1" />
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 hidden">
                        <span className="text-gray-500 text-xs text-center">Sem imagem</span>
                      </div>
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

            {/* Cart Summary */}
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Itens no carrinho:</span>
                <span className="font-semibold text-black">{cartItems.length}</span>
              </div>
            </div>
          </>
        )}

        {/* Coupon Section */}
        <div className="border-t pt-4 mb-4">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Cupom de desconto"
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm text-black"
              onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
            />
            <button
              onClick={applyCoupon}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg text-sm font-medium transition-colors"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Aplicar
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-black">
            <span>Subtotal</span>
            <span>R$ {calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-black">
            <span>Frete</span>
            <span>{calculateShipping() === 0 ? 'Grátis' : `R$ ${calculateShipping().toFixed(2)}`}</span>
          </div>
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

        {/* Step Navigation Quick Links */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Navegação Rápida:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => goToStep(1)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => goToStep(2)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Entrega
            </button>
            <button
              onClick={() => goToStep(3)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Pagamento
            </button>
            {currentStep === 4 && (
              <button
                onClick={() => goToStep(4)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                PIX
              </button>
            )}
            {currentStep === 5 && (
              <button
                onClick={() => goToStep(5)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded transition-colors"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                Boleto
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

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