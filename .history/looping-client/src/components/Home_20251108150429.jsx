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
  { bg: finitoBanner, overlay: null }, // 0 - Finito Banner
  { bg: showImage, overlay: [kt, rockBanner, ch, jd], animated: true }, // 1 - Show Image Banner
  { bg: "promo", overlay: null, promo: true }, // 2 - "Leve 4 Pague 3" banner
  { bg: bt, overlay: hotSymbol, symbolType: "hot" }, // 3 - Bart with hot symbols
  { bg: ks, overlay: coldSymbol, symbolType: "cold" }, // 4 - Krusty with cold symbols
  { bg: fclub, overlay: null }, // 5 - FClub banner
  { bg: py, overlay: null }, // 6 - Python banner (IMMEDIATELY AFTER FCLUB)
  { bg: "cupons", overlay: null, cupons: true }, // 7 - "CUPONS DE DESCONTO" banner
  { bg: "black", overlay: null, logo: true }, // 8 - Logo banner
  { bg: "designs", overlay: null, designs: true } // 9 - "MAIS DE 500 DESIGNS" banner
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
    const bannerDuration = 99918.15;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerCombos.length);
    }, bannerDuration * 1000);

    return () => clearInterval(interval);
  }, [bannerCombos.length]);

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    const phoneNumber = "5511999999999";
    const message = "Olá! Gostaria de mais informações sobre os produtos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Instagram click handler
  const handleInstagramClick = () => {
    const instagramUrl = "https://instagram.com/finito.official";
    window.open(instagramUrl, '_blank');
  };

  // Facebook click handler
  const handleFacebookClick = () => {
    const facebookUrl = "https://facebook.com/finito.official";
    window.open(facebookUrl, '_blank');
  };

  // Function to generate floating symbols
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
      <main className="flex-1 bg-white pt-[102.4px]">

        {/* ENLARGED Zoom-resistant banner container */}
        <div className="flex justify-center items-center px-4 py-13">
          <div 
            className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white"
            style={{
              width: 'min(1400px, 98vw)', // Increased from 1200px to 1400px
              height: 'min(600px, 80vh)', // Increased from 500px to 600px
              minWidth: '350px', // Increased from 300px
              minHeight: '250px' // Increased from 200px
            }}
          >
            
            {/* Banner Content */}
            {currentBanner === 2 ? ( // "Leve 4 Pague 3" Promo Banner - CALIBRI
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8">
                  {/* Main Promo Text */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      LEVE 4
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-yellow-300 mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      PAGUE 3
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      PROMOÇÃO ESPECIAL
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white opacity-90" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Em todas as camisetas!
                    </p>
                  </div>
                </div>
              </div>
            ) : currentBanner === 7 ? ( // "CUPONS DE DESCONTO" Banner - CALIBRI
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-600 via-green-500 to-green-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8">
                  {/* Main Title */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      CUPONS DE
                    </h1>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-yellow-300 mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      DESCONTO
                    </h2>
                  </div>
                  
                  {/* Promo Details */}
                  <div className="text-center mb-3 sm:mb-4 md:mb-6">
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      ATÉ 50% OFF
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white opacity-90 font-semibold" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Em toda a loja!
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="text-center">
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white opacity-90" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Use o código: <span className="font-bold text-yellow-300">FINITO50</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : currentBanner === 8 ? ( // Logo banner
              <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                <div className="relative flex justify-center items-center w-full h-full">
                  <img
                    src={logo}
                    alt="Finito Logo"
                    className="object-contain w-[85%] h-[85%]"
                  />
                </div>
              </div>
            ) : currentBanner === 9 ? ( // "MAIS DE 500 DESIGNS" Banner
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={mnq}
                  alt="Background Pattern"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  style={{
                    animation: 'containedBounce 8s ease-in-out infinite',
                    objectPosition: 'center center'
                  }}
                />
                
                {/* Content Container */}
                <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8 z-10">
                  {/* Main Title */}
                  <div className="text-center mb-3 sm:mb-4 md:mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-black mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      MAIS DE
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-red-600 mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      500 DESIGNS
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-2 sm:mb-3 md:mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      VARIEDADE E QUALIDADE
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 font-semibold" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Para todos os gostos!
                    </p>
                  </div>
                </div>
              </div>
              
            ) : currentBanner === 1 ? ( // showImage BANNER - CHAD MADE SIGNIFICANTLY BIGGER
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />

         {/* MOBILE LAYOUT - CHAD BIGGER */}
<div className="md:hidden absolute inset-0 flex flex-col items-end justify-end pb-2 sm:pb-3 md:pb-4">
  <div className="relative w-full flex justify-center h-[31%] xs:h-[30%] sm:h-[28%] md:h-[25%] lg:h-[30%] translate-y-13 xs:translate-y-14 sm:-translate-y-12 md:translate-y-12 lg:translate-y-18">
    <img
      src={rockBanner}
      alt="rockBanner"
      className="h-full object-contain z-10 scale-105 xs:scale-110 sm:scale-100 md:scale-105"
    />
  </div>
  
  <div className="relative w-full flex justify-center h-[69%] xs:h-[70%] sm:h-[72%] md:h-[75%] lg:h-[70%] -translate-y-1 xs:translate-y-0 sm:-translate-y-1 md:translate-y-0">
    <img
      src={ch}
      alt="Chad"
      className="h-full object-contain scale-95 xs:scale-100 sm:scale-105 md:scale-100"
    />
  </div>
</div>

                {/* DESKTOP LAYOUT - CHAD SIGNIFICANTLY BIGGER AND DOMINANT */}
                <div className="hidden md:flex absolute inset-0 items-end justify-between px-12 pb-2">
                  {/* KT - Left - Smaller to emphasize Chad */}
                  <div className="flex-1 flex justify-center items-end" style={{ height: '80%' }}>
                    <img
                      src={kt}
                      alt="Kurt"
                      className="h-full object-contain" 
                    />
                  </div>

                  {/* CH with rockBanner - Center - CHAD IS NOW MUCH BIGGER */}
                  <div className="flex-1 flex flex-col justify-end items-center mx-6" style={{ height: '100%' }}>
                    <div className="relative w-full flex justify-center translate-y-8" style={{ height: '30%' }}>
                      <img
                        src={rockBanner}
                        alt="rockBanner"
                        className="h-full object-contain z-10"
                      />
                    </div>
                    <div className="relative w-full flex justify-center" style={{ height: '80%' }}>
                      <img
                        src={ch}
                        alt="Chad"
                        className="h-full object-contain" 
                      />
                    </div>
                  </div>

                  {/* JD - Right - Smaller to emphasize Chad */}
                  <div className="flex-1 flex justify-center items-end" style={{ height: '80%' }}>
                    <img
                      src={jd}
                      alt="JD"
                      className="h-full object-contain" 
                    />
                  </div>
                </div>
              </div>
            ) : currentBanner === 3 ? ( // Bart with hot symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("hot")}
                <img
                  src={bt}
                  alt="Bart"
                  className="absolute inset-0 w-full h-full object-contain z-10"
                />
              </div>
            ) : currentBanner === 4 ? ( // Krusty with cold symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("cold")}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute inset-0 w-full h-full object-contain z-10"
                />
              </div>
            ) : currentBanner === 5 ? ( // FCLUB BANNER
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                <div className="relative w-full h-full flex justify-center items-center">
                  <img
                    src={fclub}
                    alt="F Club"
                    className="object-contain w-full h-full"
                  />
                  
                  {/* Social Media Icons */}
                  <div className="absolute inset-0 pointer-events-none">
                    <button
                      onClick={handleInstagramClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-110
                                 left-[10%] top-[15%]"
                      aria-label="Follow us on Instagram"
                    >
                      <FaInstagram className="text-pink-600 size-12 sm:size-14 md:size-16 lg:size-18 xl:size-20" />
                    </button>

                    <button
                      onClick={handleFacebookClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-110
                                 right-[10%] top-[15%]"
                      aria-label="Follow us on Facebook"
                    >
                      <FaFacebook className="text-blue-600 size-12 sm:size-14 md:size-16 lg:size-18 xl:size-20" />
                    </button>
                  </div>
                </div>
              </div>
            ) : currentBanner === 6 ? ( // PYTHON BANNER
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                <div className="relative w-full h-full flex justify-center items-center">
                  <img
                    src={py}
                    alt="Python"
                    className="object-contain w-full h-full"
                  />
                  
                  {/* WhatsApp Button */}
                  <button
                    onClick={handleWhatsAppClick}
                    className="absolute z-30 transition-all duration-300 hover:scale-105
                               right-[15%] top-[10%]"
                    aria-label="Contact via WhatsApp"
                  >      
                    <FaWhatsapp className="text-green-500 size-12 sm:size-16 md:size-20 lg:size-22 xl:size-24" />
                  </button>
                </div>
              </div>
            ) : (
              // Other banners (Finito banner at position 0)
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  // finito banner layout
                  <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full gap-4 p-4">
                    <div className="flex justify-center items-center w-full sm:w-1/2 h-full">
                      <img
                        src={finitoBanner}
                        alt="Finito Banner"
                        className="object-contain w-full h-full"
                      />
                    </div>

                    <div className="flex justify-center items-center w-full sm:w-1/2 h-full">
                      <img
                        src={finitoAd}
                        alt="Finito Ad"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  </div>
                ) : (
                  // Other single banners
                  <div className="flex justify-center items-center w-full h-full p-4">
                    <img
                      src={bannerCombos[currentBanner].bg}
                      alt="Banner Background"
                      className="object-contain w-full h-full"
                    />
                  </div>
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