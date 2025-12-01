import React, { useEffect, useState } from "react";

// Dados simulados
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
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: "",
    number: "",
    city: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    setUser(mockUserProfile);
  }, []);

  if (!user) return <p>Carregando perfil...</p>;

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    setUser({
      ...user,
      addresses: [
        ...user.addresses,
        { id: Date.now(), ...newAddress },
      ],
    });
    setNewAddress({ street: "", number: "", city: "", state: "", zip: "" });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-12">
      {/* Informações do Usuário */}
      <div className="flex items-center space-x-6 bg-white p-6 rounded-lg shadow-md mb-8">
        <img
          src={user.avatar}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{user.phone}</p>
          <p className="text-gray-600">CPF: {user.cpf}</p>
          <p className="text-gray-600">Nascimento: {user.birthDate}</p>
          <p className="text-gray-600">
            Receber promoções: {user.marketingOptIn ? "Sim" : "Não"}
          </p>
        </div>
      </div>

      {/* Endereços */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Endereços</h2>
        {user.addresses.map((addr) => (
          <div
            key={addr.id}
            className="border-b last:border-b-0 py-3 flex justify-between"
          >
            <div>
              <p className="font-medium">
                {addr.street}, {addr.number}
              </p>
              <p className="text-gray-600">
                {addr.city} - {addr.state}, {addr.zip}
              </p>
            </div>
          </div>
        ))}

        {/* Formulário para adicionar endereço */}
        <form
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          onSubmit={handleAddAddress}
        >
          <input
            type="text"
            name="street"
            placeholder="Rua"
            value={newAddress.street}
            onChange={handleAddressChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="number"
            placeholder="Número"
            value={newAddress.number}
            onChange={handleAddressChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="city"
            placeholder="Cidade"
            value={newAddress.city}
            onChange={handleAddressChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="state"
            placeholder="Estado"
            value={newAddress.state}
            onChange={handleAddressChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="zip"
            placeholder="CEP"
            value={newAddress.zip}
            onChange={handleAddressChange}
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 col-span-full"
          >
            Adicionar Endereço
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
