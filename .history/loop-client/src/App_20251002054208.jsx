import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import modelTshirt from "./assets/model-tshirt.png";
import showImage from "./assets/bigbg.png";
import kurt from "./assets/kurt.png";
import coragem from "./assets/coragem.png";
import { FiShoppingCart } from "react-icons/fi"; 

const items = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: modelTshirt,
}));

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-white pt-[120px] ">
        {/* Banner image on top */}
        <div className="w-full mt-1 mb-5">
<div className="relative w-full">
  {/* Background image */}
  <img
    src={showImage}
    alt="Shop Banner"
    className="w-full h-[350px] md:h-[700px] object-cover rounded-xl opacity-36"
  />


 {/* Kurt image overlay */}
<img
  src={kurt}
  alt="Kurt"
  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[200px] md:w-[300px] object-contain"
/>

<img
  src={coragem}
  alt="Coragem"
  className="absolute bottom-10 right-4 md:right-10 w-[300px] md:w-[400px] object-contain"
/>



</div>

</div>


        {/* 4x4 grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1200px] mx-auto mb-60">
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
