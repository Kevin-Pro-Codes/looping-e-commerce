import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ProfileTab from './ProfileTab';
import AddressesTab from './profile/AddressesTab';
import OrdersTab from './OrdersTab';
import WishlistTab from './WishlistTab';
import CartTab from './CartTab';
import CouponsTab from './CouponsTab';
import ConfigurationTab from './ConfigurationTab';
import HelpTab from './HelpTab';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import { ResponsiveContainer, Card } from './SharedComponents';

const recoverSession = async () => {
  try {
    console.log("🔄 Attempting session recovery...");
    
    await fetch("http://localhost:8000/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include",
    });

    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (!csrfToken) {
      throw new Error("No CSRF token available");
    }

    const testResponse = await fetch("http://localhost:8000/api/user", {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (testResponse.status === 401) {
      throw new Error("Session expired");
    }

    console.log("✅ Session recovered successfully");
    return true;
  } catch (error) {
    console.error("❌ Session recovery failed:", error);
    return false;
  }
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", hood: "", complement: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  const deleteAddress = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este endereço?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting address:", id);

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

      const res = await fetch(`http://localhost:8000/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (res.status === 401) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete address");
      }

      setUser(prev => ({
        ...prev,
        addresses: prev.addresses.filter(addr => addr.id !== id)
      }));

      console.log("✅ Address deleted successfully");
      alert("Endereço excluído com sucesso!");

    } catch (err) {
      console.error("❌ Error deleting address:", err);
      alert("Erro ao excluir endereço!");
    }
  };

  const fetchProfile = async () => {
    try {
      console.log("🔥 Fetching profile with session cookies...");

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/profile", { 
        method: "GET",
        credentials: "include",
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
      
      if (err.message.includes('401') || err.message.includes('network')) {
        return;
      }
      
      setUser(mockUserProfile);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado!");
      return;
    }

    try {
      console.log("Getting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

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

  const fetchAddresses = async () => {
    try {
      console.log("🔄 Fetching addresses...");

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/addresses", {
        method: "GET",
        credentials: "include",
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

  const saveAddress = async (e) => {
    e.preventDefault();
    console.log("🚀 saveAddress triggered");

    try {
      console.log("🌐 Requesting CSRF cookie...");
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("❌ CSRF token not found");
      console.log("🔑 CSRF token found");

      console.log("📨 Sending POST request to /addresses...", newAddress);
      const res = await fetch("http://localhost:8000/addresses", {
        method: "POST",
        credentials: "include",
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
        return;
      }

      if (res.ok) {
        const newAddr = await res.json();       
        console.log("✅ Address added successfully:", newAddr);
        setUser(prev => ({ ...prev, addresses: [...prev.addresses, newAddr] }));
        setNewAddress({ street: "", number: "", hood: "", complement: "", city: "", state: "", zip: "" });
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

  const editAddress = async (id) => {
    const addressToSave = user.addresses.find((addr) => addr.id === id);
    if (!addressToSave) return alert("Endereço não encontrado!");

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
      if (!csrfToken) throw new Error("CSRF token not found");

      const res = await fetch(`http://localhost:8000/addresses/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(addressToSave),
      });

      if (res.status === 401) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao atualizar endereço");
      }

      await fetchAddresses();
      setEditAddressId(null);
      alert("✅ Endereço atualizado com sucesso!");
    } catch (err) {
      console.error("❌ Erro ao editar endereço:", err);
      alert("Erro ao salvar endereço!");
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      console.log("🔄 Fetching orders...");

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const res = await fetch("http://localhost:8000/api/orders", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      console.log("🔥 Orders response status:", res.status);

      if (res.status === 401) {
        console.log("🚨 401 - Not authenticated for orders");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error("🚨 Orders API error:", errorData);
        setOrders(generateMockOrders());
        return;
      }

      const data = await res.json();
      console.log("✅ ORDERS LOADED:", data);
      
      setOrders(data.orders || data || []);

    } catch (err) {
      console.error("❌ Error fetching orders:", err.message);
      setOrders(generateMockOrders());
    } finally {
      setLoadingOrders(false);
    }
  };

  const generateMockOrders = () => {
    const statuses = ["entregue", "processando", "enviado", "cancelado"];
    const products = [
      { name: "Tênis Esportivo", price: 299.90 },
      { name: "Camiseta Básica", price: 49.90 },
      { name: "Calça Jeans", price: 129.90 },
      { name: "Jaqueta Corta Vento", price: 189.90 }
    ];

    return Array.from({ length: 8 }, (_, i) => {
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = Array.from({ length: itemsCount }, () => {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        return {
          id: Math.random().toString(36).substr(2, 9),
          product_name: product.name,
          quantity: quantity,
          price: product.price,
          total: product.price * quantity
        };
      });

      const total = orderItems.reduce((sum, item) => sum + item.total, 0);
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 60));

      return {
        id: `ORD${(1000 + i).toString().padStart(4, '0')}`,
        order_number: `#${(1000 + i).toString().padStart(6, '0')}`,
        order_date: orderDate.toISOString().split('T')[0],
        status: status,
        total: total,
        items: orderItems,
        shipping_address: "Av. Principal, 123 - Centro, São Paulo - SP",
        tracking_number: status !== "processando" ? `TRK${Math.random().toString(36).substr(2, 10).toUpperCase()}` : null,
        estimated_delivery: status === "enviado" ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
      };
    }).sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
  };

  const getStatusColor = (status) => {
    const colors = {
      entregue: "bg-green-100 text-green-800",
      processando: "bg-yellow-100 text-yellow-800",
      enviado: "bg-blue-100 text-blue-800",
      cancelado: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const texts = {
      entregue: "Entregue",
      processando: "Processando",
      enviado: "Enviado",
      cancelado: "Cancelado"
    };
    return texts[status] || status;
  };

  const fetchWishlist = async () => {
    try {
      setLoadingWishlist(true);
      console.log("🔄 STARTING fetchWishlist with Native MongoDB...");
  
      const sessionValid = await recoverSession();
      if (!sessionValid) {
        throw new Error("Session invalid - please login again");
      }
  
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
  
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
  
      const wishlistUrl = "http://localhost:8000/api/wishlist";
      
      const res = await fetch(wishlistUrl, {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-XSRF-TOKEN": decodeURIComponent(csrfToken),
          "X-Requested-With": "XMLHttpRequest",
        },
      });
  
      console.log("🔥 MongoDB Wishlist response status:", res.status);
  
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`MongoDB Error: ${errorData.message || 'Unknown error'}`);
      }
  
      const data = await res.json();
      console.log("✅ NATIVE MONGODB WISHLIST RESPONSE:", data);
      
      const wishlistData = data.wishlist || [];
      setWishlist(wishlistData);
  
    } catch (err) {
      console.error("❌ Error fetching Native MongoDB wishlist:", err.message);
      
      if (err.message.includes('Session invalid') || err.message.includes('401')) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      
      alert("Erro ao carregar lista de desejos: " + err.message);
      setWishlist([]);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      console.log("🗑️ Removing product from wishlist:", productId);

      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      if (!csrfToken) throw new Error("CSRF token not found");

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
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from wishlist");
      }

      setWishlist(prev => prev.filter(item => item.product_id !== productId));
      console.log("✅ Product removed from wishlist");
      alert("Produto removido dos desejos!");

    } catch (err) {
      console.error("❌ Error removing from wishlist:", err);
      alert("Erro ao remover produto dos desejos!");
    }
  };

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      console.log("🔄 Fetching cart from MongoDB...");
    
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
    
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
        setCart([]);
        return;
      }
    
      if (!res.ok) {
        const errorData = await res.json();
        console.error("🚨 Cart API error:", errorData);
        throw new Error(`Cart Error: ${errorData.message || 'Unknown error'}`);
      }
    
      const data = await res.json();
      console.log("✅ CART LOADED:", data);
      
      setCart(data.cart || []);
      setCartTotal(data.total || 0);
    
    } catch (err) {
      console.error("❌ Error fetching cart:", err.message);
      setCart([]);
      setCartTotal(0);
    } finally {
      setLoadingCart(false);
    }
  };
  
  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
  
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
  
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
  
      if (!csrfToken) throw new Error("CSRF token not found");
  
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
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update cart quantity");
      }
  
      const updatedCart = cart.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      setCart(updatedCart);
      
      const newTotal = updatedCart.reduce((sum, item) => {
        const product = item.product || { price: 0 };
        return sum + (product.price * item.quantity);
      }, 0);
      setCartTotal(newTotal);
  
      console.log("✅ Cart quantity updated");
  
    } catch (err) {
      console.error("❌ Error updating cart quantity:", err);
      alert("Erro ao atualizar quantidade!");
    }
  };
  
  const removeFromCart = async (productId) => {
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });
  
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
  
      if (!csrfToken) throw new Error("CSRF token not found");
  
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
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove from cart");
      }
  
      const updatedCart = cart.filter(item => item.product_id !== productId);
      setCart(updatedCart);
      
      const newTotal = updatedCart.reduce((sum, item) => {
        const product = item.product || { price: 0 };
        return sum + (product.price * item.quantity);
      }, 0);
      setCartTotal(newTotal);
      
      console.log("✅ Product removed from cart");
      alert("Produto removido do carrinho!");
  
    } catch (err) {
      console.error("❌ Error removing from cart:", err);
      alert("Erro ao remover produto do carrinho!");
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchProfile();
        await fetchAddresses();
        await fetchWishlist();
        await fetchCart();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (activeTab === "pedidos") {
      fetchOrders();
    }
  }, [activeTab]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const loggedIn = localStorage.getItem('loggedIn');
    
    if (!userData || !loggedIn) {
      console.log("🚨 No user data found, redirecting to login");
    }
  }, []);

  if (!user) return <p className="text-black p-4 lg:p-8">Carregando perfil...</p>;

  const handleProfileChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  const handleEditAddressChange = (id, e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.map(addr =>
        addr.id === id ? { ...addr, [name]: value } : addr
      ),
    }));
  };
  const handlePaymentChange = (e) => setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });
      
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      <MobileNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        user={user}
      />

      <div className="flex">
        <DesktopSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
        />

        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="lg:hidden pt-16"></div>
          
          <div className="p-4 lg:p-8">
            {activeTab === "perfil" && (
              <ResponsiveContainer className="max-w-2xl">
                <Card className="p-6">
                  <ProfileTab 
                    user={user}
                    isEditingProfile={isEditingProfile}
                    toggleEditProfile={toggleEditProfile}
                    handleProfileChange={handleProfileChange}
                    saveProfile={saveProfile}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "enderecos" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <AddressesTab 
                    user={user}
                    editAddressId={editAddressId}
                    setEditAddressId={setEditAddressId}
                    newAddress={newAddress}
                    handleEditAddressChange={handleEditAddressChange}
                    handleAddressChange={handleAddressChange}
                    saveAddress={saveAddress}
                    editAddress={editAddress}
                    deleteAddress={deleteAddress}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "pedidos" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <OrdersTab 
                    orders={orders}
                    loadingOrders={loadingOrders}
                    fetchOrders={fetchOrders}
                    setActiveTab={setActiveTab}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "desejos" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <WishlistTab 
                    wishlist={wishlist}
                    loadingWishlist={loadingWishlist}
                    fetchWishlist={fetchWishlist}
                    removeFromWishlist={removeFromWishlist}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "carrinho" && (
              <ResponsiveContainer className="max-w-6xl">
                <Card className="p-6">
                  <CartTab 
                    cart={cart}
                    loadingCart={loadingCart}
                    updateCartQuantity={updateCartQuantity}
                    removeFromCart={removeFromCart}
                    cartTotal={cartTotal}
                  />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "cupons" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <CouponsTab />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "configuracoes" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <ConfigurationTab />
                </Card>
              </ResponsiveContainer>
            )}

            {activeTab === "suporte" && (
              <ResponsiveContainer className="max-w-3xl">
                <Card className="p-6">
                  <HelpTab />
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