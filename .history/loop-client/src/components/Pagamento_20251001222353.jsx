import React from "react";
import { FiShield, FiCreditCard, FiDollarSign, FiLock } from "react-icons/fi";
import { FaPaypal, FaCcVisa, FaCcMastercard, FaCcAmex, FaApplePay, FaGooglePay } from "react-icons/fa";
import { SiPix, SiBoleto } from "react-icons/si";

const Pagamento = () => {
  return (
    <section className="bg-white w-full py-16 px-6 md:px-24 font-sans">
      {/* Título */}
      <h2 className="text-4xl md:text-5xl font-bold text-center text-red-500 mb-12">
        Pagamento Seguro
      </h2>

      {/* Selos de segurança */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <FiShield size={40} className="text-green-600" />
          <p className="text-xl font-semibold">Compra 100% segura</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <FiDollarSign size={40} className="text-yellow-500" />
          <p className="text-xl font-semibold">Garantia de devolução</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <FiCreditCard size={40} className="text-blue-500" />
          <p className="text-xl font-semibold">Transações criptografadas</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <FiLock size={40} className="text-purple-500" />
          <p className="text-xl font-semibold">Privacidade garantida</p>
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
        <FaCcVisa size={56} className="text-gray-800" />
        <FaCcMastercard size={56} className="text-gray-800" />
        <FaCcAmex size={56} className="text-gray-800" />
        <FaPaypal size={56} className="text-gray-800" />
        <FaApplePay size={56} className="text-gray-800" />
        <FaGooglePay size={56} className="text-gray-800" />
      </div>

      {/* Parcelamento e destaque */}
      <div className="text-center mb-12">
        <p className="text-2xl md:text-3xl font-semibold mb-4">
          Parcelamento em até <span className="text-red-500">12x sem juros</span>
        </p>
        <p className="text-gray-500 text-lg md:text-xl">
          Aceitamos todos os cartões de crédito, PayPal, Apple Pay e Google Pay.
        </p>
      </div>

 {/* Pix */}
        <div className="flex flex-col items-center">
          <SiPix size={56} className="text-green-500 bg-green-100 p-3 rounded-lg shadow-lg" />
          <span className="mt-2 text-lg font-semibold text-green-700">Pix</span>
        </div>

        {/* Boleto */}
        <div className="flex flex-col items-center">
          <SiBoleto size={56} className="text-blue-700 bg-blue-100 p-3 rounded-lg shadow-lg" />
          <span className="mt-2 text-lg font-semibold text-blue-800">Boleto</span>
        </div>

      {/* Botão de finalizar compra */}
      <div className="flex justify-center mb-8">
        <button className="bg-red-500 text-white text-xl md:text-2xl px-10 py-5 rounded-lg hover:bg-red-600 transition-colors shadow-lg">
          Finalizar Compra
        </button>
      </div>

      {/* Observação */}
      <p className="text-center text-gray-500 text-base md:text-lg">
        Todos os pagamentos são processados de forma segura e criptografada.
      </p>
    </section>
  );
};

export default Pagamento;
