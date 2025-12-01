import React, { useState } from "react";
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
import { FiHeart, FiShoppingCart } from "react-icons/fi";

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
];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

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

      <main className="flex-1 bg-white pt-[130px] lg:pt-[95px]">
        {/* Banner Carousel */}
        <div className="relative w-full h-[50vh] sm:h-[45vh] md:h-[60vh] lg:h-[55vh] xl:h-[50vh] rounded-xl overflow-hidden border-b-4 border-black">

          {/* Krusty with randomly spread cold symbols */}
          {currentBanner === 1 ? (
            <div className="absolute inset-0 w-full h-full">
              {(() => {
                const symbols = [];
                const attemptsLimit = 150;
                const numSymbols = 60;
                const placed = [];

                const containerWidth = 800;
                const containerHeight = 400;

                for (let i = 0; i < numSymbols; i++) {
                  let valid = false;
                  let topPx, leftPx, size;
                  let attempts = 0;

                  while (!valid && attempts < attemptsLimit) {
                    size = 25 + Math.random() * 35;
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

              <img
                src={krusty}
                alt="Krusty"
                className="absolute inset-0 w-full h-full object-contain z-10"
              />
            </div>
          ) : (
            <img
              src={bannerCombos[currentBanner].bg}
              alt="Shop Banner"
              className={`w-full h-full transition-transform duration-700 ease-in-out ${
                bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
              }`}
              style={{
                opacity: bannerCombos[currentBanner].bg === showImage ? 0.4 : 1,
                objectPosition:
                  bannerCombos[currentBanner].bg === tyler
                    ? "center bottom"
                    : bannerCombos[currentBanner].bg === showImage
                    ? "40% 99%"
                    : "center top",
              }}
            />
          )}

          {/* Overlay items for showImage banner */}
          {Array.isArray(bannerCombos[currentBanner].overlay) && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end justify-center space-x-3">
              {bannerCombos[currentBanner].overlay.map((img, i) => {
                if (img === slip) {
                  return (
                    <div
                      key={i}
                      className="relative w-[85%] sm:w-[35%] h-auto scale-150 sm:scale-130"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      {bannerCombos[currentBanner].overlay.includes(sr) && (
                        <img
                          src={sr}
                          alt="SR"
                          className="absolute -top-2 left-[25%] transform w-[55%] sm:w-[45%] h-auto z-10"
                        />
                      )}
                      <img src={slip} alt="Slip" className="w-full h-auto object-contain" />
                    </div>
                  );
                }

                let className = "object-contain";
                if (img === kurt) className += " w-[32%] h-auto hidden sm:block";
                if (img === jd) className += " w-[30%] h-auto hidden sm:block";
                if (img === sr) return null;

                return <img key={i} src={img} alt={`Overlay ${i}`} className={className} />;
              })}
            </div>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-2 mt-3">
          {bannerCombos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-3 h-3 rounded-full border-2 border-black transition-colors duration-300 ${
                idx === currentBanner ? "bg-red-500" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-[1400px] mx-auto mt-4 px-4">
          {pagedItems.map((item) => {
            const isFavorited = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="relative bg-white rounded-xl shadow-lg flex flex-col items-center p-4 hover:scale-105 transition-transform duration-300"
                style={{ minHeight: "380px" }}
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
                  className="w-full h-[220px] object-contain rounded-lg mb-4"
                />
                <h2 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 text-center">
                  {item.title}
                </h2>
                <p className="text-red-500 font-semibold mb-3 text-base sm:text-lg text-center">
                  {item.price}
                </p>
                <div className="w-full flex justify-center mt-1">
                  <button className="flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md border-2 border-black hover:bg-red-600 transition-colors text-sm">
                    <FiShoppingCart className="text-xl mr-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-3 mt-4 mb-16">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-2 py-1 rounded-full border-2 border-black transition-colors text-sm ${
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