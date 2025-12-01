import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import modelTshirt from "./assets/model-tshirt.png";
import showImage from "./assets/bigbg.png";
import kurt from "./assets/kurt.png";
import rnr from "./assets/rnr.png"; 
import slip from "./assets/slip.png";
import jd from "./assets/jd.png";
import tyler from "./assets/fclub.png";
import krusty from "./assets/krusty.png";
import { FiHeart, FiShoppingCart } from "react-icons/fi";


const items = Array.from({ length: 80 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: modelTshirt,
}));

const bannerCombos = [
  { bg: showImage, overlay: [kurt, slip, jd], animated: true }, 
  { bg: krusty, overlay: null },
  { bg: tyler, overlay: null }
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
   <div
  className="
    relative w-full 
    h-[60vh]        /* default: mobile */
    sm:h-[50vh]      /* small devices ≥640px */
    md:h-[70vh]      /* medium devices ≥768px */
    lg:h-[60vh]      /* large devices ≥1024px */
    xl:h-[55vh]      /* extra-large devices ≥1280px */
    2xl:h-[50vh]     /* ultra-large devices ≥1536px */
    rounded-xl overflow-hidden border-b-4 border-black
  "
>


<img
  src={bannerCombos[currentBanner].bg}
  alt="Shop Banner"
  className={`w-full h-full transition-transform duration-700 ease-in-out ${
    bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
  } ${
   bannerCombos[currentBanner].bg === krusty
    ? "object-cover sm:object-contain"

      : bannerCombos[currentBanner].bg === tyler
      ? "object-cover sm:object-contain"  
        
      : bannerCombos[currentBanner].bg === showImage
      ? "object-cover opacity-70"          
      : "object-cover opacity-90" 
      
  }`}
 style={
  bannerCombos[currentBanner].bg === krusty
    ? { objectPosition: "center top", backgroundColor: "white" }
    : bannerCombos[currentBanner].bg === tyler
    ? { objectPosition: "center center" }
    : bannerCombos[currentBanner].bg === showImage
    ? { objectPosition: "40% 99%" } // 40% horizontal (slightly left), 90% vertical
    : { objectPosition: "center top" }
}
/>


{/* Overlay */}
{Array.isArray(bannerCombos[currentBanner].overlay) ? (
  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex items-end justify-center space-x-4">
    {bannerCombos[currentBanner].overlay.map((img, i) => {
      let className = "object-contain";
      let style = {};

      if (img === slip) {
        // Keep slip sizing as before
        className += " w-[90%] sm:w-[40%] h-auto scale-170 sm:scale-100";
        style.transformOrigin = "bottom center"; // anchor bottom

        return (
          <div key={i} className="relative flex flex-col items-center">
            {/* Logo above slip */}
            <img
              src={rnr}
              alt="Logo"
              className="absolute -top-12 sm:-top-16 w-20 sm:w-24 object-contain z-10"
            />
            {/* Slip image */}
            <img src={img} alt={`Overlay ${i}`} className={className} style={style} />
          </div>
        );
      } else {
        className += " hidden sm:block";
        if (img === kurt) className += " w-[36%] h-auto";
        if (img === jd) className += " w-[33%] h-auto";

        return <img key={i} src={img} alt={`Overlay ${i}`} className={className} style={style} />;
      }
    })}
  </div>
) : null}








          {/* Dots */}
         <div className="absolute bottom-4 left-1/2 transform pl-3 -translate-x-1/2 flex space-x-3">
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

        </div>


        {/* Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1650px] mx-auto mt-6">
          
          {pagedItems.map((item) => {
            const isFavorited = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-6 hover:scale-105 transition-transform duration-300"
                style={{ minHeight: "450px" }}
              >
                {/* Heart */}
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

      <Pagamento />
      <Footer />
    </div>
  );
}

export default App;
