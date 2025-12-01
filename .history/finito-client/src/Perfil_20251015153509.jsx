import React, { useState, useEffect } from "react";

const mockUserProfile = {
  name: "",
  email: "",
  tel: "",
  cpf: "",
  birth_date: "",
  avatar: "",
  marketing: true, // ⚡ renamed to match backend
  addresses: [
    { id: 1, street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234-567" },
    { id: 2, street: "Avenida Brasil", number: "456", city: "São Paulo", state: "SP", zip: "23456-789" },
  ],
  payment: [
    { id: 1, cardNumber: "**** **** **** 1234", cardName: "", expiry: "" },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(mockUserProfile);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch profile once on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Get CSRF cookie from Laravel Sanctum
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Get user profile
      const res = await fetch("http://localhost:8000/api/profile", {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erro ao buscar perfil");

      setUser(data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err.message);
      alert("Erro ao buscar perfil. Redirecionando para login...");
    }
  };

  const saveProfile = async () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado ou não possui ID!");
      return;
    }

    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      const xsrfToken = decodeURIComponent(
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1]
      );

      const res = await fetch("http://localhost:8000/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": xsrfToken,
          "X-Requested-With": "XMLHttpRequest",
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

      if (!res.ok) throw new Error(data.message || "Erro ao salvar perfil");

      setUser(data);
      setIsEditingProfile(false);
      alert("Perfil salvo com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar perfil:", err.message);
      alert("Erro ao salvar perfil!");
    }
  };

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

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
          <li className="cursor-pointer text-red-600" onClick={() => alert("Logout")}>Sair</li>
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
              <input type="text" name="name" value={user.name} onChange={handleProfileChange} placeholder="Nome" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email} onChange={handleProfileChange} placeholder="Email" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="tel" value={user.tel} onChange={handleProfileChange} placeholder="Telefone" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf} onChange={handleProfileChange} placeholder="CPF" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="birth_date" value={user.birth_date} onChange={handleProfileChange} placeholder="dd/mm/aaaa" className="border border-black p-2 rounded text-black" disabled={!isEditingProfile} />

              {isEditingProfile && (
                <button
                  onClick={saveProfile}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Salvar
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
