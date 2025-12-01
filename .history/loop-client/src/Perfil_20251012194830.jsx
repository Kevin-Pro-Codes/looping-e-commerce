import React, { useState, useEffect } from "react";
import axios from "axios";

// Mock user for initial render
const mockUserProfile = {
  id: null, // Will be replaced by logged-in user id
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  data_nascimento: "",
  avatar: "",
  receber_marketing: true,
};

const ProfilePage = () => {
  const [user, setUser] = useState(mockUserProfile);
  const [activeTab, setActiveTab] = useState("perfil");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch logged-in user
  const fetchUser = async () => {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
      const res = await axios.get("http://localhost:8000/api/user", { withCredentials: true });
      console.log("Fetched user:", res.data);

      // Ensure backend returns `id` field
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err.response?.data || err.message);
      alert("Erro ao carregar usuário");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  // Input change handlers
  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  // Save profile to backend
  const saveProfile = async () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado ou não possui ID!");
      return;
    }

    try {
      const res = await axios.put(`http://localhost:8000/api/user/${user.id}`, user, {
        withCredentials: true,
      });
      setUser(res.data);
      setIsEditingProfile(false);
      alert("Perfil salvo com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil!");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
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
              <input
                type="text"
                name="nome"
                value={user.nome}
                onChange={handleUserChange}
                placeholder="Nome"
                className="border p-2 rounded text-black"
                disabled={!isEditingProfile}
              />
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleUserChange}
                placeholder="Email"
                className="border p-2 rounded text-black"
                disabled={!isEditingProfile}
              />
              <input
                type="text"
                name="telefone"
                value={user.telefone}
                onChange={handleUserChange}
                placeholder="Telefone"
                className="border p-2 rounded text-black"
                disabled={!isEditingProfile}
              />
              <input
                type="text"
                name="cpf"
                value={user.cpf}
                onChange={handleUserChange}
                placeholder="CPF"
                className="border p-2 rounded text-black"
                disabled={!isEditingProfile}
              />
              <input
                type="text"
                name="data_nascimento"
                value={user.data_nascimento}
                onChange={handleUserChange}
                placeholder="dd/mm/aaaa"
                className="border p-2 rounded text-black"
                disabled={!isEditingProfile}
              />

              {isEditingProfile && (
                <button
                  onClick={saveProfile}
                  disabled={!user?.id}
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Salvar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Other tabs can remain unchanged */}
      </main>
    </div>
  );
};

export default ProfilePage;
