import React, { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiLock, FiCheck, FiCopy, FiArrowLeft, FiUser, FiTruck, FiCreditCard as FiCard, FiFileText, FiShoppingCart } from 'react-icons/fi';
import { SiPix } from 'react-icons/si';

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

  // ✅ UPDATED: Sequential data fetching including cart
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

        // 4. Finally fetch cart items
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

  // ✅ ADDED: Fetch cart items from API
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
        
        // Handle different response formats
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

  // ✅ IMPROVED: fetchUserAddresses with multiple endpoint support and fallback
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

  // ✅ UPDATED: Calculate totals based on actual cart data
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
    return cartTotal > 100 ? 0 : 15.90; // Free shipping over R$ 100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - discount;
  };

  // ✅ UPDATED: Process checkout with real cart data
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
      // ✅ UPDATED: Use actual cart data for order
      const orderData = {
        items: cartItems,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        discount: discount,
        total: calculateTotal(),
        currency: 'BRL',
        customer: customerData,
        shipping: shippingData,
        payment_method: paymentMethod
      };

      console.log("📦 Processing order with data:", orderData);

      // Get CSRF token for checkout request
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

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

  // ✅ UPDATED: Loading state that includes cart loading
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

  // ✅ ADDED: Empty cart state
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

  // ✅ UPDATED: Order Summary Component with real cart items
  const OrderSummary = () => {
    // Helper function to get product details from cart item
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
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            title="Atualizar carrinho"
          >
            Atualizar
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

        {/* Cart Summary */}
        <div className="border-t pt-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Itens no carrinho:</span>
            <span className="font-semibold text-black">{cartItems.length}</span>
          </div>
        </div>

        {/* Coupon Section */}
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
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => goToStep(2)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Entrega
            </button>
            <button
              onClick={() => goToStep(3)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
              style={{ fontFamily: 'Calibri, sans-serif' }}
            >
              Pagamento
            </button>
            {currentStep === 4 && (
              <button
                onClick={() => goToStep(4)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
                style={{ fontFamily: 'Calibri, sans-serif' }}
              >
                PIX
              </button>
            )}
            {currentStep === 5 && (
              <button
                onClick={() => goToStep(5)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded"
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