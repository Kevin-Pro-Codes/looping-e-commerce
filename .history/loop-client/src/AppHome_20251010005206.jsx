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
import python from "./assets/python.gif"; // 🐍 new gif
import { FiHeart, FiShoppingCart } from "react-icons/fi";

const items = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: modelTshirt,
}));

// add python tab
const bannerCombos = [
  { bg: showImage, overlay: [kurt, sr, slip, jd], animated: true },
  { bg: krusty, overlay: null },
  { bg: tyler, overlay: null },
  { bg: python, overlay: null }, // new banner
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
        <div className="relative w-full h-[60vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh] 2xl:h-[50vh] rounded-xl overflow-hidden border-b-4 border-black">

          {/* Krusty special case with cold symbols */}
          {currentBanner === 1 ? (
            <div className="absolute inset-0 w-full h-full mt-3">
              {(() => {
                const symbols = [];
                const attemptsLimit = 200;
                const numSymbols = 72;
                const placed = [];

                const containerWidth = 1000;
                const containerHeight = 500;

                for (let i = 0; i < numSymbols; i++) {
                  let valid = false;
                  let topPx, leftPx, size;
                  let attempts = 0;

                  while (!valid && attempts < attemptsLimit) {
                    size = 30 + Math.random() * 40;
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
                className="absolute inset-0 w-full h-full object-contain z-10"
              />
            </div>
          ) : (
          <div className="relative w-full h-full" > {/*style={{ backgroundColor: "#FDF9F6" }}*/} 
<img
  src={bannerCombos[currentBanner].bg}
  alt="Shop Banner"
 className={`
   {/*
   transition-transform duration-0 ease-in-out
   */}
    ${bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""}

    ${bannerCombos[currentBanner].bg === python ? "absolute bottom-0 left-1/2 transform -translate-x-1/2" : "relative"}

    ${bannerCombos[currentBanner].bg === python ? " sm:w-[12%] md:w-[13%] lg:w-[14%] h-auto" : "w-full h-full"}

    ${bannerCombos[currentBanner].bg === showImage ? "opacity-40 object-cover object-[40%_99%]" : ""}
    ${bannerCombos[currentBanner].bg === tyler ? "object-contain object-bottom top-6 w-[60%] sm:w-[50%] md:w-[30%] mx-auto p-6"  : ""}
  `}
/>

</div>

          )}

          {/* Overlay items for showImage banner */}
          {Array.isArray(bannerCombos[currentBanner].overlay) && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end justify-center space-x-4">
              {bannerCombos[currentBanner].overlay.map((img, i) => {
                if (img === slip) {
                  return (
                    <div
                      key={i}
                      className="relative w-[90%] sm:w-[40%] h-auto scale-170 sm:scale-150"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      {bannerCombos[currentBanner].overlay.includes(sr) && (
                        <img
                          src={sr}
                          alt="SR"
                          className="absolute -top-2 left-[28%] transform w-[60%] sm:w-[50%] h-auto z-10"
                        />
                      )}
                      <img src={slip} alt="Slip" className="w-full h-auto object-contain" />
                    </div>
                  );
                }

                let className = "object-contain";
                if (img === kurt) className += " w-[36%] h-auto hidden sm:block z-100";
                if (img === jd) className += " w-[33%] h-auto hidden sm:block";
                if (img === sr) return null;

                return <img key={i} src={img} alt={`Overlay ${i}`} className={className} />;
              })}
            </div>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-3 mt-4">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1650px] mx-auto mt-6">
          {pagedItems.map((item) => {
            const isFavorited = favorites.includes(item.id);
            return (
              <div
                key={item.id}
                className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-6 hover:scale-105 transition-transform duration-300"
                style={{ minHeight: "50px" }}
              >
                <button
                  className="absolute top-4 right-4 transition-colors duration-300"
                  onClick={() => toggleFavorite(item.id)}
                >
                  <FiHeart
                    size={28}
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
                  className="w-full h-[280px] object-contain rounded-xl mb-6"
                />
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 text-center">
                  {item.title}
                </h2>
                <p className="text-red-500 font-semibold mb-4 text-lg sm:text-xl text-center">
                  {item.price}
                </p>
                <div className="w-full flex justify-center mt-2">
                  <button className="flex items-center justify-center bg-red-500 text-white px-6 py-3 rounded-md border-2 border-black hover:bg-red-600 transition-colors">
                    <FiShoppingCart className="text-2xl mr-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-4 mt-6 mb-20">
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
