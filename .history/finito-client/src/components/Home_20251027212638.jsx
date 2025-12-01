import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Pagamento from "./Pagamento";
//import modelTshirt from "../assets/model-tshirt.png";
import showImage from "../assets/bg.png";
import kt from "../assets/kurt.png";
import rnr from "../assets/rnr.png";
import oneBanner from "../assets/10.png";
import sl from "../assets/chad.png";
import jd from "../assets/jd.png";
import fclub from "../assets/fclub.png";
import ks from "../assets/krusty.png";
import coldSymbol from "../assets/cold.png";
import py from "../assets/python.gif";
import finitoBanner from "../assets/finito-banner.png"; // Add this import
import finitoAd from "../assets/finito-banner.png"; // Using same image for finitoAd
import BannerTimer from "./BannerTimer";
import Products from './Products';

// Updated bannerCombos array with finito-banner.png as the first banner
const bannerCombos = [
  { bg: finitoBanner, overlay: null }, // New first banner
  { bg: showImage, overlay: [kt, oneBanner, sl, jd], animated: true },
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
  }, [bannerCombos.length]); // Fixed dependency

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">

        {/* Centered Banner Container with Safe Spacing */}
        <div className="flex justify-center items-center p-4 mt-4 sm:mt-6 md:mt-8">
          <div className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white max-w-[95%] w-[1400px] h-[350px] sm:h-[400px] md:h-[400px] lg:h-[525px]">
            {/* Banner Content */}
            {currentBanner === 2 ? ( // Updated index for Krusty banner
  <div className="absolute inset-0 w-full h-full">
    {(() => {
      const symbols = [];
      const placed = [];
      const symbolCount = 40; // Reduced for cleaner look
      
      // Create a grid for even distribution
      const cols = 8;
      const rows = 5;
      const cellWidth = 1000 / cols;
      const cellHeight = 500 / rows;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Skip some cells randomly for natural look
          if (Math.random() < 0.4) continue;
          
          const size = 20 + Math.random() * 20; // 20-40px
          const leftPx = col * cellWidth + cellWidth * 0.2 + Math.random() * (cellWidth * 0.6);
          const topPx = row * cellHeight + cellHeight * 0.2 + Math.random() * (cellHeight * 0.6);
          
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
                transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
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
) : currentBanner === 1 ? ( // Updated index for showImage banner
              // SPECIAL LAYOUT FOR showImage BANNER - Full background layout
              <div className="absolute inset-0 w-full h-full">
                {/* Background Image - Fills entire container */}
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 animate-scaleSlow"
                />
                
                {/* Overlay Images with proper spacing to prevent overlap */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end justify-between w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
                  {/* KT - Left */}
                  <div className="hidden md:flex justify-center items-end flex-1">
                    <div className="relative scale-[0.7] sm:scale-[0.8] md:scale-[0.9] lg:scale-[1.0] xl:scale-[1.4] mb-4 md:mb-6 lg:mb-8"
                         style={{ transformOrigin: "bottom center" }}>
                      <img 
                        src={kt} 
                        alt="Kurt" 
                        className="w-full h-auto object-contain max-h-[280px]" 
                      />
                    </div>
                  </div>
                  
               
        
{/* SL with oneBanner - Center (Single instance for all screens) */}
<div className="flex justify-center items-end flex-1 mx-2 sm:mx-4 md:mx-6">
  <div
    className="relative scale-[0.8] sm:scale-[0.9] md:scale-[1.0] lg:scale-[1.1] xl:scale-[1.4] mb-4 md:mb-6 lg:mb-8"
    style={{ transformOrigin: "bottom center" }}
  >
    <img
      src={oneBanner}
      alt="oneBanner"
      className="absolute left-1/2 w-[50%] sm:w-[55%] md:w-[60%] lg:w-[65%] h-auto z-10"
      style={{ 
        top: "clamp(-10%, -10%, -10%)", // Changed from -15% to -10% (moves down)
        transform: "translateX(-50%)" 
      }}
    />
    <img 
      src={sl} 
      alt="Slip" 
      className="w-full h-auto object-contain max-h-[280px] mt-4"
      style={{ marginTop: "0.5rem", transform: "translateY(18px)" }}
    />
  </div>
</div>
                  
                  {/* JD - Right */}
                  <div className="hidden md:flex justify-center items-end flex-1">
                    <div className="relative scale-[0.7] sm:scale-[0.8] md:scale-[0.9] lg:scale-[1.0] xl:scale-[1.35] mb-4 md:mb-6 lg:mb-8"
                         style={{ transformOrigin: "bottom center" }}>
                      <img 
                        src={jd} 
                        alt="JD" 
                        className="w-full h-auto object-contain max-h-[280px]" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : currentBanner === 0 ? ( // SPECIAL LAYOUT FOR FINITO BANNER
              // Finito Banner on left side with finitoAd on the right
              <div className="absolute inset-0 w-full h-full flex items-center justify-between p-8">
                {/* Finito Banner - Left Side */}
                <div className="flex-1 flex justify-start items-center h-full">
                  <img
                    src={finitoBanner}
                    alt="Finito Banner"
                    className="object-contain h-3/4 max-h-full -translate-x-4"
                    style={{ 
                      maxWidth: '60%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                
                {/* Finito Ad - Right Side */}
                <div className="flex-1 flex justify-end items-center h-full">
                  <img
                    src={finitoAd}
                    alt="Finito Ad"
                    className="object-contain h-3/4 max-h-full"
                    style={{ 
                      maxWidth: '60%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            ) : (
              // DEFAULT LAYOUT FOR OTHER BANNERS
              <div className="relative w-full h-full flex justify-center items-center pt-7 pl-7 pr-7">
                <img
                  src={bannerCombos[currentBanner].bg}
                  alt="Banner Background"
                  className={`${bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""} ${
                    bannerCombos[currentBanner].bg === py || bannerCombos[currentBanner].bg === fclub
                      ? "object-contain w-full h-full max-h-full"
                      : "object-contain w-full h-full max-h-full"
                  }`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
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