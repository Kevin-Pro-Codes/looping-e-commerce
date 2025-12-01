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
  className="text-5xl font-bold text-center mb-12"
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
  Compre com segurança!
</h2>

    
      </div>
    </section>
  );
};

export default Pagamento;
