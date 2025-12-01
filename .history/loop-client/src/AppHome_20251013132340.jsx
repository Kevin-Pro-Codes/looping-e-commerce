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

const items = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: modelTshirt,
}));

const bannerCombos = [
  { bg: showImage, overlay: [kurt, sr, slip, jd], animated: true },
  { bg: krusty, overlay: null },
  { bg: tyler, overlay: null },
  { bg: python, overlay: null }, 
];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isHighZoomDesktop, setIsHighZoomDesktop] = useState(false);

  // Detect high zoom only on desktop
  useEffect(() => {
    const checkZoom = () => {
      const zoom = Math.round(window.devicePixelRatio * 100);
      const isDesktop = window.innerWidth >= 1024;
      setIsHighZoomDesktop(isDesktop && zoom >= 300);
    };

    checkZoom();
    window.addEventListener('resize', checkZoom);
    return () => window.removeEventListener('resize', checkZoom);
  }, []);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const pagedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-white pt-[110px] lg:pt-[95px]">
        {/* Banner Carousel - Remove overflow-hidden for high zoom */}
        <div className={`
          relative w-full rounded-xl border-b-4 border-black
          ${isHighZoomDesktop 
            ? "h-[183vh] min-h-[800px] overflow-visible" 
            : "h-[60vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh] 2xl:h-[60vh] overflow-hidden"
          }
        `}>
          
          {/* Krusty special case with cold symbols */}
          {currentBanner === 1 ? (
            <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${
              isHighZoomDesktop ? "scale-150" : ""
            }`}>
              {(() => {
                const symbols = [];
                const attemptsLimit = 200;
                const numSymbols = 72;
                const placed = [];

                const containerWidth = isHighZoomDesktop ? 1500 : 1000;
                const containerHeight = isHighZoomDesktop ? 750 : 500;

                for (let i = 0; i < numSymbols; i++) {
                  let valid = false;
                  let topPx, leftPx, size;
                  let attempts = 0;

                  while (!valid && attempts < attemptsLimit) {
                    size = isHighZoomDesktop ? 60 + Math.random() * 80 : 30 + Math.random() * 40;
                    leftPx = Math.random() * (containerWidth - 1);
                    topPx = Math.random() * (containerHeight - 1);

                    valid = true;
                    for (let p of placed) {
                      const dx = p.left - leftPx;
                      const dy = p.top - topPx;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      if (distance < (p.size + size) * 0.6) {
                        valid = false;
                        break;
                      }
                    }
                    attempts++;
                  }

                  placed.push({ top: topPx, left: leftPx, size });

                  symbols.push(
                    <img
                      key={i}
                      src={coldSymbol}
                      alt="Cold"
                      className="absolute opacity-70"
                      style={{
                        top: `${(topPx / containerHeight) * 100}%`,
                        left: `${(leftPx / containerWidth) * 100}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
                      }}
                    />
                  );
                }

                return symbols;
              })()}

              {/* Krusty overlay */}
              <img
                src={krusty}
                alt="Krusty"
                className={`relative max-w-full max-h-full object-contain z-10 ${
                  isHighZoomDesktop ? "scale-125" : ""
                }`}
              />
            </div>
          ) : (
            <div className={`relative w-full h-full flex items-center justify-center ${
              isHighZoomDesktop ? "scale-150" : ""
            }`}>
              <img
                src={bannerCombos[currentBanner].bg}
                alt="Shop Banner"
                className={`
                  ${bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""}
                  ${bannerCombos[currentBanner].bg === python 
                    ? "absolute bottom-0 left-1/2 transform -translate-x-1/2" 
                    : "relative max-w-full max-h-full"
                  }
                  ${bannerCombos[currentBanner].bg === python 
                    ? `sm:w-[12%] md:w-[13%] lg:w-[14%] ${isHighZoomDesktop ? "!w-[20%]" : ""}` 
                    : ""
                  }
                  ${bannerCombos[currentBanner].bg === showImage ? "opacity-40 object-contain" : "object-contain"}
                  ${bannerCombos[currentBanner].bg === tyler 
                    ? `w-[60%] sm:w-[50%] md:w-[30%] ${isHighZoomDesktop ? "!w-[50%] !scale-150" : ""}` 
                    : ""
                  }
                `}
              />
            </div>
          )}

          {/* Overlay items for showImage banner */}
          {Array.isArray(bannerCombos[currentBanner].overlay) && (
            <div className={`absolute inset-0 flex items-center justify-center space-x-4 ${
              isHighZoomDesktop ? "scale-150" : "bottom-0 left-1/2 transform -translate-x-1/2"
            } ${isHighZoomDesktop ? "" : "items-end"}`}>
              {bannerCombos[currentBanner].overlay.map((img, i) => {
                if (img === slip) {
                  return (
                    <div
                      key={i}
                      className={`relative ${isHighZoomDesktop ? "w-[120%]" : "w-[90%]"} sm:w-[40%] h-auto ${
                        isHighZoomDesktop ? "scale-175" : "scale-170 sm:scale-150"
                      }`}
                      style={{ transformOrigin: isHighZoomDesktop ? "center center" : "bottom center" }}
                    >
                      {bannerCombos[currentBanner].overlay.includes(sr) && (
                        <img
                          src={sr}
                          alt="SR"
                          className={`
                            absolute
                            ml-1
                            ${isHighZoomDesktop ? "-top-14" : "-top-7"}
                            sm:${isHighZoomDesktop ? "-top-8" : "-top-1"}
                            md:${isHighZoomDesktop ? "-top-10" : "-top-2"}
                            lg:${isHighZoomDesktop ? "-top-12" : "-top-3"}
                            xl:${isHighZoomDesktop ? "-top-14" : "-top-4"}
                            2xl:${isHighZoomDesktop ? "-top-16" : "-top-5"}
                            left-1/2
                            transform -translate-x-1/2
                            ${isHighZoomDesktop ? "w-[80%]" : "w-[60%]"} 
                            sm:w-[50%]
                            h-auto
                            z-10
                          `}
                        />
                      )}
                      <img src={slip} alt="Slip" className="w-full h-auto object-contain" />
                    </div>
                  );
                }

                let className = "object-contain";
                if (img === kurt) className += ` ${isHighZoomDesktop ? "w-[54%] scale-125" : "w-[36%]"} h-auto hidden sm:block z-100`;
                if (img === jd) className += ` ${isHighZoomDesktop ? "w-[49%] scale-125" : "w-[33%]"} h-auto hidden sm:block`;
                if (img === sr) return null;

                return <img key={i} src={img} alt={`Overlay ${i}`} className={className} />;
              })}
            </div>
          )}
        </div>

        {/* Dots */}
        <div className={`flex justify-center space-x-3 mt-7 mb-7 ${
          isHighZoomDesktop ? "scale-125" : ""
        }`}>
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

        {/* Grid of items */}
        <div className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 p-1 w-full max-w-[1400px] mx-auto mt-6 ${
          isHighZoomDesktop ? "scale-110 origin-top" : ""
        }`}>
          {pagedItems.map((item) => {
            const isFavorited = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300"
              >
                <button
                  className="absolute top-3 right-3 transition-colors duration-300"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <FiHeart
                    size={24}
                    style={{
                      stroke: "black",
                      strokeWidth: 1.5,
                      fill: isFavorited ? "red" : "none",
                    }}
                  />
                </button>

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3"
                />
                <h2 className="text-lg sm:text-xl font-bold mb-1 text-gray-800 text-center">
                  {item.title}
                </h2>
                <p className="text-red-500 font-semibold text-md sm:text-lg text-center">
                  {item.price}
                </p>
                <div className="w-full flex justify-center mt-2">
                  <button className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
                    <FiShoppingCart className="text-xl mr-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className={`flex justify-center space-x-3 mt-6 mb-20 ${
          isHighZoomDesktop ? "scale-125" : ""
        }`}>
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