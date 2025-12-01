import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiMenu, FiX, FiUser, FiMapPin, FiCreditCard, FiPackage, FiHeart, FiShoppingBag, FiTag, FiSettings, FiHelpCircle, FiLogOut } from "react-icons/fi";

const mockUserProfile = {
  name: "",
  email: "",
  tel: "",
  cpf: "",
  birth_date: "",
  avatar: "",
  marketing: true,
  addresses: [],
  payment: [],
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Cart state - NOVO
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchWishlist();
    fetchCart(); // NOVO: Buscar carrinho
  }, []);

  // Navigation items
  const navigationItems = [
    { id: "perfil", label: "Perfil", icon: FiUser },
    { id: "enderecos", label: "Endereço", icon: FiMapPin },
    { id: "pagamento", label: "Pagamento", icon: FiCreditCard },
    { id: "pedidos", label: "Pedidos", icon: FiPackage },
    { id: "desejos", label: "Desejos", icon: FiHeart },
    { id: "carrinho", label: "Carrinho", icon: FiShoppingBag },
    { id: "cupons", label: "Cupons & Créditos", icon: FiTag },
    { id: "configuracoes", label: "Configurações", icon: FiSettings },
    { id: "suporte", label: "Suporte e Ajuda", icon: FiHelpCircle },
  ];

// Mobile Navigation - FULL SCREEN VERSION
const MobileNavigation = () => (
  <div className="lg:hidden">
    {/* Mobile Header - MOVED DOWN POSITION */}
    <div className="bg-white shadow-sm border-b border-gray-200 p-4 pt-15 fixed top-16 left-0 right-0 z-40">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {navigationItems.find(item => item.id === activeTab)?.label || "Minha Conta"}
        </h1>
        <div className="w-10"></div>
      </div>
    </div>

    {/* Mobile Menu Overlay - FULL SCREEN VERSION */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
        {/* Full screen container */}
        <div className="bg-white h-full w-full overflow-y-auto">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Minha Conta</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-lg truncate">{user.name || 'Usuário'}</p>
                  <p className="text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Items - Full height content */}
          <nav className="p-6">
            <ul className="space-y-3">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all ${
                        activeTab === item.id
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="font-medium text-lg">{item.label}</span>
                    </button>
                  </li>
                );
              })}
              
              {/* Logout Button */}
              <li className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    localStorage.clear();
                    // window.location.href = '/login';
                  }}
                  className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <FiLogOut size={24} />
                  <span className="font-medium text-lg">Sair</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Bottom padding for better scrolling */}
          <div className="h-20"></div>
        </div>
      </div>
    )}
  </div>
);

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <aside className="hidden lg:block w-64 bg-white shadow-lg border-r border-gray-200 h-screen sticky top-0 overflow-y-auto drawer-scroll">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Minha Conta</h2>
        <p className="text-gray-500 text-sm mb-8">Gerencie suas informações</p>
        
        {/* User Info */}
        {user && (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xl">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.name || 'Usuário'}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
            
            {/* Logout Button */}
            <li className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.clear();
                  // window.location.href = '/login';
                }}
                className="w-full flex items-center space-x-3 p-4 rounded-xl text-red-600 hover:bg-red-50 transition-all"
              >
                <FiLogOut size={20} />
                <span className="font-medium">Sair</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );

  // ✅ UPDATED: No token, just session cookies
  const fetchProfile = async () => {
    try {
      console.log("🔥 Fetching profile with session cookies...");

      // 1️⃣ Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Fetch profile using session cookies only
      const res = await fetch("http://localhost:8000/profile", { 
        method: "GET",
        credentials: "include", // This sends the session cookie automatically
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Profile response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated");
        localStorage.removeItem('user');
        localStorage.removeItem('loggedIn');
        //window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ PROFILE LOADED:", data);
      setUser(data);

    } catch (err) {
      console.error("Erro ao buscar perfil:", err.message);
      
      // If authentication error, redirect to login
      if (err.message.includes('401') || err.message.includes('network')) {
        //window.location.href = '/login';
        return;
      }
      
      // Only use mock data for non-auth errors
      setUser(mockUserProfile);
    }
  };

  // ✅ UPDATED: Save profile with session cookies
  const saveProfile = async () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado!");
      return;
    }

    try {
      // 1️⃣ Get CSRF cookie
      console.log("Getting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token from cookies
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Save profile with session cookies
      const res = await fetch("http://localhost:8000/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          tel: user.tel,
          cpf: user.cpf,
          birth_date: user.birth_date,
          avatar: user.avatar,
          marketing: user.marketing,
        }),      
      });

      const data = await res.json();
      
      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      if (!res.ok) throw new Error(data.message || "Erro ao salvar");

      console.log("✅ PROFILE SAVED:", data);
      setUser(data);
      setIsEditingProfile(false);
      alert("Perfil salvo com sucesso!");

    } catch (err) {
      console.error("Erro ao salvar:", err.message);
      alert("Error!");
    }
  };

  // ✅ UPDATED: Fetch addresses with session cookies
  const fetchAddresses = async () => {
    try {
      console.log("🔄 Fetching addresses...");

      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/addresses", {
        method: "GET",
        credentials: "include", // Session cookies sent automatically
        headers: { 
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Addresses response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for addresses");
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch addresses");

      setUser(prev => ({ ...prev, addresses: data }));
      console.log("✅ ADDRESSES:", data);
    } catch (err) {
      console.error("❌ Error fetching addresses:", err);
    }
  };

  // ✅ UPDATED: Save address with session cookies
  const saveAddress = async (e) => {
    e.preventDefault();
    console.log("🚀 saveAddress triggered");

    try {
      // 1️⃣ Get CSRF cookie
      console.log("🌐 Requesting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("❌ CSRF token not found");
      console.log("🔑 CSRF token found");

      // 3️⃣ Send POST request with session cookies
      console.log("📨 Sending POST request to /addresses...", newAddress);
      const res = await fetch("http://localhost:8000/addresses", {
        method: "POST",
        credentials: "include", // Session cookies sent automatically
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(newAddress),
      });

      console.log("📬 Response status:", res.status);

      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      if (res.ok) {
        const newAddr = await res.json();       
        console.log("✅ Address added successfully:", newAddr);
        setUser(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
        setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
        alert("Endereço adicionado!");
      } else {
        const data = await res.json();
        console.warn("⚠️ Failed to add address:", data);
        alert(data.message || "Erro ao adicionar endereço!");
      }
    } catch (err) {
      console.error("❌ Error in saveAddress:", err);
      alert("Erro ao adicionar endereço!");
    }
  };

  // ✅ UPDATED: Edit address with session cookies
  const editAddress = async (id) => {
    const addressToSave = user.addresses.find((addr) => addr.id === id);
    if (!addressToSave) return alert("Endereço não encontrado!");

    try {
      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send PUT request with session cookies
      const res = await fetch(`http://localhost:8000/addresses/${id}`, {
        method: "PUT",
        credentials: "include", // Session cookies sent automatically
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(addressToSave),
      });

      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar endereço");
      }

      // 4️⃣ Update UI
      await fetchAddresses();
      setEditAddressId(null);
      alert("✅ Endereço atualizado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao editar endereço:", err);
      alert("Erro ao salvar endereço!");
    }
  };


 // ✅ ADDED: Fetch wishlist with session cookies - DEBUG VERSION
const fetchWishlist = async () => {
  try {
    setLoadingWishlist(true);
    console.log("🔄 STARTING fetchWishlist...");

    // Check authentication status first
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('loggedIn');
    console.log("🔐 Auth check - userData:", userData, "loggedIn:", loggedIn);

    // 1️⃣ Get CSRF cookie first
    console.log("🌐 Step 1: Getting CSRF cookie...");
    const csrfResponse = await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include",
    });
    console.log("🔐 CSRF cookie response status:", csrfResponse.status);
    console.log("🍪 Current cookies:", document.cookie);

    // 2️⃣ Fetch wishlist using session cookies
    console.log("🌐 Step 2: Fetching wishlist from API...");
    const wishlistUrl = "http://localhost:8000/api/wishlist";
    console.log("📡 API URL:", wishlistUrl);
    
    const res = await fetch(wishlistUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    console.log("🔥 Wishlist response status:", res.status);
    console.log("🔥 Wishlist response ok:", res.ok);
    console.log("🔥 Wishlist response headers:", Object.fromEntries(res.headers.entries()));

    if (res.status === 401) {
      console.log("🚨 401 - Not authenticated for wishlist");
      localStorage.removeItem('user');
      localStorage.removeItem('loggedIn');
      alert("Sua sessão expirou. Por favor, faça login novamente.");
      // window.location.href = '/login';
      return;
    }

    if (res.status === 404) {
      console.log("🚨 404 - Wishlist endpoint not found");
      alert("Endpoint da wishlist não encontrado. Verifique a rota da API.");
      return;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🚨 HTTP error details:", {
        status: res.status,
        statusText: res.statusText,
        response: errorText
      });
      throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
    }

    const data = await res.json();
    console.log("✅ FULL API RESPONSE DATA:", data);
    
    // Check the structure of the response
    if (!data) {
      console.log("❌ API returned no data");
      setWishlist([]);
      return;
    }

    if (data.error) {
      console.log("❌ API returned error:", data.error);
      alert(`Erro na API: ${data.error}`);
      setWishlist([]);
      return;
    }

    // Handle different possible response structures
    const wishlistData = data.wishlist || data.items || data.data || [];
    console.log("📦 EXTRACTED WISHLIST DATA:", wishlistData);
    console.log("📦 WISHLIST ARRAY LENGTH:", wishlistData.length);

    if (wishlistData.length === 0) {
      console.log("📦 WISHLIST IS EMPTY - no items found");
      setWishlist([]);
      return;
    }

    // Detailed item debugging
    wishlistData.forEach((item, index) => {
      console.log(`📦 Item ${index} FULL DATA:`, JSON.stringify(item, null, 2));
      console.log(`📦 Item ${index} product exists:`, !!item.product);
      console.log(`📦 Item ${index} product_id:`, item.product_id);
      if (item.product) {
        console.log(`📦 Item ${index} product keys:`, Object.keys(item.product));
        console.log(`📦 Item ${index} product title:`, item.product.title);
        console.log(`📦 Item ${index} product price:`, item.product.price);
      } else {
        console.log(`📦 Item ${index} has NO product data`);
      }
    });

    setWishlist(wishlistData);
    console.log("✅ WISHLIST STATE UPDATED");

  } catch (err) {
    console.error("❌ Error fetching wishlist:", err.message);
    console.error("❌ Full error:", err);
    
    // More specific error handling
    if (err.message.includes('Failed to fetch')) {
      console.error("🌐 Network error - API might be down or CORS issue");
      alert("Erro de conexão. Verifique se o servidor está rodando.");
    } else if (err.message.includes('JSON')) {
      console.error("📄 JSON parse error - API might be returning HTML/error page");
      alert("Erro no formato da resposta da API.");
    }
    
    setWishlist([]);
  } finally {
    setLoadingWishlist(false);
    console.log("🏁 fetchWishlist completed");
  }
};

  
  // ✅ ADDED: Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      console.log("🗑️ Removing product from wishlist:", productId);

      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send DELETE request
      const res = await fetch(`http://localhost:8000/api/wishlist/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from wishlist");
      }

      // 4️⃣ Update local state
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      console.log("✅ Product removed from wishlist");
      alert("Produto removido dos desejos!");

    } catch (err) {
      console.error("❌ Error removing from wishlist:", err);
      alert("Erro ao remover produto dos desejos!");
    }
  };

  // ✅ ADDED: Toggle product in wishlist (add/remove)
  const toggleWishlist = async (productId) => {
    try {
      console.log("🔄 Toggling wishlist for product:", productId);

      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send POST request to toggle
      const res = await fetch("http://localhost:8000/api/wishlist/toggle", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to toggle wishlist");
      }

      console.log("✅ Wishlist toggled:", data);

      // Refresh wishlist if we're on the wishlist tab
      if (activeTab === "desejos") {
        fetchWishlist();
      }

      return data;

    } catch (err) {
      console.error("❌ Error toggling wishlist:", err);
      alert("Erro ao atualizar lista de desejos!");
    }
  };

 

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      console.log("🔄 Fetching cart...");

      // 1️⃣ Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Fetch cart using session cookies
      const res = await fetch("http://localhost:8000/api/cart", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Cart response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for cart");
        return;
      }

      if (!res.ok) {
        // Se não huma API de carrinho, usar dados mock
        console.log("⚠️ Cart API not available, using mock data");
        const mockCart = [
          {
            id: 1,
            product_id: "68f29c23926f510c96cebea4",
            quantity: 2,
            product: {
              id: "68f29c23926f510c96cebea4",
              name: "Produto Exemplo 1",
              price: 29.99,
              image: "https://via.placeholder.com/150",
              description: "Descrição do produto exemplo 1",
              category: "Categoria A"
            }
          },
          {
            id: 2,
            product_id: "68f29c23926f510c96cebea5",
            quantity: 1,
            product: {
              id: "68f29c23926f510c96cebea5",
              name: "Produto Exemplo 2",
              price: 49.99,
              image: "https://via.placeholder.com/150",
              description: "Descrição do produto exemplo 2",
              category: "Categoria B"
            }
          }
        ];
        setCart(mockCart);
        calculateTotal(mockCart);
        return;
      }

      const data = await res.json();
      console.log("✅ CART LOADED:", data);
      setCart(data.cart || []);
      calculateTotal(data.cart || []);

    } catch (err) {
      console.error("❌ Error fetching cart:", err.message);
      // Usar dados mock em caso de erro
      const mockCart = [
        {
          id: 1,
          product_id: "68f29c23926f510c96cebea4",
          quantity: 2,
          product: {
            id: "68f29c23926f510c96cebea4",
            name: "Produto Exemplo 1",
            price: 29.99,
            image: "https://via.placeholder.com/150",
            description: "Descrição do produto exemplo 1",
            category: "Categoria A"
          }
        }
      ];
      setCart(mockCart);
      calculateTotal(mockCart);
    } finally {
      setLoadingCart(false);
    }
  };

  // ✅ NOVO: Calculate cart total
  const calculateTotal = (cartItems) => {
    const total = cartItems.reduce((sum, item) => {
      const product = item.product || {
        price: 0
      };
      return sum + (product.price * item.quantity);
    }, 0);
    setCartTotal(total);
  };

  // ✅ NOVO: Update quantity in cart
  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    try {
      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send PUT request to update quantity
      const res = await fetch(`http://localhost:8000/api/cart/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      if (res.ok) {
        // Atualizar estado local
        const updatedCart = cart.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        setCart(updatedCart);
        calculateTotal(updatedCart);
      } else {
        // Fallback: atualizar localmente
        const updatedCart = cart.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        );
        setCart(updatedCart);
        calculateTotal(updatedCart);
      }
    } catch (err) {
      console.error("❌ Error updating cart quantity:", err);
      // Fallback: atualizar localmente
      const updatedCart = cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCart(updatedCart);
      calculateTotal(updatedCart);
    }
  };

  // ✅ NOVO: Remove product from cart
  const removeFromCart = async (productId) => {
    try {
      // 1️⃣ Get CSRF cookie
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // 2️⃣ Extract CSRF token
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      // 3️⃣ Send DELETE request
      const res = await fetch(`http://localhost:8000/api/cart/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        //window.location.href = '/login';
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from cart");
      }

      // 4️⃣ Update local state
      const updatedCart = cart.filter(item => item.product_id !== productId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
      console.log("✅ Product removed from cart");

    } catch (err) {
      console.error("❌ Error removing from cart:", err);
      // Fallback: remover localmente
      const updatedCart = cart.filter(item => item.product_id !== productId);
      setCart(updatedCart);
      calculateTotal(updatedCart);
      alert("Produto removido do carrinho!");
    }
  };

  // ✅ NOVO: Process checkout
  const processCheckout = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    alert(`Checkout processado! Total: R$ ${cartTotal.toFixed(2)}`);
    // Aqui você implementaria a lógica real de checkout
  };

  // Check authentication on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (!userData || !loggedIn) {
      console.log("🚨 No user data found, redirecting to login");
      //window.location.href = '/login';
    }
  }, []);

  if (!user) return <p className="text-black p-4 lg:p-8">Carregando perfil...</p>;

  const handleProfileChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    setUser({
      ...user,
      addresses: user.addresses.map(addr =>
        addr.id === id ? { ...addr, [e.target.name]: e.target.value } : addr
      ),
    });
  };
  const handlePaymentChange = (e) => setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  // Responsive Container
  const ResponsiveContainer = ({ children, className = "" }) => (
    <div className={`w-full mx-auto pt-35 px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );

  // Card Component
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {children}
    </div>
  );

  // Button Component
  const Button = ({ children, variant = "primary", className = "", ...props }) => {
    const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2";
    
    const variants = {
      primary: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
      secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    };

    return (
      <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  };

  // Input Component
  const Input = ({ label, className = "", ...props }) => (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${className}`}
        {...props}
      />
    </div>
  );

  // ✅ UPDATED: Wishlist Tab Component - MOBILE RESPONSIVE
  const WishlistTab = () => {
    if (loadingWishlist) {
      return (
        <div className="text-center py-8 text-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          Carregando seus desejos...
        </div>
      );
    }

    if (wishlist.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg mb-2">Sua lista de desejos está vazia</p>
          <p className="text-gray-400 mb-4">Adicione produtos que você gosta para vê-los aqui!</p>
          <Button onClick={fetchWishlist}>
            🔄 Recarregar Lista
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meus Desejos</h2>
            <p className="text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchWishlist}
            className="flex items-center space-x-2 border-1 border-black"
          >
            <span>🔄</span>
        
          </Button>
        </div>

        {/* Wishlist Items */}
        <div className="space-y-4">
          {wishlist.map((item, index) => {
            const product = item.product || {};
            const productTitle = product.title || product.name || `Produto ${item.product_id}`;
            const productPrice = product.price || 0;
            const productImage = product.image || product.image_url || null;
            const productDescription = product.description || 'Informação do produto não disponível';
            const productCategory = product.category || 'Desconhecida';

            const formattedPrice = productPrice 
              ? parseFloat(productPrice).toFixed(2).replace('.', ',')
              : '0,00';

            return (
              <Card key={item.id || index} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-full sm:w-24 h-48 sm:h-24">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt={productTitle}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Sem imagem</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {productTitle}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {productDescription}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">
                            R$ {formattedPrice}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                            {productCategory}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => removeFromWishlist(item.product_id)}
                          className="flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <span>×</span>
                          <span className="sm:hidden">Remover</span>
                        </Button>
                        <Button
                          onClick={() => {
                            console.log('Add to cart:', item.product_id);
                            alert(`Produto "${productTitle}" adicionado ao carrinho!`);
                          }}
                          className="flex items-center justify-center space-x-2"
                        >
                          <FiShoppingCart size={16} />
                          <span className="sm:hidden">Comprar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Wishlist Summary */}
        <Card className="p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Resumo da Lista de Desejos
            </h3>
            <div className="text-right">
              <p className="text-gray-600">
                Total de itens: <span className="font-bold text-gray-900">{wishlist.length}</span>
              </p>
              <p className="text-gray-600">
                Valor total: <span className="font-bold text-green-600 text-lg">
                  R$ {wishlist.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // ✅ UPDATED: Cart Tab Component - MOBILE RESPONSIVE
  const CartTab = () => {
    if (loadingCart) {
      return <div className="text-center py-8 text-black">Carregando seu carrinho...</div>;
    }

    if (cart.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
          <p className="text-gray-400">Adicione produtos para vê-los aqui!</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Meu Carrinho</h2>
            <p className="text-gray-500 mt-1">
              {cart.length} {cart.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.map((item, index) => {
            const product = item.product || {
              id: item.product_id,
              name: 'Product ' + item.product_id,
              price: 0,
              image: '',
              description: 'Product information not available',
              category: 'Unknown'
            };

            const itemTotal = product.price * item.quantity;

            return (
              <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-full sm:w-20 h-40 sm:h-20">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-black font-bold text-lg">
                            R$ {product.price ? parseFloat(product.price).toFixed(2) : '0,00'}
                          </span>
                          <span className="text-gray-500 text-sm capitalize">{product.category}</span>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                          
                          <span className="text-green-600 font-bold text-lg">
                            R$ {itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <div className="flex flex-row sm:flex-col gap-2">
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                          title="Remover do carrinho"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Cart Summary */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Resumo do Pedido</h3>
            <span className="text-2xl font-bold text-green-600">
              R$ {cartTotal.toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t border-gray-200">
              <span>Total</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={processCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold text-lg transition-colors"
          >
            Finalizar Compra
          </button>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Mobile Navigation */}
      <MobileNavigation />

      <div className="flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          {/* Mobile padding top */}
          <div className="lg:hidden pt-16"></div>
          
          {/* Tab Content */}
          <div className="p-4 lg:p-8">
            {/* Perfil */}
            {activeTab === "perfil" && (
              <ResponsiveContainer className="max-w-2xl">
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Informações do Usuário</h2>
                    <Button
                      variant={isEditingProfile ? "outline" : "primary"}
                      onClick={toggleEditProfile}
                    >
                      {isEditingProfile ? "Cancelar" : "Editar"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome"
                      name="name"
                      value={user.name || ''}
                      onChange={handleProfileChange}
                      placeholder="Nome"
                      disabled={!isEditingProfile}
                    />
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={user.email || ''}
                      onChange={handleProfileChange}
                      placeholder="Email"
                      disabled={!isEditingProfile}
                    />
                    <Input
                      label="Telefone"
                      name="tel"
                      value={user.tel || ''}
                      onChange={handleProfileChange}
                      placeholder="Telefone"
                      disabled={!isEditingProfile}
                    />
                    <Input
                      label="CPF"
                      name="cpf"
                      value={user.cpf || ''}
                      onChange={handleProfileChange}
                      placeholder="CPF"
                      disabled={!isEditingProfile}
                    />
                    <Input
                      label="Data de Nascimento"
                      type="date"
                      name="birth_date"
                      value={user.birth_date || ''}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      className="md:col-span-2"
                    />
                  </div>
                  {isEditingProfile && (
                    <div className="flex justify-end pt-6">
                      <Button onClick={saveProfile}>
                        Salvar
                      </Button>
                    </div>
                  )}
                </Card>
              </ResponsiveContainer>
            )}

            {/* Endereços */}
            {activeTab === "enderecos" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900">Endereços</h2>
                  {user.addresses?.map((addr) => (
                    <div key={addr.id} className="border-b last:border-b-0 py-4 text-gray-900">
                      {editAddressId === addr.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <Input
                            name="street"
                            value={addr.street || ''}
                            onChange={(e) => handleEditAddressChange(addr.id, e)}
                            placeholder="Rua"
                          />
                          <Input
                            name="number"
                            value={addr.number || ''}
                            onChange={(e) => handleEditAddressChange(addr.id, e)}
                            placeholder="Número"
                          />
                          <Input
                            name="city"
                            value={addr.city || ''}
                            onChange={(e) => handleEditAddressChange(addr.id, e)}
                            placeholder="Cidade"
                          />
                          <Input
                            name="state"
                            value={addr.state || ''}
                            onChange={(e) => handleEditAddressChange(addr.id, e)}
                            placeholder="Estado"
                          />
                          <Input
                            name="zip"
                            value={addr.zip || ''}
                            onChange={(e) => handleEditAddressChange(addr.id, e)}
                            placeholder="CEP"
                            className="md:col-span-2"
                          />
                          <button 
                            onClick={() => editAddress(addr.id)}
                            className="bg-green-600 text-white py-2 px-4 rounded col-span-full mt-2 hover:bg-green-700 transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{addr.street}, {addr.number}</p>
                            <p className="text-gray-600">{addr.city} - {addr.state}, {addr.zip}</p>
                          </div>
                          <button 
                            onClick={() => setEditAddressId(addr.id)}
                            className="text-blue-600 hover:underline self-start sm:self-auto"
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveAddress}>
                    <Input
                      name="street"
                      value={newAddress.street}
                      onChange={handleAddressChange}
                      placeholder="Rua"
                      required
                    />
                    <Input
                      name="number"
                      value={newAddress.number}
                      onChange={handleAddressChange}
                      placeholder="Número"
                      required
                    />
                    <Input
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      placeholder="Cidade"
                      required
                    />
                    <Input
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      placeholder="Estado"
                      required
                    />
                    <Input
                      name="zip"
                      value={newAddress.zip}
                      onChange={handleAddressChange}
                      placeholder="CEP"
                      required
                      className="md:col-span-2"
                    />
                    <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-full hover:bg-blue-700 transition-colors">
                      Adicionar
                    </button>
                  </form>
                </Card>
              </ResponsiveContainer>
            )}

            {/* Other tabs remain similar but wrapped with ResponsiveContainer and Card */}
            {activeTab === "desejos" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <WishlistTab />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "carrinho" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <CartTab />
                </Card>
              </ResponsiveContainer>
            )}

            {/* Add other tabs following the same pattern... */}
            {activeTab === "pedidos" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Histórico de pedidos</p>
                  </div>
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "cupons" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Cupons</p>
                  </div>
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "configuracoes" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Configurações</p>
                  </div>
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "suporte" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Suporte</p>
                  </div>
                </Card>
              </ResponsiveContainer>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;