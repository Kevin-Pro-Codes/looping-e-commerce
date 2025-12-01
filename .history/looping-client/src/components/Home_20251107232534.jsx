//BANNERS

import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Payment from "./Payment";
import showImage from "../assets/bg.png";
import kt from "../assets/kurt.png";
import rnr from "../assets/rnr.png";
import rockBanner from "../assets/10.png";
import ch from "../assets/chad.png";
import jd from "../assets/jd.png";
import fclub from "../assets/fclub.png";
import bt from "../assets/bart.png";
import hotSymbol from "../assets/hot.png";
import ks from "../assets/krusty.png";
import coldSymbol from "../assets/cold.png";
import py from "../assets/python.gif";
import finitoBanner from "../assets/finito-banner.png";
import finitoAd from "../assets/finito-ad.png";
import logo from "../assets/logo.png";
import mnq from "../assets/mnq.png";
import BannerTimer from "./BannerTimer";
import Products from "./Products";

// REORDERED bannerCombos array - Python RIGHT AFTER FClub
const bannerCombos = [
  { bg: finitoBanner, overlay: null },
  { bg: showImage, overlay: [kt, rockBanner, ch, jd], animated: true },
  { bg: "promo", overlay: null, promo: true },
  { bg: bt, overlay: hotSymbol, symbolType: "hot" },
  { bg: ks, overlay: coldSymbol, symbolType: "cold" },
  { bg: fclub, overlay: null },
  { bg: py, overlay: null },
  { bg: "cupons", overlay: null, cupons: true },
  { bg: "black", overlay: null, logo: true },
  { bg: "designs", overlay: null, designs: true }
];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const pagedItems = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );

  useEffect(() => {
    const bannerDuration = 18.15;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerCombos.length);
    }, bannerDuration * 1000);

    return () => clearInterval(interval);
  }, [bannerCombos.length]);

  const handleWhatsAppClick = () => {
    const phoneNumber = "5511999999999";
    const message = "Olá! Gostaria de mais informações sobre os produtos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInstagramClick = () => {
    const instagramUrl = "https://instagram.com/finito.official";
    window.open(instagramUrl, '_blank');
  };

  const handleFacebookClick = () => {
    const facebookUrl = "https://facebook.com/finito.official";
    window.open(facebookUrl, '_blank');
  };

  const generateFloatingSymbols = (symbolType) => {
    const symbolSrc = symbolType === "hot" ? hotSymbol : coldSymbol;
    const symbols = [];
    const placed = [];
    const cols = 8;
    const rows = 5;
    const cellWidth = 1000 / cols;
    const cellHeight = 500 / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() < 0.4) continue;
        const size = 20 + Math.random() * 20;
        const leftPx =
          col * cellWidth +
          cellWidth * 0.2 +
          Math.random() * (cellWidth * 0.6);
        const topPx =
          row * cellHeight +
          cellHeight * 0.2 +
          Math.random() * (cellHeight * 0.6);
        placed.push({ top: topPx, left: leftPx, size });
        symbols.push(
          <img
            key={`${row}-${col}`}
            src={symbolSrc}
            alt={symbolType === "hot" ? "Hot" : "Cold"}
            className="absolute opacity-65"
            style={{
              top: `${(topPx / 500) * 100}%`,
              left: `${(leftPx / 1000) * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(-50%, -50%) rotate(${
                Math.random() * 360
              }deg)`,
              zIndex: 1
            }}
          />
        );
      }
    }
    return symbols;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">

        {/* Centered Banner Container - PROPERLY SCALED */}
        <div className="flex justify-center items-center p-4 mt-4 sm:mt-6 md:mt-8">
          <div className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white 
                         w-full max-w-[1400px] h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px]">
            
            {/* Banner Content */}
            {currentBanner === 2 ? (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center">
                <div className="text-center w-full">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    LEVE 4
                  </h1>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-yellow-300 mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    PAGUE 3
                  </h2>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    PROMOÇÃO ESPECIAL
                  </p>
                </div>
              </div>
            ) : currentBanner === 7 ? (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-600 via-green-500 to-green-700 flex items-center justify-center">
                <div className="text-center w-full">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    CUPONS DE
                  </h1>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-yellow-300 mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    DESCONTO
                  </h2>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    ATÉ 50% OFF
                  </p>
                  <p className="text-xl sm:text-2xl text-white opacity-90" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    Use o código: <span className="font-bold text-yellow-300 text-2xl sm:text-3xl">FINITO50</span>
                  </p>
                </div>
              </div>
            ) : currentBanner === 8 ? (
              <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                <img
                  src={logo}
                  alt="Finito Logo"
                  className="object-contain w-[80%] h-[80%] max-w-[600px] max-h-[500px]"
                />
              </div>
            ) : currentBanner === 9 ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100">
                <img
                  src={mnq}
                  alt="Background Pattern"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="relative text-center z-10">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-black mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    MAIS DE
                  </h1>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-red-600 mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    500 DESIGNS
                  </h2>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-black" style={{ fontFamily: 'Calibri, sans-serif' }}>
                    VARIEDADE E QUALIDADE
                  </p>
                </div>
              </div>
            ) : currentBanner === 1 ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />

                {/* MOBILE LAYOUT */}
                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-end pb-8">
                  <div className="relative w-full flex justify-center mb-4">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="object-contain w-[70%] max-h-[120px] z-10"
                    />
                  </div>
                  <div className="relative w-full flex justify-center">
                    <img
                      src={ch}
                      alt="Chad"
                      className="object-contain w-[95%] max-h-[280px]"
                    />
                  </div>
                </div>

                {/* DESKTOP LAYOUT - PROPERLY SCALED */}
                <div className="hidden md:flex absolute bottom-0 left-1/2 transform -translate-x-1/2 items-end justify-between w-full px-8 md:px-12 lg:px-16 xl:px-20">
                  {/* KT - Left */}
                  <div className="flex justify-center items-end flex-1">
                    <div className="relative mb-4 lg:mb-8">
                      <img
                        src={kt}
                        alt="Kurt"
                        className="object-contain w-full h-auto max-h-[380px] lg:max-h-[420px] xl:max-h-[450px]"
                      />
                    </div>
                  </div>

                  {/* CH with rockBanner - Center */}
                  <div className="flex justify-center items-end flex-1 mx-4 md:mx-6 lg:mx-8">
                    <div className="relative mb-4 lg:mb-8">
                      <img
                        src={rockBanner}
                        alt="rockBanner"
                        className="absolute left-1/2 w-[70%] lg:w-[75%] h-auto z-10 -top-8 lg:-top-10"
                        style={{
                          transform: "translateX(-50%)"
                        }}
                      />
                      <img
                        src={ch}
                        alt="Chad"
                        className="object-contain w-full h-auto max-h-[380px] lg:max-h-[420px] xl:max-h-[450px]"
                      />
                    </div>
                  </div>

                  {/* JD - Right */}
                  <div className="flex justify-center items-end flex-1">
                    <div className="relative mb-4 lg:mb-8">
                      <img
                        src={jd}
                        alt="JD"
                        className="object-contain w-full h-auto max-h-[380px] lg:max-h-[420px] xl:max-h-[450px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : currentBanner === 3 ? (
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("hot")}
                <img
                  src={bt}
                  alt="Bart"
                  className="absolute inset-0 w-full h-full object-contain z-10"
                  style={{ transform: 'scale(1.1)' }}
                />
              </div>
            ) : currentBanner === 4 ? (
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("cold")}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute inset-0 w-full h-full object-contain z-10"
                  style={{ transform: 'scale(1.1)' }}
                />
              </div>
            ) : currentBanner === 5 ? (
              <div className="absolute inset-0 w-full h-full flex justify-center items-end">
                <img
                  src={fclub}
                  alt="F Club"
                  className="object-contain w-[95%] h-[95%]"
                />
                <div className="absolute inset-0">
                  <button
                    onClick={handleInstagramClick}
                    className="absolute z-30 transition-all duration-300 hover:scale-110 left-[12%] top-[18%]"
                    aria-label="Follow us on Instagram"
                  >
                    <FaInstagram className="text-pink-600 size-16 sm:size-20 md:size-24 lg:size-28" />
                  </button>
                  <button
                    onClick={handleFacebookClick}
                    className="absolute z-30 transition-all duration-300 hover:scale-110 right-[12%] top-[18%]"
                    aria-label="Follow us on Facebook"
                  >
                    <FaFacebook className="text-blue-600 size-16 sm:size-20 md:size-24 lg:size-28" />
                  </button>
                </div>
              </div>
            ) : currentBanner === 6 ? (
              <div className="absolute inset-0 w-full h-full flex justify-center items-end">
                <img
                  src={py}
                  alt="Python"
                  className="object-contain w-[90%] h-[90%]"
                />
                <button
                  onClick={handleWhatsAppClick}
                  className="absolute z-30 transition-all duration-300 hover:scale-105 right-[20%] top-[12%]"
                  aria-label="Contact via WhatsApp"
                >       
                  <FaWhatsapp className="text-green-500 size-16 sm:size-20 md:size-24 lg:size-28" />
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full gap-6 md:gap-10">
                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoBanner}
                        alt="Finito Banner"
                        className="object-contain w-[90%] h-[90%] max-h-[400px]"
                      />
                    </div>
                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoAd}
                        alt="Finito Ad"
                        className="object-contain w-[90%] h-[90%] max-h-[400px]"
                      />
                    </div>
                  </div>
                ) : (
                  <img
                    src={bannerCombos[currentBanner].bg}
                    alt="Banner Background"
                    className="object-contain w-[95%] h-[95%]"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-3 mt-6 mb-6">
          {bannerCombos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-4 h-4 rounded-full border-2 border-black transition-colors duration-300 ${
                idx === currentBanner ? "bg-red-500" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        <Products />

        {/* Pagination */}
        <div className="flex justify-center space-x-3 mt-6 mb-20">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded-full border-2 border-black transition-colors ${
                currentPage === idx + 1 ? "bg-red-500 text-white" : "bg-white"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;