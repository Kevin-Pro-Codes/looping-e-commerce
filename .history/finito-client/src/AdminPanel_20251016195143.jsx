// src/pages/AdminPanel.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminPanel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Dispatch logout event
    window.dispatchEvent(new Event("loginStateChange"));
    
    navigate("/logar");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-15 mt-30">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mb-6">
          <p className="text-lg">Welcome, Admin 👋</p>
          <p className="text-gray-600">You have successfully logged in as an administrator.</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Product Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>Add new products</li>
                <li>Edit existing products</li>
                <li>Delete products</li>
                <li>Manage inventory</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">User Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>View all users</li>
                <li>Manage user accounts</li>
                <li>View user analytics</li>
                <li>Handle user support</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Order Management</h3>
              <ul className="list-disc ml-6 text-sm text-gray-600">
                <li>View all orders</li>
                <li>Track deliveries</li>
                <li>Manage payments</li>
                <li>Customer information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] tracking-widest">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-001</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">João Silva</div>
                      <div className="text-sm text-gray-500">joao@email.com</div>
                      <div className="text-sm text-gray-500">+55 11 99999-9999</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Camiseta Finito</div>
                      <div className="text-sm text-gray-500">Qty: 2</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 89,90</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Cartão de Crédito
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">São Paulo, SP</div>
                      <div className="text-sm text-gray-500">Rua das Flores, 123</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Em Preparação
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-002</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Maria Santos</div>
                      <div className="text-sm text-gray-500">maria@email.com</div>
                      <div className="text-sm text-gray-500">+55 21 88888-8888</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Boné Finito</div>
                      <div className="text-sm text-gray-500">Qty: 1</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 45,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        PIX
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Rio de Janeiro, RJ</div>
                      <div className="text-sm text-gray-500">Av. Copacabana, 456</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Enviado
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD-003</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Pedro Costa</div>
                      <div className="text-sm text-gray-500">pedro@email.com</div>
                      <div className="text-sm text-gray-500">+55 31 77777-7777</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Caneca Finito</div>
                      <div className="text-sm text-gray-500">Qty: 3</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ 75,00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Boleto
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Belo Horizonte, MG</div>
                      <div className="text-sm text-gray-500">Rua da Liberdade, 789</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Pendente
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900">Update</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">João Silva</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> joao@email.com</p>
                <p><strong>Phone:</strong> +55 11 99999-9999</p>
                <p><strong>CPF:</strong> 123.456.789-00</p>
                <p><strong>Address:</strong> Rua das Flores, 123 - São Paulo, SP</p>
                <p><strong>Orders:</strong> 5</p>
                <p><strong>Total Spent:</strong> R$ 450,00</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Maria Santos</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> maria@email.com</p>
                <p><strong>Phone:</strong> +55 21 88888-8888</p>
                <p><strong>CPF:</strong> 987.654.321-00</p>
                <p><strong>Address:</strong> Av. Copacabana, 456 - Rio de Janeiro, RJ</p>
                <p><strong>Orders:</strong> 3</p>
                <p><strong>Total Spent:</strong> R$ 180,00</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Pedro Costa</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email:</strong> pedro@email.com</p>
                <p><strong>Phone:</strong> +55 31 77777-7777</p>
                <p><strong>CPF:</strong> 456.789.123-00</p>
                <p><strong>Address:</strong> Rua da Liberdade, 789 - Belo Horizonte, MG</p>
                <p><strong>Orders:</strong> 2</p>
                <p><strong>Total Spent:</strong> R$ 120,00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Tracking Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Delivery Tracking</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Order #ORD-002 - Maria Santos</h4>
                  <p className="text-sm text-gray-600">Boné Finito - R$ 45,00</p>
                  <p className="text-sm text-gray-500">Rio de Janeiro, RJ</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Enviado
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Tracking: BR123456789</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">Order #ORD-001 - João Silva</h4>
                  <p className="text-sm text-gray-600">Camiseta Finito - R$ 89,90</p>
                  <p className="text-sm text-gray-500">São Paulo, SP</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Em Preparação
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Preparando envio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
