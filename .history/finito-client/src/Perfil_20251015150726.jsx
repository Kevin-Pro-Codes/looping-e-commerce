import React, { useState, useEffect } from "react";

const mockUserProfile = {
  name: "",
  email: "",
  tel: "",
  cpf: "",
  birth_date: "",
  avatar: "",
  marketing: true,
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1️⃣ Fetch current user profile
  const fetchProfile = async () => {
    try {
      // Get CSRF cookie first
      await fetch("http://localhost:8000/sanctum/csrf-cookie", {
        method: "GET",
        credentials: "include",
      });

      // Fetch profile
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
      alert("Erro ao buscar perfil. Você precisa logar.");
    }
  };

  // 2️⃣ Save profile
  const saveProfile = async () => {
    try {
      const xsrfToken = decodeURIComponent(
        document.cookie
          .split("; ")
          .find(row => row.startsWith("XSRF-TOKEN="))
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

  // Handlers
  const handleProfileChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  if (!user) return <p>Carregando perfil...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Perfil</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`} onClick={() => setActiveTab("enderecos")}>Endereço</li>
          <li className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`} onClick={() => setActiveTab("pagamento")}>Pagamento</li>
        </ul>
      </aside>

      <main className="flex-1 p-2 text-black pt-40">
        {/* Perfil Tab */}
        {activeTab === "perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Informações do Usuário</h2>
              <button onClick={toggleEditProfile} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              <input type="text" name="name" value={user.name} onChange={handleProfileChange} placeholder="Nome" disabled={!isEditingProfile} className="border p-2 rounded"/>
              <input type="email" name="email" value={user.email} onChange={handleProfileChange} placeholder="Email" disabled={!isEditingProfile} className="border p-2 rounded"/>
              <input type="text" name="tel" value={user.tel} onChange={handleProfileChange} placeholder="Telefone" disabled={!isEditingProfile} className="border p-2 rounded"/>
              <input type="text" name="cpf" value={user.cpf} onChange={handleProfileChange} placeholder="CPF" disabled={!isEditingProfile} className="border p-2 rounded"/>
              <input type="text" name="birth_date" value={user.birth_date} onChange={handleProfileChange} placeholder="dd/mm/aaaa" disabled={!isEditingProfile} className="border p-2 rounded"/>
              {isEditingProfile && <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Salvar</button>}
            </div>
          </div>
        )}

        {/* Endereços Tab */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>
            {user.addresses.map(addr => (
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {["street","number","city","state","zip"].map(field => (
                      <input key={field} type="text" name={field} value={addr[field]} onChange={e => setUser({
                        ...user,
                        addresses: user.addresses.map(a => a.id === addr.id ? {...a, [field]: e.target.value} : a)
                      })} className="border p-2 rounded"/>
                    ))}
                    <button onClick={() => setEditAddressId(null)} className="bg-green-600 text-black py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p>{addr.street}, {addr.number}, {addr.city} - {addr.state}, {addr.zip}</p>
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
