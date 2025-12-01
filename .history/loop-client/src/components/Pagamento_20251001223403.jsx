import React from "react";
import { FiShield, FiCreditCard, FiDollarSign, FiLock } from "react-icons/fi";
import {
  FaPaypal,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";

const Pagamento = () => {
  return (
    <section className="bg-white w-full py-16 px-6 md:px-24 font-sans">
      {/* Título */}
      <h2
        className="text-4xl md:text-5xl font-bold text-center mb-12"
        style={{
          fontFamily: "Calibri, sans-serif",
          color: "red",
          WebkitTextStroke: "1px black",
          textStroke: "1px black",
        }}
      >
        Faça uma compra segura!
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
      <div className="flex flex-col items-center justify-center gap-4 mb-16">
        {/* All 6 icons in a single row */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-8 mb-4">
          <FaCcVisa size={56} className="text-gray-800" />
          <FaCcMastercard size={56} className="text-gray-800" />
          <FaCcAmex size={56} className="text-gray-800" />
          <FaPaypal size={56} className="text-gray-800" />
          <FaApplePay size={56} className="text-gray-800" />
          <FaGooglePay size={56} className="text-gray-800" />
        </div>

        {/* 12x sem juros message */}
        <p className="text-2xl md:text-3xl font-semibold text-red-500">
          Até 12x sem juros
        </p>
      </div>

      {/* Parcelamento e destaque */}
      <div className="text-center mb-12">
        <p className="text-gray-500 text-lg md:text-xl">
          Aceitamos todos os cartões de crédito, PayPal, Apple Pay e Google Pay.
        </p>
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
