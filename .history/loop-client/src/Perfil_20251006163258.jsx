import React, { useState, useEffect } from "react";

// Mock data
const mockUserProfile = {
  name: "João Silva",
  email: "joao.silva@email.com",
  phone: "+55 11 91234-5678",
  cpf: "123.456.789-00",
  birthDate: "1990-05-15",
  avatar: "https://i.pravatar.cc/150?img=3",
  marketingOptIn: true,
  addresses: [
    {
      id: 1,
      street: "Rua das Flores",
      number: "123",
      city: "São Paulo",
      state: "SP",
      zip: "01234-567",
    },
    {
      id: 2,
      street: "Avenida Brasil",
      number: "456",
      city: "Rio de Janeiro",
      state: "RJ",
      zip: "23456-789",
    },
  ],
  payment: [
    {
      id: 1,
      cardNumber: "**** **** **** 1234",
      cardName: "João Silva",
      expiry: "12/25",
    },
  ],
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("perfil");
  const [editAddressId, setEditAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    city: "",
    state: "",
    zip: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
  });

  useEffect(() => {
    setUser(mockUserProfile);
  }, []);

  if (!user) return <p>Carregando perfil...</p>;

  // Profile input changes
  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Address input changes
  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleEditAddressChange = (id, e) => {
    setUser({
      ...user,
      addresses: user.addresses.map((addr) =>
        addr.id === id ? { ...addr, [e.target.name]: e.target.value } : addr
      ),
    });
  };

  // Payment input changes
  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-8">Meu Perfil</h2>
        <ul className="space-y-4">
          <li
            className={`cursor-pointer ${activeTab === "perfil" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            Perfil
          </li>
          <li
            className={`cursor-pointer ${activeTab === "enderecos" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("enderecos")}
          >
            Endereços
          </li>
          <li
            className={`cursor-pointer ${activeTab === "pagamento" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("pagamento")}
          >
            Pagamento
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-39">
        {/* Perfil Tab */}
        {activeTab === "perfil" && (
          <div className="bg-white text-black p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleUserChange}
                placeholder="Nome"
                className="border p-2 rounded"
              />
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleUserChange}
                placeholder="Email"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleUserChange}
                placeholder="Telefone"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="cpf"
                value={user.cpf}
                onChange={handleUserChange}
                placeholder="CPF"
                className="border p-2 rounded"
              />
              <input
                type="date"
                name="birthDate"
                value={user.birthDate}
                onChange={handleUserChange}
                className="border p-2 rounded"
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={user.marketingOptIn}
                  onChange={(e) => setUser({...user, marketingOptIn: e.target.checked})}
                  id="marketing"
                />
                <label htmlFor="marketing">Promoções</label>
              </div>
            </div>
          </div>
        )}

        {/* Endereços Tab */}
        {activeTab === "enderecos" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Endereços</h2>

            {user.addresses.map((addr) => (
              <div key={addr.id} className="border-b last:border-b-0 py-3">
                {editAddressId === addr.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      name="street"
                      value={addr.street}
                      onChange={(e) => handleEditAddressChange(addr.id, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      name="number"
                      value={addr.number}
                      onChange={(e) => handleEditAddressChange(addr.id, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      name="city"
                      value={addr.city}
                      onChange={(e) => handleEditAddressChange(addr.id, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      name="state"
                      value={addr.state}
                      onChange={(e) => handleEditAddressChange(addr.id, e)}
                      className="border p-2 rounded"
                    />
                    <input
                      type="text"
                      name="zip"
                      value={addr.zip}
                      onChange={(e) => handleEditAddressChange(addr.id, e)}
                      className="border p-2 rounded"
                    />
                    <button
                      onClick={() => setEditAddressId(null)}
                      className="bg-green-600 text-white py-2 px-4 rounded col-span-full mt-2"
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {addr.street}, {addr.number}
                      </p>
                      <p className="text-gray-600">
                        {addr.city} - {addr.state}, {addr.zip}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditAddressId(addr.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Form adicionar endereço */}
            <form
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setUser({
                  ...user,
                  addresses: [
                    ...user.addresses,
                    { id: Date.now(), ...newAddress },
                  ],
                });
                setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
              }}
            >
              <input
                type="text"
                name="street"
                value={newAddress.street}
                onChange={handleAddressChange}
                placeholder="Rua"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="number"
                value={newAddress.number}
                onChange={handleAddressChange}
                placeholder="Número"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleAddressChange}
                placeholder="Cidade"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleAddressChange}
                placeholder="Estado"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="zip"
                value={newAddress.zip}
                onChange={handleAddressChange}
                placeholder="CEP"
                className="border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded col-span-full"
              >
                Adicionar Endereço
              </button>
            </form>
          </div>
        )}

        {/* Pagamento Tab */}
        {activeTab === "pagamento" && (
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Informações de Pagamento</h2>
            {user.payment.map((p) => (
              <div key={p.id} className="mb-4 border-b pb-3">
                <input
                  type="text"
                  name="cardNumber"
                  value={p.cardNumber}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      payment: user.payment.map((pay) =>
                        pay.id === p.id ? { ...pay, cardNumber: e.target.value } : pay
                      ),
                    })
                  }
                  className="border p-2 rounded mb-2 w-full"
                />
                <input
                  type="text"
                  name="cardName"
                  value={p.cardName}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      payment: user.payment.map((pay) =>
                        pay.id === p.id ? { ...pay, cardName: e.target.value } : pay
                      ),
                    })
                  }
                  className="border p-2 rounded mb-2 w-full"
                />
                <input
                  type="text"
                  name="expiry"
                  value={p.expiry}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      payment: user.payment.map((pay) =>
                        pay.id === p.id ? { ...pay, expiry: e.target.value } : pay
                      ),
                    })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}

            {/* Novo cartão */}
            <form
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setUser({
                  ...user,
                  payment: [
                    ...user.payment,
                    { id: Date.now(), ...paymentInfo },
                  ],
                });
                setPaymentInfo({ cardNumber: "", cardName: "", expiry: "" });
              }}
            >
              <input
                type="text"
                name="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentChange}
                placeholder="Número do cartão"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="cardName"
                value={paymentInfo.cardName}
                onChange={handlePaymentChange}
                placeholder="Nome no cartão"
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                name="expiry"
                value={paymentInfo.expiry}
                onChange={handlePaymentChange}
                placeholder="Validade (MM/AA)"
                className="border p-2 rounded"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-black py-2 px-4 rounded col-span-full"
              >
                Adicionar Cartão
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
