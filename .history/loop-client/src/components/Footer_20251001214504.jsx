import React from "react";

import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sobre Nós */}
        <div>
          <h3 className="text-xl font-bold mb-4">Sobre Nós</h3>
          <p className="text-gray-300 text-sm">
            A Loop Shop é uma loja online dedicada a produtos exclusivos e colecionáveis. 
            Nosso objetivo é proporcionar a melhor experiência de compra para nossos clientes.
          </p>
        </div>

        {/* Links Rápidos */}
        <div>
          <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
          <ul className="text-gray-300 space-y-2">
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Início</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Categorias</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Ofertas</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">Blog</li>
            <li className="hover:text-yellow-400 cursor-pointer transition-colors">FAQ</li>
          </ul>
        </div>

        {/* Contato */}
        <div>
          <h3 className="text-xl font-bold mb-4">Contato</h3>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <FiMail /> contato@loopshop.com
            </li>
            <li className="flex items-center gap-2">
              <FiPhone /> +55 11 99999-9999
            </li>
            <li className="text-gray-400 text-sm mt-2">
              Atendimento: Seg - Sex, 9h - 18h
            </li>
          </ul>
        </div>

        {/* Redes Sociais */}
        <div>
          <h3 className="text-xl font-bold mb-4">Redes Sociais</h3>
          <div className="flex gap-4">
            <a href="#" className="hover:text-yellow-400 transition-colors"><FiFacebook size={24} /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors"><FiInstagram size={24} /></a>
            <a href="#" className="hover:text-yellow-400 transition-colors"><FiTwitter size={24} /></a>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Siga-nos para novidades, promoções e lançamentos exclusivos!
          </p>
        </div>

      </div>

      {/* Linha de copyright */}
      <div className="border-t border-gray-700 mt-6">
        <p className="text-gray-500 text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} Loop Shop. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
