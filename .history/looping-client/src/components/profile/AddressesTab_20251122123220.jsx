import React from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { Input } from './SharedComponents';

// ✅ ADD: Skeleton Loading Component
const AddressesTabSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      
      {/* Address List Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="border-b last:border-b-0 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <div className="w-16 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Address Form Skeleton */}
      <div className="mt-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-56 mb-4"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((field) => (
            <div key={field} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        <div className="w-full h-12 bg-gray-200 rounded-lg flex items-center justify-center gap-2">
          <div className="w-5 h-5 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
};

const AddressesTab = ({
  user,
  editAddressId,
  setEditAddressId,
  newAddress,
  handleEditAddressChange,
  handleAddressChange,
  saveAddress,
  editAddress,
  deleteAddress,
  loadingAddresses // ✅ ADD: Optional loading prop
}) => {
  // ✅ ADD: Show skeleton while loading
  if (loadingAddresses || !user?.addresses) {
    return <AddressesTabSkeleton />;
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-6 text-gray-900">Endereços</h2>
      
      {/* Address List */}
      {user.addresses?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nenhum endereço cadastrado</p>
        </div>
      ) : (
        user.addresses?.map((addr) => (
          <div key={addr.id} className="border-b last:border-b-0 py-4 text-gray-900">
            {editAddressId === addr.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    name="street"
                    value={addr.street || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="Rua/Avenida"
                  />
                  <Input
                    name="number"
                    value={addr.number || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="Número"
                  />
                  <Input
                    name="hood"
                    value={addr.hood || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="Bairro"
                  />
                  <Input
                    name="complement"
                    value={addr.complement || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="Complement"
                  />
                  <Input
                    name="city"
                    value={addr.city || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="Cidade"
                  />
                  <Input
                    name="state"
                    value={addr.state || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="Estado"
                  />
                  <Input
                    name="zip"
                    value={addr.zip || ''}
                    onChange={(e) => handleEditAddressChange(addr.id, e)}
                    placeholder="CEP"
                    className="md:col-span-2"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => editAddress(addr.id)}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex-1"
                  >
                    Salvar
                  </button>
                  <button 
                    onClick={() => setEditAddressId(null)}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {addr.street}, {addr.number}, {addr.hood}, {addr.complement}
                  </p>
                  <p className="text-gray-600">
                    {addr.city} - {addr.state}, {addr.zip}
                  </p>
                </div>
                <div className="flex gap-2 self-start sm:self-auto">
                  <button 
                    onClick={() => setEditAddressId(addr.id)}
                    className="text-green-600 hover:text-green-800 hover:underline px-2 py-1"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteAddress(addr.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    title="Excluir endereço"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
      
      {/* Add New Address Form */}
      <form className="mt-6 space-y-4" onSubmit={saveAddress}>
        <h3 className="text-lg font-semibold text-gray-900">Adicionar Novo Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="street"
            value={newAddress.street}
            onChange={handleAddressChange}
            placeholder="Rua/Avenida"
            required
          />
          <Input
            name="number"
            value={newAddress.number}
            onChange={handleAddressChange}
            placeholder="Número"
            required
          />
          <Input
            name="hood"
            value={newAddress.hood}
            onChange={handleAddressChange}
            placeholder="Bairro"
            required
          />
          <Input
            name="complement"
            value={newAddress.complement}
            onChange={handleAddressChange}
            placeholder="Complemento"
            required
          />
          <Input
            name="city"
            value={newAddress.city}
            onChange={handleAddressChange}
            placeholder="Cidade"
            required
          />                
          <Input
            name="state"
            value={newAddress.state}
            onChange={handleAddressChange}
            placeholder="Estado"
            required
          />
          <Input
            name="zip"
            value={newAddress.zip}
            onChange={handleAddressChange}
            placeholder="CEP"
            required
          />
        </div>
        <button 
          type="submit" 
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full"
        >
          <FiPlus size={20} />
          Adicionar Endereço
        </button>
      </form>
    </>
  );
};

export default AddressesTab;