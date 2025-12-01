import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
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
              // ✅ IMPROVED: BETTER MOBILE SCALING FOR CHAD & ROCKBANNER
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 animate-scaleSlow"
                />

                {/* MOBILE LAYOUT - Optimized vertical stacking */}
                <div className="md:hidden absolute inset-0 flex flex-col items-center justify-end pb-2 px-2">
                  {/* rockBanner - Better mobile scaling */}
                  <div className="relative mb-1 w-full flex justify-center">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="w-[70%] h-auto object-contain z-10 max-h-[80px]"
                      style={{
                        transform: "scale(1.1)"
                      }}
                    />
                  </div>
                  
                  {/* Chad - Much better mobile scaling */}
                  <div className="relative w-full flex justify-center">
                    <img
                      src={ch}
                      alt="Chad"
                      className="object-contain 
                        w-[95%]     /* Much larger on mobile */
                        max-h-[220px] /* Better height control */
                        sm:max-h-[240px]"
                      style={{
                        transform: "scale(1.05)" /* Slight scale boost */
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

                  {/* Chad with rockBanner - Center */}
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
                        className="relative scale-[1.9] lg:scale-[1.0] xl:scale-[1.35] mb-6 lg:mb-8"
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
              // DEFAULT LAYOUT FOR OTHER BANNERS
              <div className="relative w-full h-full flex justify-center items-center p-2 sm:p-4">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  // finito banner layout
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
                          w-[95%] sm:w-[85%] md:w-[80%] lg:w-[75%] xl:w-[70%]
                          h-auto max-h-[95%] sm:max-h-[90%]"
                        style={{ 
                          objectFit: "contain",
                          objectPosition: "center center"
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Single banners
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