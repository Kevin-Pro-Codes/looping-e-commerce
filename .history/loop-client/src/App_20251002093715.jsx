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

      <main className="flex-1 bg-white pt-[95px] ">
        {/* Banner image on top */}

<div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[50vh] rounded-xl overflow-hidden"

  style={{
    borderBottom: '4px solid black',   // solid black outline
    borderRadius: '3px',        // optional, to match container's rounded corners
    boxSizing: 'border-box'      // ensures border doesn't affect layout
  }}
 >

{/* Background image */}
<img
  src={showImage}
  alt="Shop Banner"
  className="w-full h-full object-cover animate-scaleSlow opacity-50"
 
/>

  {/* Gradient overlay */}
  <div
    className="absolute inset-0"
    /*style={{
      background: `
        linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%, rgba(255,255,255,0) 90%, rgba(255,255,255,1) 100%)
      `
    }}
    */
  />

  {/* Kurt image */}
  <img
    src={kurt}
    alt="Kurt"
    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[35%] sm:w-[20%] md:w-[14%] object-contain animate-scaleSlow"
    style={{ maxHeight: '80%' }}
  />
</div>



{/*
<img
  src={coragem}
  alt="Coragem"
  className="absolute bottom-[15%] right-[5%] w-[40%] sm:w-[18%] md:w-[17%] object-contain"
/>
*/}





        {/* 4x4 grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1650px] mx-auto mt-3 mb-60">
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
