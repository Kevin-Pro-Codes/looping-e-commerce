import React from "react";
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-black text-white w-full mt-12" style={{ fontFamily: "Calibri, sans-serif" }}>
      <div className="w-full px-6 md:px-16 py-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Sobre Nós */}
        <div>
          <h3 className="text-3xl font-bold mb-4">Sobre</h3>
          <p className="text-white text-2xl leading-relaxed">
            A Looping Store é uma loja online dedicada a produtos exclusivos e colecionáveis. 
            Nosso objetivo é proporcionar a melhor experiência de compra para nossos clientes.
          </p>
        </div>

        {/* Links Rápidos */}
        <div>
          <h3 className="text-3xl font-bold mb-4">Links</h3>
          <ul className="space-y-3 text-2xl">
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Início</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Categorias</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Ofertas</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Blog</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">FAQ</li>
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-3xl font-bold mb-4">Contato</h3>
          <ul className="space-y-3 text-2xl">
            <li className="flex items-center gap-2 text-white">
              <FiMail /> contato@loopingstore.com
            </li>
            <li className="flex items-center gap-2 text-white">
              <FiPhone /> +55 11 99999-9999
            </li>
            <li className="text-gray-400 text-2xl mt-2">
              Atendimento: Seg - Sex, 9h - 18h
            </li>
          </ul>
        </div>

        {/* Redes Sociais */}
        <div>
          <h3 className="text-3xl font-bold mb-4">Redes Sociais</h3>
          <div className="flex gap-4 mb-4">
            <a href="#" className="hover:text-yellow-400 transition-colors text-white"><FiFacebook size={24} /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors text-white"><FiInstagram size={24} /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors text-white"><FiTwitter size={24} /></a>
          </div>
          <p className="text-gray-400 text-2xl">
            Siga-nos para novidades, promoções e lançamentos exclusivos!
          </p>
        </div>

      </div>

      {/* Linha de copyright */}
      <div className="border-t border-gray-700 mt-6">
        <p className="text-white text-center py-4 text-xl">
          &copy; {new Date().getFullYear()} Looping Shop. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
