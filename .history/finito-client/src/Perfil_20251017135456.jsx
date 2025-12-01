import React, { useState, useEffect } from "react";

const mockUserProfile = {
  name: "João Silva",
  email: "joao@example.com",
  tel: "11999999999",
  cpf: "123.456.789-00",
  birth_date: "1990-01-01",
  avatar: "",
  marketing: true,
  addresses: [
    { id: 1, street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234-567" },
    { id: 2, street: "Avenida Brasil", number: "456", city: "São Paulo", state: "SP", zip: "23456-789" },
  ],
  payment: [
    { id: 1, cardNumber: "**** **** **** 1234", cardName: "João Silva", expiry: "12/25" },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      let token = localStorage.getItem("token");

      // 🚀 DEV fallback: set a fake token if missing
      if (!token) {
        console.log("⚠️ TOKEN MISSING! Using dev-mode mock profile.");
        setUser(mockUserProfile);
        return;
      }

      const res = await fetch("http://localhost:8000/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          console.log("🚨 TOKEN EXPIRED");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        throw new Error(data.message || "Erro ao buscar perfil");
      }

      setUser(data);
      fetchAddresses(token);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err.message);
      setUser(mockUserProfile);
    }
  };

  const fetchAddresses = async (token) => {
    if (!token) {
      console.log("⚠️ No token found, skipping addresses fetch (dev mode).");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/addresses", {
        method: "GET",
        credentials: "include",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch addresses");

      setUser(prev => ({ ...prev, addresses: data }));
      console.log("✅ ADDRESSES:", data);
    } catch (err) {
      console.error("❌ Error fetching addresses:", err);
    }
  };

  // ----------------- Handlers -----------------
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

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  // ----------------- JSX -----------------
  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8">Menu</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
          <li className="cursor-pointer text-red-600" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Sair</li>
        </ul>
      </aside>

      <main className="flex-1 p-2 text-black pt-40">
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Informações do Usuário</h2>
              <button onClick={toggleEditProfile} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name || ''} onChange={handleProfileChange} placeholder="Nome" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email || ''} onChange={handleProfileChange} placeholder="Email" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="tel" value={user.tel || ''} onChange={handleProfileChange} placeholder="Telefone" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf || ''} onChange={handleProfileChange} placeholder="CPF" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="date" name="birth_date" value={user.birth_date || ''} onChange={handleProfileChange} className="border p-2 rounded text-black" disabled={!isEditingProfile} />
            </div>
          </div>
        )}

        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4 text-black">Endereços</h2>
            {user.addresses?.map((addr) => (
              <div key={addr.id} className="border-b last:border-b-0 py-3 text-black">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input type="text" name="street" value={addr.street || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
                    <input type="text" name="number" value={addr.number || ''} onChange={(e) => handleEditAddressChange(addr.id, e)} className="border p-2 rounded text-black"/>
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
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
