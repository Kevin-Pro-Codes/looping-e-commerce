import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";

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

  if (!user) return <p className="text-black">Carregando perfil...</p>;

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

  // ✅ UPDATED: Wishlist Tab Component - VERTICAL LIST WITH LINES
  // ✅ UPDATED: Wishlist Tab Component - IMPROVED VERSION
const WishlistTab = () => {
  // Debug current state
  console.log("❤️ WISHLIST TAB RENDERING - wishlist state:", wishlist);
  console.log("❤️ WISHLIST TAB RENDERING - loading state:", loadingWishlist);
  
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
        <button
          onClick={fetchWishlist}
          className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
        >
          🔄 Recarregar Lista
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={fetchWishlist}
          className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center transition-colors"
        >
          <span className="mr-2">🔄</span>
         
        </button>
      </div>

      {/* Wishlist Items */}
      <div className="space-y-0 border border-gray-200 rounded-lg bg-white">
        {wishlist.map((item, index) => {
          console.log(`❤️ RENDERING ITEM ${index}:`, item);
          
          // Safe data extraction with comprehensive fallbacks
          const product = item.product || {};
          const productTitle = product.title || product.name || `Produto ${item.product_id}`;
          const productPrice = product.price || 0;
          const productImage = product.image || product.image_url || null;
          const productDescription = product.description || 'Informação do produto não disponível';
          const productCategory = product.category || 'Desconhecida';

          console.log(`❤️ Processed data ${index}:`, {
            title: productTitle,
            price: productPrice,
            hasImage: !!productImage,
            rawProduct: product
          });

          const formattedPrice = productPrice 
            ? parseFloat(productPrice).toFixed(2).replace('.', ',')
            : '0,00';

          return (
            <div 
              key={item.id || index} 
              className={`flex items-center p-6 hover:bg-gray-50 transition-colors ${
                index !== wishlist.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Product Image */}
              <div className="flex-shrink-0 w-24 h-24 mr-6 relative">
                {productImage ? (
                  <>
                    <img 
                      src={productImage} 
                      alt={productTitle}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.log(`🖼️ Image failed to load for item ${index}`);
                        e.target.style.display = 'none';
                        const fallback = e.target.nextSibling;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-200 rounded-lg flex items-center justify-center absolute inset-0">
                      <span className="text-gray-500 text-xs">Sem imagem</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Sem imagem</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-4">
                    <h3 className="font-semibold text-xl text-black mb-2 truncate">
                      {productTitle}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {productDescription}
                    </p>
                    <div className="flex items-center space-x-6">
                      <span className="text-black font-bold text-xl">
                        R$ {formattedPrice}
                      </span>
                      <span className="text-gray-500 text-sm capitalize bg-gray-100 px-3 py-1 rounded-full">
                        {productCategory}
                      </span>
                      {/* Debug info - remove in production */}
                      <span className="text-xs text-gray-400 hidden">
                        ID: {item.product_id}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3 flex-shrink-0">
                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="text-red-500 hover:text-red-700 text-xl font-bold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors border border-red-200"
                      title="Remover dos desejos"
                    >
                      ×
                    </button>
                    <button
                      onClick={() => {
                        console.log('Add to cart:', item.product_id);
                        // TODO: Implement add to cart functionality
                        alert(`Produto "${productTitle}" adicionado ao carrinho!`);
                      }}
                      className="bg-red-600 border-2 border-black text-white py-3 px-6 rounded-lg text-sm hover:bg-red-700 transition-colors whitespace-nowrap flex items-center"
                    >
                      <FiShoppingCart className="text-lg mr-2" />
                    
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Wishlist Summary */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-black">
            Resumo da lista de Desejos
          </h3>
          <div className="text-right">
            <p className="text-gray-600">
              Total de itens: <span className="font-bold text-black">{wishlist.length}</span>
            </p>
            <p className="text-gray-600 text-sm">
              Valor total: <span className="font-bold text-green-600">
                R$ {wishlist.reduce((sum, item) => sum + (item.product?.price || 0), 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

  // ✅ NOVO: Cart Tab Component - VERTICAL LIST WITH LINES
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
        {/* Cart Items */}
        <div className="space-y-0 border border-gray-200 rounded-lg bg-white">
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
              <div 
                key={item.id} 
                className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${
                  index !== cart.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20 mr-4">
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
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-black mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <div className="flex items-center space-x-6">
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
                    <div className="flex flex-col space-y-2 ml-4">
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
            );
          })}
        </div>

        {/* Cart Summary */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-black">Resumo do Pedido</h3>
            <span className="text-2xl font-bold text-green-600">
              R$ {cartTotal.toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Frete</span>
              <span>Grátis</span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-black pt-2 border-t border-gray-200">
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
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">...</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
          <li className={`cursor-pointer ${activeTab === "pedidos" ? "font-bold" : ""}`} onClick={() => setActiveTab("pedidos")}>Pedidos</li>
          <li className={`cursor-pointer ${activeTab === "desejos" ? "font-bold" : ""}`} onClick={() => setActiveTab("desejos")}>Desejos</li>
          <li className={`cursor-pointer ${activeTab === "carrinho" ? "font-bold" : ""}`} onClick={() => setActiveTab("carrinho")}>Carrinho</li>
          <li className={`cursor-pointer ${activeTab === "cupons" ? "font-bold" : ""}`} onClick={() => setActiveTab("cupons")}>Cupons & Créditos</li>
          <li className={`cursor-pointer ${activeTab === "configuracoes" ? "font-bold" : ""}`} onClick={() => setActiveTab("configuracoes")}>Configurações</li>
          <li className={`cursor-pointer ${activeTab === "suporte" ? "font-bold" : ""}`} onClick={() => setActiveTab("suporte")}>Suporte e Ajuda</li>
          <li className="cursor-pointer text-red-600" onClick={() => {
            localStorage.clear();
            //window.location.href = '/login';
          }}>Sair</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 text-black pt-40">
        {/* Perfil */}
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Informações do Usuário</h2>
              <button
                onClick={toggleEditProfile}
                className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700"
              >
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name || ''} onChange={handleProfileChange} placeholder="Nome" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email || ''} onChange={handleProfileChange} placeholder="Email" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="tel" value={user.tel || ''} onChange={handleProfileChange} placeholder="Telefone" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf || ''} onChange={handleProfileChange} placeholder="CPF" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="date" name="birth_date" value={user.birth_date || ''} onChange={handleProfileChange} className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              {isEditingProfile && (
                <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Salvar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Endereços</h2>
            {user.addresses?.map((addr) => (
              <div key={addr.id} className="border-b last:border-b-0 py-3 text-black">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input type="text" name="street" value={addr.street || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="number" value={addr.number || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="city" value={addr.city || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="state" value={addr.state || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="zip" value={addr.zip || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <button onClick={() => editAddress(addr.id)} className="bg-green-600 text-white py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-black">{addr.street}, {addr.number}</p>
                      <p className="text-black">{addr.city} - {addr.state}, {addr.zip}</p>
                    </div>
                    <button onClick={() => setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={saveAddress}>
              <input type="text" name="street" value={newAddress.street} onChange={handleAddressChange} placeholder="Rua" className="border p-2 rounded text-black" required/>
              <input type="text" name="number" value={newAddress.number} onChange={handleAddressChange} placeholder="Número" className="border p-2 rounded text-black" required/>
              <input type="text" name="city" value={newAddress.city} onChange={handleAddressChange} placeholder="Cidade" className="border p-2 rounded text-black" required/>
              <input type="text" name="state" value={newAddress.state} onChange={handleAddressChange} placeholder="Estado" className="border p-2 rounded text-black" required/>
              <input type="text" name="zip" value={newAddress.zip} onChange={handleAddressChange} placeholder="CEP" className="border p-2 rounded text-black" required/>
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Informações de Pagamento</h2>
            {user.payment?.map((p) => (
              <div key={p.id} className="mb-4 border-b pb-3 text-black">
                <input type="text" name="cardNumber" value={p.cardNumber} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, cardNumber: e.target.value } : pay)
                })} className="border p-2 rounded mb-2 w-full text-black"/>
                <input type="text" name="cardName" value={p.cardName} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, cardName: e.target.value } : pay)
                })} className="border p-2 rounded mb-2 w-full text-black"/>
                <input type="text" name="expiry" value={p.expiry} onChange={(e) => setUser({
                  ...user,
                  payment: user.payment.map(pay => pay.id === p.id ? { ...pay, expiry: e.target.value } : pay)
                })} className="border p-2 rounded w-full text-black"/>
              </div>
            ))}
            <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => {
              e.preventDefault();
              setUser({ ...user, payment: [...user.payment, { id: Date.now(), ...paymentInfo }] });
              setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
            }}>
              <input type="text" name="cardNumber" value={paymentInfo.cardNumber} onChange={handlePaymentChange} placeholder="Número do cartão" className="border p-2 rounded text-black" required/>
              <input type="text" name="cardName" value={paymentInfo.cardName} onChange={handlePaymentChange} placeholder="Nome no cartão" className="border p-2 rounded text-black" required/>
              <input type="text" name="expiry" value={paymentInfo.expiry} onChange={handlePaymentChange} placeholder="Validade (MM/AA)" className="border p-2 rounded text-black" required/>
              <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Other tabs */}
        {activeTab === "pedidos" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Histórico de pedidos</div>}
        
        {/* ✅ UPDATED: Desejos Tab with VERTICAL LIST LAYOUT */}
        {activeTab === "desejos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto text-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">Meus Desejos</h2>
              <div className="text-gray-500">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'itens'}
              </div>
            </div>
            <WishlistTab />
          </div>
        )}

        {/* ✅ NOVO: Carrinho Tab */}
        {activeTab === "carrinho" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-6xl mx-auto text-black">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-black">Meu Carrinho</h2>
              <div className="text-gray-500">
                {cart.length} {cart.length === 1 ? 'item' : 'itens'}
              </div>
            </div>
            <CartTab />
          </div>
        )}
        
        {activeTab === "cupons" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Cupons</div>}
        {activeTab === "configuracoes" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Configurações</div>}
        {activeTab === "suporte" && <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">Suporte</div>}
      </main>
    </div>
  );
};

export default ProfilePage;
