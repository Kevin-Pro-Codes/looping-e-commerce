import React from "react";
import { FiShield, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";

const Pagamento = () => {
  return (
    <section className="bg-white w-full py-12 px-6 md:px-16 font-sans">
      {/* Título */}
      <h2 className="text-4xl font-bold text-center mb-8">Pagamento Seguro</h2>

      {/* Selos de segurança */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
        <div className="flex items-center gap-3">
          <FiShield size={36} className="text-green-600" />
          <p className="text-xl font-semibold">Compra 100% segura</p>
        </div>
        <div className="flex items-center gap-3">
          <FiDollarSign size={36} className="text-yellow-500" />
          <p className="text-xl font-semibold">Garantia de devolução</p>
        </div>
        <div className="flex items-center gap-3">
          <FiCreditCard size={36} className="text-blue-500" />
          <p className="text-xl font-semibold">Transações criptografadas</p>
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
        <FaCcVisa size={48} className="text-gray-800" />
        <FaCcMastercard size={48} className="text-gray-800" />
        <FaCcAmex size={48} className="text-gray-800" />
        <FaPaypal size={48} className="text-gray-800" />
      </div>

      {/* Botão de finalizar compra */}
      <div className="flex justify-center">
        <button className="bg-red-500 text-white text-xl px-8 py-4 rounded-lg hover:bg-red-600 transition-colors">
          Comprar
        </button>
      </div>

      {/* Observação */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Todos os pagamentos são processados de forma segura e criptografada.
      </p>
    </section>
  );
};

export default Pagamento;
