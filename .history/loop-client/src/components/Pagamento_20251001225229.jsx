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
import sslImg from "../assets/ssl.png";

const Pagamento = () => {
  return (
    <section className="bg-white w-full px-6 md:px-24 font-sans">
      {/* Título */}
      <h2
        className="text-5xl font-bold text-center mb-6"
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
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <FiShield size={40} className="text-green-600" />
          <p className="text-xl font-semibold">Compra 100% segura</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FiDollarSign size={40} className="text-yellow-500" />
          <p className="text-xl font-semibold">Garantia de devolução</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FiCreditCard size={40} className="text-blue-500" />
          <p className="text-xl font-semibold">Transações criptografadas</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FiLock size={40} className="text-purple-500" />
          <p className="text-xl font-semibold">Privacidade garantida</p>
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="flex flex-col items-center justify-center gap-2 mb-8">
        {/* Primeira linha: Cartões */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-4 mb-2">
          <FaCcVisa size={56} className="text-gray-800" />
          <FaCcMastercard size={56} className="text-gray-800" />
          <FaCcAmex size={56} className="text-gray-800" />
        </div>

        {/* Mensagem 12x sem juros */}
        <p
          className="text-3xl md:text-4xl font-semibold mb-2"
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
        <div className="flex flex-row flex-wrap items-center justify-center gap-4">
          <FaPaypal size={56} className="text-gray-800" />
          <FaApplePay size={56} className="text-gray-800" />
          <FaGooglePay size={56} className="text-gray-800" />
        </div>
      </div>

      {/* Parcelamento e destaque */}
      <div className="text-center mb-4">
        <p className="text-gray-500 text-lg md:text-xl">
          Aceitamos todos os cartões de crédito, PayPal, Apple Pay, Google Pay, Pix e Boleto.
        </p>
      </div>

      {/* Observação com selo SSL */}
      <div className="flex items-center justify-center gap-2">
        <p className="text-center text-gray-500 text-base md:text-lg">
          Todos os pagamentos são processados de forma segura e criptografada.
        </p>
        <img src={sslImg} alt="SSL Secure" className="w-40 h-auto" />
      </div>
    </section>
  );
};

export default Pagamento;
