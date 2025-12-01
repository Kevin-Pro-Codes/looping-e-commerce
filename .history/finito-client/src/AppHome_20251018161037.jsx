import React, { useEffect, useState } from "react";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import modelTshirt from "./assets/model-tshirt.png";
import showImage from "./assets/bigbg.png";
import kt from "./assets/kurt.png";
import rnr from "./assets/rnr.png";
import onebanner from "./assets/10.png";
import sl from "./assets/slip.png";
import jd from "./assets/jd.png";
import fclub from "./assets/fclub.png";
import ks from "./assets/krusty.png";
import coldSymbol from "./assets/cold.png";
import py from "./assets/python.gif";
import BannerTimer from "./BannerTimer";
import Products from './Products';

const bannerCombos = [
  { bg: showImage, overlay: [kt, onebanner, sl, jd], animated: true },
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
    const bannerDuration = 918.15;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerCombos.length);
    }, bannerDuration * 1000);
  
    return () => clearInterval(interval);
  }, [bannerCombos.length]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-white pt-[calc(var(--navbar-height,6.4rem)+env(safe-area-inset-top))]">

        {/* Centered Banner Container - Viewport-based sizing */}
        <div className="flex justify-center items-center p-1 mt-1 sm:mt-2 md:mt-3">
          <div className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white w-[95vw] max-w-[1400px] h-[35vh] min-h-[300px] sm:h-[40vh] md:h-[45vh] lg:h-[50vh]">
            {/* Banner Content */}
            {currentBanner === 1 ? (
              <div className="absolute inset-0 w-full h-full">
                {(() => {
                  const symbols = [];
                  const placed = [];
                  for (let i = 0; i < 72; i++) {
                    let valid = false,
                      topPx,
                      leftPx,
                      size,
                      attempts = 0;
                    while (!valid && attempts < 200) {
                      size = 30 + Math.random() * 40;
                      leftPx = Math.random() * 999;
                      topPx = Math.random() * 499;
                      valid = !placed.some(
                        (p) =>
                          Math.sqrt((p.left - leftPx) ** 2 + (p.top - topPx) ** 2) <
                          (p.size + size) * 0.6
                      );
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
                          top: `${(topPx / 500) * 100}%`,
                          left: `${(leftPx / 1000) * 100}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`
                        }}
                      />
                    );
                  }
                  return symbols;
                })()}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-1"
                />
              </div>
            ) : currentBanner === 0 ? (
              // SPECIAL LAYOUT FOR showImage BANNER - Full background layout
              <div className="absolute inset-0 w-full h-full">
                {/* Background Image - Fills entire container */}
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                
                {/* Overlay Images - Viewport-based scaling */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end justify-between w-full px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12">
                  {/* KT - Left */}
                  <div className="hidden md:flex justify-center items-end flex-1">
                    <div className="relative scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-[1.0] mb-1 md:mb-2 lg:mb-3"
                         style={{ transformOrigin: "bottom center" }}>
                      <img 
                        src={kt} 
                        alt="Kurt" 
                        className="w-full h-auto object-contain max-h-[20vh]" 
                      />
                    </div>
                  </div>
                  
                  {/* SL with onebanner - Center */}
                  <div className="flex justify-center items-end flex-1 mx-1 sm:mx-1 md:mx-2">
                    <div
                      className="relative scale-[0.5] sm:scale-[0.6] md:scale-[0.7] lg:scale-[0.8] xl:scale-[0.9] mb-1 md:mb-2 lg:mb-3"
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <img
                        src={onebanner}
                        alt="onebanner"
                        className="absolute left-1/2 w-[45%] sm:w-[50%] md:w-[55%] lg:w-[60%] h-auto z-10"
                        style={{ 
                          top: "-6%", 
                          transform: "translateX(-50%)" 
                        }}
                      />
                      <img 
                        src={sl} 
                        alt="Slip" 
                        className="w-full h-auto object-contain max-h-[20vh]" 
                      />
                    </div>
                  </div>
                  
                  {/* JD - Right */}
                  <div className="hidden md:flex justify-center items-end flex-1">
                    <div className="relative scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] xl:scale-[0.95] mb-1 md:mb-2 lg:mb-3"
                         style={{ transformOrigin: "bottom center" }}>
                      <img 
                        src={jd} 
                        alt="JD" 
                        className="w-full h-auto object-contain max-h-[20vh]" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // DEFAULT LAYOUT FOR OTHER BANNERS - Minimal padding
              <div className="relative w-full h-full flex justify-center items-center p-1 sm:p-2">
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

        {/* Dots - Minimal spacing */}
        <div className="flex justify-center space-x-2 mt-3 mb-3">
          {bannerCombos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full border-2 border-black transition-colors duration-300 ${
                idx === currentBanner ? "bg-red-500" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        <Products />
       
        {/* Dynamic Grid of Products - Minimal top spacing */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 p-1 w-full max-w-[1400px] mx-auto mt-3">
          {pagedItems.map((product) => {
            const isFavorited = favorites.includes(product._id);
            return (
              <div
                key={product._id}
                className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black duration-300"
              >
                <button
                  className="absolute top-3 right-3 transition-colors duration-300"
                  onClick={() => toggleFavorite(product._id)}
                >
                  <FiHeart
                    size={24}
                    style={{
                      stroke: "black",
                      strokeWidth: 1.5,
                      fill: isFavorited ? "red" : "none"
                    }}
                  />
                </button>

                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-auto max-h-[220px] object-contain rounded-xl mb-3"
                />
                <h2 className="text-lg sm:text-xl font-bold mb-1 text-gray-800 text-center">
                  {product.title}
                </h2>
                <p className="text-red-500 font-semibold text-md sm:text-lg text-center">
                  ${product.price}
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

        {/* Pagination - Minimal top spacing */}
        <div className="flex justify-center space-x-2 mt-3 mb-12">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-2 py-1 rounded-full border-2 border-black transition-colors ${
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