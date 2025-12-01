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
import mnq from "../assets/mnq.png"; // ADD THIS IMPORT
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
    const bannerDuration = 18.15;
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
      {/* FIX: Set padding-top to fixed pixel value (102.4px = 6.4rem) to prevent scaling with zoom */}
      <main className="flex-1 bg-white pt-[202.4px]">

        {/* Outer container: Removed all rem-based vertical spacing (mt-x, p-x) */}
        <div className="flex justify-center items-center px-4">
          <div 
            // FIX: Replaced rem heights with stable Viewport Height (vh) units
            className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white max-w-[95%] w-[87.5rem] h-[30vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh]"
            style={{ minHeight: '300px' }} // Added min-height fallback for very short screens
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
                    className="object-contain 
                      w-[85%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[65%]
                      h-auto max-h-[80%] sm:max-h-[85%] md:max-h-[90%]
                      transition-transform duration-500 ease-out
                      hover:scale-[1.02]"
                    style={{ 
                      objectFit: "contain",
                      objectPosition: "center center"
                    }}
                  />
                </div>
              </div>
            ) : currentBanner === 9 ? ( // "MAIS DE 500 DESIGNS" Banner with horizontally stretched background
              <div className="absolute inset-0 w-full h-full">
                {/* Background stretched horizontally with up/down movement */}
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
              
            ) : currentBanner === 1 ? ( // showImage BANNER - STABILIZED LAYOUT
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 animate-scaleSlow"
                />

                {/* MOBILE LAYOUT - Removed scales */}
                <div className="md:hidden absolute inset-0 flex flex-col items-end justify-center pb-2 px-2">
                  <div className="relative w-full flex justify-center mb-1">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="object-contain max-h-[80px] z-10"
                    />
                  </div>
                  
                  <div className="relative w-full flex justify-center">
                    <img
                      src={ch}
                      alt="Chad"
                      className="object-contain max-h-[220px]"
                    />
                  </div>
                </div>

                {/* DESKTOP LAYOUT - Removed all transform/scale properties */}
                <div className="hidden md:flex absolute inset-0 items-end justify-between px-4 md:px-8 lg:px-12 xl:px-16 pb-2">
                  {/* KT - Left */}
                  <div className="flex-1 flex justify-center items-end h-full">
                    <img
                      src={kt}
                      alt="Kurt"
                      className="w-full h-full object-contain" 
                    />
                  </div>

                  {/* CH with rockBanner - Center */}
                  <div className="flex-1 flex flex-col justify-end items-center h-full mx-2 md:mx-4">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="max-h-[80px] object-contain z-10 mb-1"
                    />
                    <img
                      src={ch}
                      alt="Chad"
                      className="w-full h-full object-contain" 
                    />
                  </div>

                  {/* JD - Right */}
                  <div className="flex-1 flex justify-center items-end h-full">
                    <img
                      src={jd}
                      alt="JD"
                      className="w-full h-full object-contain" 
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
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                />
              </div>
            ) : currentBanner === 4 ? ( // Krusty with cold symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("cold")}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                  style={{
                    transform: "scale(1.1)"
                  }}
                />
              </div>
            ) : currentBanner === 5 ? ( // FCLUB BANNER WITH INSTAGRAM AND FACEBOOK
              <div className="flex justify-center items-end w-full h-full relative">
                <div className="relative w-full h-full flex justify-center items-end">
                  <img
                    src={fclub}
                    alt="F Club"
                    className="object-contain 
                      w-[95%]
                      sm:w-[90%] 
                      md:w-[85%] 
                      lg:w-[80%]
                      xl:w-[75%]
                      h-auto 
                      max-h-[100%]"
                    style={{ 
                      objectFit: "contain",
                      objectPosition: "center bottom",
                      width: "100%",
                      height: "auto"
                    }}
                  />
                  
                  {/* Social Media Icons Container */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Instagram - Left Side */}
                    <button
                      onClick={handleInstagramClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-110
                                 left-[10%] top-[15%]
                                 sm:left-[12%] sm:top-[18%]
                                 md:left-[15%] md:top-[20%]
                                 lg:left-[18%] lg:top-[22%]"
                      aria-label="Follow us on Instagram"
                    >
                      <FaInstagram className="text-pink-600 size-12 sm:size-14 md:size-16 lg:size-18 xl:size-20" />
                    </button>

                    {/* Facebook - Right Side */}
                    <button
                      onClick={handleFacebookClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-110
                                 right-[10%] top-[15%]
                                 sm:right-[12%] sm:top-[18%]
                                 md:right-[15%] md:top-[20%]
                                 lg:right-[18%] lg:top-[22%]"
                      aria-label="Follow us on Facebook"
                    >
                      <FaFacebook className="text-blue-600 
                        size-12 sm:size-14 md:size-16 lg:size-18 xl:size-20" />
                    </button>
                  </div>
                </div>
              </div>
            ) : currentBanner === 6 ? ( // PYTHON BANNER - IMMEDIATELY AFTER FCLUB
              <div className="flex justify-center items-end w-full h-full relative">
                <div className="relative w-full h-full flex justify-center items-end">
                  <img
                    src={py}
                    alt="Python"
                    className="object-contain 
                      w-[80%] sm:w-[85%] md:w-[90%] lg:w-[95%]
                      h-auto max-h-[90%] sm:max-h-[95%] lg:max-h-[90%]"
                    style={{ 
                      objectFit: "contain",
                      objectPosition: "center bottom",
                      width: "100%", 
                      height: "auto"
                    }}
                  />
                  
                  {/* WhatsApp Button */}
                  <div className="absolute inset-0 pointer-events-none">
                    <button
                      onClick={handleWhatsAppClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-105
                                 right-[15%] top-[6%]
                                 md:right-[30%] md:top-[6%]"
                      aria-label="Contact via WhatsApp"
                    >      
                      <FaWhatsapp className="text-green-500 size-12 sm:size-16 md:size-20 lg:size-22 xl:size-24" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Other banners (Finito banner at position 0)
              <div className="relative w-full h-full flex justify-center items-end p-0">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  // finito banner layout
                  <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full gap-3 sm:gap-6 md:gap-8">
                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoBanner}
                        alt="Finito Banner"
                        className="object-contain 
                          w-[95%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[70%]
                          h-auto max-h-[95%] sm:max-h-[90%]"
                        style={{ 
                          objectFit: "contain",
                          transform: "scale(1.05) translateY(12px)",
                          objectPosition: "center center"
                        }}
                      />
                    </div>

                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoAd}
                        alt="Finito Ad"
                        className="object-contain 
                          w-[90%] sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%]
                          h-auto max-h-[95%] sm:max-h-[100%]"
                        style={{ 
                          objectFit: "contain",
                          objectPosition: "center center"
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Other single banners
                  <div className="flex justify-center items-center w-full h-full">
                    <img
                      src={bannerCombos[currentBanner].bg}
                      alt="Banner Background"
                      className={`${
                        bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
                      } object-contain 
                        w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%]
                        h-auto max-h-[95%] sm:max-h-[90%]`}
                      style={{
                        objectFit: "contain",
                        objectPosition: "center center"
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        {/* FIX: Replaced mt-6 mb-6 with fixed px margin top/bottom for stability */}
        <div className="flex justify-center space-x-3" style={{ marginTop: '24px', marginBottom: '24px' }}>
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
      {/*<Footer />*/}
    </div>
  );
}

export default App;