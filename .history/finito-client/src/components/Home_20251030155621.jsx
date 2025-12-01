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
import ks from "../assets/krusty.png";
import coldSymbol from "../assets/cold.png";
import py from "../assets/python.gif";
import finitoBanner from "../assets/finito-banner.png";
import finitoAd from "../assets/finito-ad.png";
import BannerTimer from "./BannerTimer";
import Products from "./Products";

// Updated bannerCombos array with finito-banner.png as the first banner
const bannerCombos = [
  { bg: finitoBanner, overlay: null }, // New first banner
  { bg: showImage, overlay: [kt, rockBanner, ch, jd], animated: true },
  { bg: ks, overlay: null },
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">

        {/* Centered Banner Container with Safe Spacing */}
        <div className="flex justify-center items-center p-4 mt-4 sm:mt-6 md:mt-8">
          <div className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white max-w-[95%] w-[1400px] h-[350px] sm:h-[400px] md:h-[400px] lg:h-[525px]">
            
            {/* Banner Content */}
            {currentBanner === 2 ? ( // Krusty banner
              <div className="absolute inset-0 w-full h-full">
                {(() => {
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
                          src={coldSymbol}
                          alt="Cold"
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
                })()}
                {/* Krusty image on top */}
                <img
                  src={ks}
                  alt="Krusty"
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
                // ✅ FIXED: PYTHON - PROPER MOBILE DISPLAY
                <div className="flex justify-center items-end w-full h-full">
                  <div className="relative inline-flex justify-center items-end max-w-full max-h-full">
                    <img
                      src={py}
                      alt="Python"
                      className={`${
                        bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
                      } object-contain 
                        w-[80%]     /* Smaller on mobile to make space for WhatsApp */
                        sm:w-[85%] 
                        md:w-[90%] 
                        lg:w-[95%]
                        h-auto 
                        max-h-[90%] /* Leave space on mobile */
                        sm:max-h-[95%]
                        lg:max-h-[100%]
                        lg:scale-140 lg:-translate-y-17`}
                      style={{ 
                        objectFit: "contain",
                        objectPosition: "center",
                        width: "100%",                        
                        height: "auto"
                      }}
                    />
                    
                    {/* Floating WhatsApp Icon - Always visible on mobile */}
                    <button
                      onClick={handleWhatsAppClick}
                      className="absolute right-25 top-10 transform translate-x-1/2 z-30 transition-all duration-300 hover:scale-105 group"
                      style={{ 
                        transform: "translateX(50%) translateY(-50%)"
                      }}
                      aria-label="Contact via WhatsApp"
                    >       
                      {/* Content */}
                      <div className="flex items-center z-30">
                        <FaWhatsapp className="text-green-500 size-10 sm:size-14 md:size-18 lg:size-24 xl:size-32" />
                      </div>
                    </button>
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







{/*

import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import modelTshirt from "./assets/model-tshirt.png";
import showImage from "./assets/bigbg.png";
import kurt from "./assets/kurt.png";
import rnr from "./assets/rnr.png";
import sr from "./assets/10.png";
import slip from "./assets/slip.png";
import jd from "./assets/jd.png";
import tyler from "./assets/fclub.png";
import krusty from "./assets/krusty.png";
import coldSymbol from "./assets/cold.png";
import python from "./assets/python.gif";
import BannerTimer from "./BannerTimer";


const items = Array.from({ length: 80 }, (_, i) => ({ id: i + 1, title: `Item ${i + 1}`, price: `$${(Math.random() * 100 + 10).toFixed(2)}`, image: modelTshirt }));

const bannerCombos = [
  { bg: showImage, overlay: [kurt, sr, slip, jd], animated: true },
  { bg: krusty, overlay: null },
  { bg: tyler, overlay: null },
  { bg: python, overlay: null }
];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isZoomedHigh, setIsZoomedHigh] = useState(false);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const pagedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleFavorite = (id) => setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);

  useEffect(() => {
    const handleZoom = () => setIsZoomedHigh((window.outerWidth / window.innerWidth) * 100 > 300);
    handleZoom();
    window.addEventListener("resize", handleZoom);
    return () => window.removeEventListener("resize", handleZoom);
  }, []);



  return (
    
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">



        <div className={`relative w-full rounded-xl overflow-hidden border-b-4 border-black ${isZoomedHigh ? "h-[192vh]" : "h-[55vh] sm:h-[52vh] md:h-[53vh] lg:h-[54vh] xl:h-[55vh] 2xl:h-[56vh]"}`}>
       
         
          {currentBanner === 1 ? (
            <div className="absolute inset-0 w-full h-full mt-3">
              {(() => {
                const symbols = [];
                const placed = [];
                for (let i = 0; i < 72; i++) {
                  let valid = false, topPx, leftPx, size, attempts = 0;
                  while (!valid && attempts < 200) {
                    size = 30 + Math.random() * 40;
                    leftPx = Math.random() * 999;
                    topPx = Math.random() * 499;
                    valid = !placed.some(p => Math.sqrt((p.left - leftPx)**2 + (p.top - topPx)**2) < (p.size + size) * 0.6);
                    attempts++;
                  }
                  placed.push({ top: topPx, left: leftPx, size });
                  symbols.push(<img key={i} src={coldSymbol} alt="Cold" className="absolute opacity-70" style={{ top: `${(topPx/500)*100}%`, left: `${(leftPx/1000)*100}%`, width: `${size}px`, height: `${size}px`, transform: `translate(-50%, -50%) rotate(${Math.random()*360}deg)` }} />);
                }
                return symbols;
              })()}
              <img src={krusty} alt="Krusty" className="absolute inset-0 w-full h-full object-contain z-10" />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img src={bannerCombos[currentBanner].bg} alt="Banner Background" className={`${bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""} ${bannerCombos[currentBanner].bg === python ? "absolute bottom-0 left-1/2 transform -translate-x-1/2 sm:w-[14%] md:w-[15%] lg:w-[16%] h-auto" : "relative w-full h-full"} ${bannerCombos[currentBanner].bg === showImage ? "opacity-40 object-cover object-[40%_99%]" : ""} ${bannerCombos[currentBanner].bg === tyler ? "object-contain object-bottom top-10 w-[60%] sm:w-[50%] md:w-[30%] mx-auto p-6" : ""}`} />
            </div>
          )}

          {Array.isArray(bannerCombos[currentBanner].overlay) && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end justify-center space-x-4">
              {bannerCombos[currentBanner].overlay.map((img, i) => {
                if (img === slip) return (
                  <div key={i} className="relative h-auto mt-1 scale-[1.7] sm:scale-[1.9] md:scale-[1.7] lg:scale-[1.5] xl:scale-[1.5] 2xl:scale-[1.5]" style={{ transformOrigin: "bottom center" }}>
                    {bannerCombos[currentBanner].overlay.includes(sr) && <img src={sr} alt="SR" className="absolute justify-center left-1/2 w-[75%] sm:w-[65%] h-auto z-10" style={{ top: "clamp(-11%, -11%, -11%)", transform: "translateX(-50%)" }} />}
                    <img src={slip} alt="Slip" className="w-full h-auto object-contain" />
                  </div>
                );
                let className = "object-contain";
                if (img === kurt) className += " w-[36%] h-auto hidden sm:block z-100";
                if (img === jd) className += " w-[33%] h-auto hidden sm:block";
                if (img === sr) return null;
                return <img key={i} src={img} alt={`Overlay ${i}`} className={className} />;
              })}
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-3 mt-7 mb-7">
          {bannerCombos.map((_, idx) => <button key={idx} onClick={() => setCurrentBanner(idx)} className={`w-4 h-4 rounded-full border-2 border-black transition-colors duration-300 ${idx === currentBanner ? "bg-red-500" : "bg-gray-400"}`} />)}
        </div>

    
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 p-1 w-full max-w-[1400px] mx-auto mt-6">
          {pagedItems.map(item => {
            const isFavorited = favorites.includes(item.id);
            return (
              <div key={item.id} className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300">
                <button className="absolute top-3 right-3 transition-colors duration-300" onClick={() => toggleFavorite(item.id)}>
                  <FiHeart size={24} style={{ stroke: "black", strokeWidth: 1.5, fill: isFavorited ? "red" : "none" }} />
                </button>
                <img src={item.image} alt={item.title} className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3" />
                <h2 className="text-lg sm:text-xl font-bold mb-1 text-gray-800 text-center">{item.title}</h2>
                <p className="text-red-500 font-semibold text-md sm:text-lg text-center">{item.price}</p>
                <div className="w-full flex justify-center mt-2">
                  <button className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
                    <FiShoppingCart className="text-xl mr-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      
        <div className="flex justify-center space-x-3 mt-6 mb-20">
          {Array.from({ length: totalPages }, (_, idx) => <button key={idx} onClick={() => setCurrentPage(idx+1)} className={`px-3 py-1 rounded-full border-2 border-black transition-colors ${currentPage === idx+1 ? "bg-red-500 text-white" : "bg-white"}`}>{idx+1}</button>)}
        </div>

      </main>
    </div>
  );
}

export default App;
*/}