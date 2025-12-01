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
import pixImg from "../assets/pix.png";
import boletoImg from "../assets/boleto.png";

const Pagamento = () => {
  return (
    <section className="w-full font-sans">
      {/* Black bar on top */}
      <div className="w-full h-0.5 bg-black mb-15" />

      {/* Main white section */}
      <div className="bg-white w-full px-6 md:px-24">
        {/* Título */}
   <h2
  className="text-6xl font-bold text-center mb-12"
  style={{
    fontFamily: "Calibri, sans-serif",
    color: "red",
    letterSpacing: "3px", // <-- Add this line for spacing between letters
    textShadow: `
      -1px -1px 0 #000,  
       1px -1px 0 #000,
      -1px  1px 0 #000,
       1px  1px 0 #000
    `
  }}
>
  Faça uma compra segura!
</h2>



       {/* Selos de segurança */}
<div className="flex flex-col md:flex-row items-center justify-center gap-0 mb-0 text-center">
  <div className="flex flex-col items-center gap-0">
    <FiShield size={40} className="text-green-600" />
    <p className="text-xl font-semibold m-0">Compra 100% segura</p>
  </div>
  <div className="flex flex-col items-center gap-0">
    <FiDollarSign size={40} className="text-yellow-500" />
    <p className="text-xl font-semibold m-0">Garantia de devolução</p>
  </div>
  <div className="flex flex-col items-center gap-0">
    <FiCreditCard size={40} className="text-blue-500" />
    <p className="text-xl font-semibold m-0">Transações criptografadas</p>
  </div>
  <div className="flex flex-col items-center gap-0">
    <FiLock size={40} className="text-purple-500" />
    <p className="text-xl font-semibold m-0">Privacidade garantida</p>
  </div>
</div>


        {/* Formas de pagamento */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-8 mb-4">
          <FaCcVisa size={56} className="text-black" />
          <FaCcMastercard size={56} className="text-black" />
          <FaCcAmex size={56} className="text-black" />
          <FaPaypal size={56} className="text-black" />
          <FaApplePay size={56} className="text-black" />
          <FaGooglePay size={56} className="text-black" />
           {/* Pix */}
  <div className="flex flex-col items-center">
    <img src={pixImg} alt="Pix" className="w-14 h-14" />
    <span className="mt-1 text-sm font-semibold text-green-700"></span>
  </div>

  {/* Boleto */}
  <div className="flex flex-col items-center">
    <img src={boletoImg} alt="Boleto" className="w-14 h-14" />
    <span className="mt-1 text-sm font-semibold text-blue-700"></span>
  </div>
</div>

        {/* 12x sem juros message */}
        <div className="text-center mb-8">
          <p
            className="text-4xl md:text-4xl font-semibold"
            style={{
              fontFamily: "Calibri, sans-serif",
              color: "#1eff00ff",
              WebkitTextStroke: "1px black",
              textStroke: "1px black",
            }}
          >
            Até 12x sem juros
          </p>
        </div>

        {/* Parcelamento e destaque */}
        <div className="text-center mb-8">
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
      </div>
    </section>
  );
};

export default Pagamento;
