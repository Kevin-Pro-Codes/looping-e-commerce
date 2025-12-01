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

   const [useZoomHeight, setUseZoomHeight] = useState(false);
  const [computedHeightPx, setComputedHeightPx] = useState(null);

  useEffect(() => {
    // parameters you can tune
    const DESKTOP_BREAKPOINT = 1024; // px
    const ZOOM_THRESHOLD = 1.5; // 150% (visualViewport.scale or DPR)
    const MIN_HEIGHT_PX = 400; // minimal pixel height on mobile fallback
    const MAX_HEIGHT_PX = 1200; // cap so it never grows insane

    function checkZoomAndCompute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Desktop guard
      const isDesktop = vw >= DESKTOP_BREAKPOINT;

      // Try visualViewport.scale first (best)
      const scale = (window.visualViewport && window.visualViewport.scale) || 1;

      // devicePixelRatio as fallback (less ideal)
      const dpr = window.devicePixelRatio || 1;

      // Outer/inner fallback (least reliable)
      const ratio = (window.outerWidth && window.innerWidth) ? (window.outerWidth / window.innerWidth) : 1;

      // Determine zoom factor using best available metric
      const zoomFactor = scale || dpr || ratio;

      const zoomed = isDesktop && (zoomFactor >= ZOOM_THRESHOLD || dpr >= ZOOM_THRESHOLD || ratio >= ZOOM_THRESHOLD);

      if (zoomed) {
        // compute a pixel height rather than a VH value
        // (1.83 is your desired multiplier for "183vh" concept)
        const rawPx = Math.round(vh * 1.83);

        // clamp to sensible min/max
        const clampedPx = Math.max(MIN_HEIGHT_PX, Math.min(MAX_HEIGHT_PX, rawPx));

        setComputedHeightPx(clampedPx);
        setUseZoomHeight(true);
      } else {
        setComputedHeightPx(null);
        setUseZoomHeight(false);
      }
    }

    // initial run
    checkZoomAndCompute();

    // listen to changes
    window.addEventListener("resize", checkZoomAndCompute);

    // visualViewport can emit a resize/scroll event when zoom changes
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", checkZoomAndCompute);
      window.visualViewport.addEventListener("scroll", checkZoomAndCompute);
    }

    // clean up
    return () => {
      window.removeEventListener("resize", checkZoomAndCompute);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", checkZoomAndCompute);
        window.visualViewport.removeEventListener("scroll", checkZoomAndCompute);
      }
    };
  }, []);

  // If useZoomHeight true, we apply inline style height = computedHeightPx px
  // otherwise we fall back to your responsive Tailwind classes
  const inlineStyle = useZoomHeight && computedHeightPx ? { height: `${computedHeightPx}px` } : undefined;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-white pt-[110px] lg:pt-[95px]">
        {/* Banner Carousel */}
       
      <div
      // keep your responsive fallback classes but DO NOT use h-[183vh] here.
      // We apply a safe default mobile-first class, and override with inline style when zoomed on desktop.
      className={`relative w-full rounded-xl overflow-hidden border-b-4 border-black 
        h-[50vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh]`}
      style={inlineStyle}
    >

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
    ${bannerCombos[currentBanner].bg === tyler ? "object-contain object-bottom top-10 w-[60%] sm:w-[50%] md:w-[30%] mx-auto p-6"  : ""}
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
  className="
    absolute
    -top-5         /* default: very top on smallest screens */
    xs:-top-4       /* extra small screens */
    sm:top-2      /* small screens */
    md:-top-0      /* medium screens */
    lg:-top-1      /* large screens */
    xl:-top-2     /* extra large screens */
    2xl:-top-3     /* 2xl screens */
    left-1/2
    transform -translate-x-1/2
    w-[60%] sm:w-[50%]
    h-auto
    z-10
  "
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
        <div className="flex justify-center space-x-3 mt-7 mb-7">
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-1 p-1 w-full max-w-[1400px] mx-auto mt-6">
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
