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
        className="text-5xl font-bold text-center mb-12"
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
        {/* Primeira linha: Cartões */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-8 mb-4">
          <FaCcVisa size={56} className="text-gray-800" />
          <FaCcMastercard size={56} className="text-gray-800" />
          <FaCcAmex size={56} className="text-gray-800" />
        </div>

        {/* Mensagem 12x sem juros */}
        <p
          className="text-3xl md:text-4xl font-semibold mb-4"
          style={{
            fontFamily: "Calibri, sans-serif",
            color: "blue",
            WebkitTextStroke: "1px black",
            textStroke: "1px black",
          }}
        >
          Até 12x sem juros
        </p>

        {/* Segunda linha: Outras formas de pagamento */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-8 mt-4">
          <FaPaypal size={56} className="text-gray-800" />
          <FaApplePay size={56} className="text-gray-800" />
          <FaGooglePay size={56} className="text-gray-800" />
          {/* Pix */}
          <div className="flex flex-col items-center">
            <img
              src="/pix-logo.svg"
              alt="Pix"
              className="w-14 h-14"
            />
            <span className="mt-2 text-lg font-semibold text-green-700">Pix</span>
          </div>
          {/* Boleto */}
          <div className="flex flex-col items-center">
            <img
              src="/boleto-logo.svg"
              alt="Boleto"
              className="w-14 h-14"
            />
            <span className="mt-2 text-lg font-semibold text-blue-700">Boleto</span>
          </div>
        </div>
      </div>

      {/* Parcelamento e destaque */}
      <div className="text-center mb-12">
        <p className="text-gray-500 text-lg md:text-xl">
          Aceitamos todos os cartões de crédito, PayPal, Apple Pay, Google Pay, Pix e Boleto.
        </p>
      </div>

      {/* Observação com selo SSL */}
      <div className="flex items-center justify-center md:justify-between mt-8 gap-4">
        <p className="text-center text-gray-500 text-base md:text-lg flex-1">
          Todos os pagamentos são processados de forma segura e criptografada.
        </p>
        <img
          src="/ssl.jpg" // Coloque o selo SSL na pasta public
          alt="SSL Secure"
          className="w-20 h-auto"
        />
      </div>
    </section>
  );
};

export default Pagamento;
