import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import modelTshirt from "./assets/model-tshirt.png";
import showImage from "./assets/bigbg.png";
import kurt from "./assets/kurt.png";
import coragem from "./assets/coragem.png";
import { FiShoppingCart } from "react-icons/fi";

// Items for the grid
const items = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: modelTshirt,
}));

// Top banner images for carousel
const bannerImages = [showImage, kurt, coragem];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-white pt-[95px]">
        {/* Top Banner with Dots */}
        <div className="relative w-full h-[60vh] sm:h-[60vh] md:h-[60vh] rounded-xl overflow-hidden border-b-4 border-black">
          {/* Banner Image */}
          <img
            src={bannerImages[currentBanner]}
            alt="Banner"
            className="w-full h-full object-cover transition-transform duration-700 ease-in-out"
          />
          
          {/* Optional overlay */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                  idx === currentBanner ? "bg-red-500" : "bg-gray-400"
                }`}
                onClick={() => setCurrentBanner(idx)}
              />
            ))}
          </div>
        </div>

        {/* 4x4 Grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1650px] mx-auto mt-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xl flex flex-col items-center p-6 hover:scale-105 transition-transform duration-300"
              style={{ minHeight: "450px" }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[280px] object-cover rounded-xl mb-6"
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
          ))}
        </div>
      </main>

      <Pagamento />
      <Footer />
    </div>
  );
}

export default App;
