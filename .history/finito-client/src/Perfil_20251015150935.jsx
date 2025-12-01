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
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({ street: "", number: "", city: "", state: "", zip: "" });
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: "", cardName: "", expiry: "" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      await fetch("http://localhost:8000/sanctum/csrf-cookie", { credentials: "include" });

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

  // Save profile
  const saveProfile = async () => {
    try {
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

  // Handlers
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

  const handleAddAddress = (e) => {
    e.preventDefault();
    setUser({ ...user, addresses: [...user.addresses, { id: Date.now(), ...newAddress }] });
    setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
  };

  const handleAddPayment = (e) => {
    e.preventDefault();
    setUser({ ...user, payment: [...user.payment, { id: Date.now(), ...paymentInfo }] });
    setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
  };

  if (!user) return <p>Carregando perfil...</p>;

  return (
    <div className="flex min-h-screen bg-gray-100 text-black" style={{ fontFamily: "Calibri, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-50 bg-white shadow-md p-6 mt-25 text-black">
        <h2 className="text-2xl pt-5 font-semibold mb-8 text-black">Menu</h2>
        <ul className="space-y-4">
          {["perfil","enderecos","pagamento","pedidos","favoritos","cupons","configuracoes","suporte"].map(tab => (
            <li key={tab} className={`cursor-pointer ${activeTab===tab?"font-bold":""}`} onClick={()=>setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase()+tab.slice(1)}
            </li>
          ))}
          <li className="cursor-pointer text-red-600" onClick={()=>alert("Logout")}>Sair</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-2 text-black pt-40">
        {/* Perfil */}
        {activeTab==="perfil" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-black">Informações do Usuário</h2>
              <button onClick={toggleEditProfile} className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                {isEditingProfile ? "Cancelar" : "Editar"}
              </button>
            </div>
            <div className="flex flex-col space-y-4">
              {["name","email","tel","cpf","birth_date"].map(field => (
                <input key={field} type={field==="email"?"email":"text"} name={field} value={user[field]} onChange={handleProfileChange} placeholder={field} disabled={!isEditingProfile} className="border p-2 rounded"/>
              ))}
              {isEditingProfile && <button onClick={saveProfile} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">Salvar</button>}
            </div>
          </div>
        )}

        {/* Endereços */}
        {activeTab==="enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>
            {user.addresses.map(addr => (
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                {editAddressId===addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {["street","number","city","state","zip"].map(f => (
                      <input key={f} type="text" name={f} value={addr[f]} onChange={e=>handleEditAddressChange(addr.id,e)} className="border p-2 rounded"/>
                    ))}
                    <button onClick={()=>setEditAddressId(null)} className="bg-green-600 text-black py-2 px-4 rounded col-span-full mt-2">Salvar</button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p>{addr.street}, {addr.number}, {addr.city} - {addr.state}, {addr.zip}</p>
                    <button onClick={()=>setEditAddressId(addr.id)} className="text-blue-600 hover:underline">Editar</button>
                  </div>
                )}
              </div>
            ))}
            <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddAddress}>
              {["street","number","city","state","zip"].map(f => (
                <input key={f} type="text" name={f} value={newAddress[f]} onChange={handleAddressChange} placeholder={f} className="border p-2 rounded" required/>
              ))}
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Pagamento */}
        {activeTab==="pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto text-black">
            <h2 className="text-xl font-semibold mb-4">Informações de Pagamento</h2>
            {user.payment.map(p => (
              <div key={p.id} className="mb-4 border-b pb-3">
                {["cardNumber","cardName","expiry"].map(f=>(
                  <input key={f} type="text" name={f} value={p[f]} onChange={e=>setUser({...user, payment: user.payment.map(pay=>pay.id===p.id?{...pay,[f]:e.target.value}:pay)})} className="border p-2 rounded mb-2 w-full"/>
                ))}
              </div>
            ))}
            <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleAddPayment}>
              {["cardNumber","cardName","expiry"].map(f=>(
                <input key={f} type="text" name={f} value={paymentInfo[f]} onChange={handlePaymentChange} placeholder={f} className="border p-2 rounded" required/>
              ))}
              <button type="submit" className="bg-blue-600 text-black py-2 px-4 rounded col-span-full">Adicionar</button>
            </form>
          </div>
        )}

        {/* Other Tabs */}
        {["pedidos","favoritos","cupons","configuracoes","suporte"].map(tab => activeTab===tab && (
          <div key={tab} className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto text-black">{tab}</div>
        ))}
      </main>
    </div>
  );
};

export default ProfilePage;
