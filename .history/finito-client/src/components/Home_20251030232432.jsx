import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa"; // Import WhatsApp icon
import Navbar from "./Navbar";
import Footer from "./Footer";
import Pagamento from "./Pagamento";
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
import BannerTimer from "./BannerTimer";
import Products from "./Products";

// Updated bannerCombos array with Bart & hotSymbol banner added before Krusty
const bannerCombos = [
  { bg: finitoBanner, overlay: null }, // New first banner
  { bg: showImage, overlay: [kt, rockBanner, ch, jd], animated: true },
  { bg: bt, overlay: hotSymbol, symbolType: "hot" }, // NEW: Bart with hot symbols
  { bg: ks, overlay: coldSymbol, symbolType: "cold" }, // Krusty with cold symbols
  { bg: fclub, overlay: null },
  { bg: py, overlay: null }
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
    // Replace with your actual WhatsApp number and message
    const phoneNumber = "5511999999999"; // Brazil format example
    const message = "Olá! Gostaria de mais informações sobre os produtos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">

        {/* Centered Banner Container with Safe Spacing */}
        <div className="flex justify-center items-center p-4 mt-4 sm:mt-6 md:mt-8">
          <div className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white max-w-[95%] w-[1400px] h-[350px] sm:h-[400px] md:h-[400px] lg:h-[525px]">
            
            {/* Banner Content */}
            {currentBanner === 3 ? ( // Krusty with cold symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("cold")}
                {/* Krusty image on top */}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                />
              </div>
            ) : currentBanner === 2 ? ( // NEW: Bart with hot symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("hot")}
                {/* Bart image on top */}
                <img
                  src={bt}
                  alt="Bart"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                />
              </div>
            ) : currentBanner === 1 ? (
              // ✅ FIXED: MOBILE-FIRST showImage BANNER
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 animate-scaleSlow"
                />

                {/* MOBILE LAYOUT - Scale up while staying centered */}
                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center pb-2 px-2">
                  {/* rockBanner - scaled up but centered */}
                  <div className="relative mb-1 w-full flex justify-center">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="object-contain 
                        w-[75%]     /* Good width for scaling */
                        max-h-[90px] /* Tall enough */
                        z-10"
                      style={{
                        transform: "scale(1.15) translateY(17px)"
                      }}
                    />
                  </div>
                  
                  {/* Chad - scaled up but centered */}
                  <div className="relative w-full flex justify-center">
                    <img
                      src={ch}
                      alt="Chad"
                      className="object-contain 
                        w-[90%]     /* Wide but centered */
                        max-h-[240px] /* Tall but centered */
                        sm:max-h-[250px]"
                      style={{
                        transform: "scale(1.1)" /* Scale up but stay centered */
                      }}
                    />
                  </div>
                </div>

                {/* DESKTOP LAYOUT - Original horizontal layout */}
                <div className="hidden md:flex absolute bottom-0 left-1/2 transform -translate-x-1/2 items-end justify-between w-full px-8 md:px-12 lg:px-16 xl:px-20">
                  {/* KT - Left */}
                  <div className="flex justify-center items-end flex-1">
                    <div
                      className="relative scale-[0.9] lg:scale-[1.0] xl:scale-[1.4] mb-6 lg:mb-8"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={kt}
                        alt="Kurt"
                        className="w-full h-auto object-contain max-h-[280px]"
                      />
                    </div>
                  </div>

                  {/* ch with rockBanner - Center */}
                  <div className="flex justify-center items-end flex-1 mx-4 md:mx-6">
                    <div
                      className="relative scale-[1.0] lg:scale-[1.1] xl:scale-[1.4] mb-6 lg:mb-8"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={rockBanner}
                        alt="rockBanner"
                        className="absolute left-1/2 w-[60%] lg:w-[65%] h-auto z-10"
                        style={{
                          top: "-15%",
                          transform: "translateX(-50%)"
                        }}
                      />
                      <img
                        src={ch}
                        alt="Chad"
                        className="w-full h-auto object-contain max-h-[280px]"
                        style={{
                          transform: "translateY(18px)"
                        }}
                      />
                    </div>
                  </div>

                  {/* JD - Right */}
                  <div className="flex justify-center items-end flex-1">
                    <div
                      className="relative scale-[0.9] lg:scale-[1.0] xl:scale-[1.35] mb-6 lg:mb-8"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={jd}
                        alt="JD"
                        className="w-full h-auto object-contain max-h-[280px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ✅ FIXED: PROPER BOTTOM-TOUCHING SCALING FOR ALL SCREENS
              <div className="relative w-full h-full flex justify-center items-end p-0">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  // finito banner layout - keep centered
                  <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full gap-3 sm:gap-6 md:gap-8">
                    
                    {/* finitoBanner */}
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

                    {/* finitoAd */}
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
                ) : bannerCombos[currentBanner].bg === fclub ? (
                  // ✅ FIXED: FCLUB - TOUCHES BOTTOM ON ALL SCREENS
                  <div className="flex justify-center items-end w-full h-full">
                    <img
                      src={fclub}
                      alt="F Club"
                      className="object-contain 
                        w-[95%]     /* Maximized width */
                        sm:w-[90%] 
                        md:w-[85%] 
                        lg:w-[80%]
                        xl:w-[75%]
                        h-auto 
                        max-h-[100%] /* Fill full height */"
                      style={{ 
                        objectFit: "contain",
                        objectPosition: "center bottom", /* Touch bottom */
                        width: "100%",
                        height: "auto"
                      }}
                    />
                  </div>
                ) : bannerCombos[currentBanner].bg === py ? (
                  // ✅ FIXED: PYTHON - WHATSAPP POSITIONED NEAR CHARACTER HEAD
                  <div className="flex justify-center items-end w-full h-full relative">
                    <div className="relative w-full h-full flex justify-center items-end">
                      <img
                        src={py}
                        alt="Python"
                        className={`${
                          bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
                        } object-contain 
                          w-[80%] sm:w-[85%] md:w-[90%] lg:w-[95%]
                          h-auto max-h-[90%] sm:max-h-[95%] lg:max-h-[100%]`}
                        style={{ 
                          objectFit: "contain",
                          objectPosition: "center bottom",
                          width: "100%",                        
                          height: "auto"
                        }}
                      />
                      
                      {/* WhatsApp Icon - INSIDE CONTAINER AND NEAR HEAD */}
                      <div className="absolute inset-0 pointer-events-none">
                        <button
                          onClick={handleWhatsAppClick}
                          className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-105
                                     right-[15%] top-[6%]     /* Mobile: closer to right edge */
                                     md:right-[30%] md:top-[6%] /* Desktop: keep original position */"
                          aria-label="Contact via WhatsApp"
                        >       
                          <FaWhatsapp className="text-green-500 size-12 sm:size-16 md:size-20 lg:size-22 xl:size-24" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Other single banners - keep centered
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
      {/*<Footer />*/}
    </div>
  );
}

export default App;