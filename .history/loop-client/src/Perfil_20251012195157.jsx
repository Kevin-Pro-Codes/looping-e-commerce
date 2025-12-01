import React, { useState, useEffect } from "react";
import axios from "axios";

const mockUserProfile = {
  id: null, // dynamic ID will come from backend
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  data_nascimento: "",
  avatar: "",
  receber_marketing: true,
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    setUser(mockUserProfile);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      await axios.get("http://localhost:8000/sanctum/csrf-cookie", { withCredentials: true });
      const res = await axios.get("http://localhost:8000/api/user", { withCredentials: true });
      console.log("Fetched user:", res.data);

      setUser({
        id: res.data.id,
        nome: res.data.nome || "",
        email: res.data.email || "",
        telefone: res.data.telefone || "",
        cpf: res.data.cpf || "",
        data_nascimento: res.data.data_nascimento || "",
        avatar: res.data.avatar || "",
        receber_marketing: res.data.receber_marketing ?? true,
      });
    } catch (err) {
      console.error("Error fetching user:", err.response?.data || err.message);
    }
  };

  if (!user) return <p className="text-black">Carregando perfil...</p>;

  const handleUserChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });
  const toggleEditProfile = () => setIsEditingProfile(!isEditingProfile);

  const saveProfile = () => {
    if (!user?.id) {
      alert("Erro: usuário não está logado ou não possui ID!");
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

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
        <ul className="space-y-4">
          <li className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`} onClick={() => setActiveTab("perfil")}>Perfil</li>
          <li className={`cursor-pointer ${activeTab === "pedidos" ? "font-bold" : ""}`} onClick={() => setActiveTab("pedidos")}>Pedidos</li>
          <li className="cursor-pointer text-red-600" onClick={() => alert("Logout")}>Sair</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 text-black pt-40">
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
                <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
                  Salvar
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "pedidos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            Histórico de pedidos, status e faturas aqui
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
