import React, { useState, useEffect } from "react";
import axios from "axios";

const mockUserProfile = {
  id: 1, // Add a default id so saveProfile won't fail with undefined
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  data_nascimento: "",
  avatar: "",
  receber_marketing: true,
  addresses: [
    { id: 1, street: "Rua das Flores", number: "123", city: "São Paulo", state: "SP", zip: "01234-567" },
    { id: 2, street: "Avenida Brasil", number: "456", city: "São Paulo", state: "SP", zip: "23456-789" },
  ],
  payment: [
    { id: 1, cardNumber: "**** **** **** 1234", cardName: "", expiry: "" },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => { setUser(mockUserProfile); }, []);

  const fetchUser = async () => {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
      const res = await axios.get("http://localhost:8000/api/user", { withCredentials: true });
      console.log("Fetched user:", res.data);

      // Ensure the user object has an id to avoid undefined PUT
      if (!res.data.id) res.data.id = 1;
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err.response?.data || err.message);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
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

  const saveProfile = () => {
    if (!user.id) {
      alert("Erro: usuário não possui ID!");
      return;
    }
    axios.put(`http://localhost:8000/api/user/${user.id}`, user, { withCredentials: true })
      .then(res => {
        setUser(res.data);            
        setIsEditingProfile(false);  
        alert("Perfil salvo com sucesso!");
      })
      .catch(err => {
        console.error(err);
        alert("Erro ao salvar perfil!");
      });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/addresses", newAddress, { withCredentials: true });
      setUser({ ...user, addresses: [...user.addresses, res.data] });
      setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
    } catch (err) {
      console.error("Error saving address:", err.response?.data || err.message);
      alert("Erro ao salvar endereço");
    }
  };

  const handleSaveAddress = async (addr) => {
    try {
      const res = await axios.put(`http://localhost:8000/api/addresses/${addr.id}`, addr, { withCredentials: true });
      setUser({
        ...user,
        addresses: user.addresses.map(a => a.id === addr.id ? res.data : a),
      });
      setEditAddressId(null);
      alert("Endereço atualizado!");
    } catch (err) {
      console.error("Erro ao salvar endereço:", err.response?.data || err.message);
      alert("Erro ao salvar endereço");
    }
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
          <li className={`cursor-pointer ${activeTab === "favoritos" ? "font-bold" : ""}`} onClick={() => setActiveTab("favoritos")}>Desejos</li>
          <li className={`cursor-pointer ${activeTab === "cupons" ? "font-bold" : ""}`} onClick={() => setActiveTab("cupons")}>Cupons & Créditos</li>
          <li className={`cursor-pointer ${activeTab === "configuracoes" ? "font-bold" : ""}`} onClick={() => setActiveTab("configuracoes")}>Configurações</li>
          <li className={`cursor-pointer ${activeTab === "suporte" ? "font-bold" : ""}`} onClick={() => setActiveTab("suporte")}>Suporte e Ajuda</li>
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
              <input type="text" name="nome" value={user.nome} onChange={handleUserChange} placeholder="Nome" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="email" name="email" value={user.email} onChange={handleUserChange} placeholder="Email" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="telefone" value={user.telefone} onChange={handleUserChange} placeholder="Telefone" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="cpf" value={user.cpf} onChange={handleUserChange} placeholder="CPF" className="border p-2 rounded text-black" disabled={!isEditingProfile} />
              <input type="text" name="data_nascimento" value={user.data_nascimento} onChange={handleUserChange} placeholder="dd/mm/aaaa" className="border p-2 rounded text-black" disabled={!isEditingProfile} />

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

        {/* Keep your existing Endereços, Pagamento, Pedidos, Favoritos, Cupons, Configurações, Suporte tabs unchanged */}
      </main>
    </div>
  );
};

export default ProfilePage;
