import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";
import modelTshirt from "./assets/model-tshirt.png";
import showImage from "./assets/show.jpg"; // Import your banner image

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

      <main className="flex-1 bg-white pt-[120px] px-4">
        {/* Banner image on top */}
        <div className="w-full mb-12">
          <img
            src={showImage}
            alt="Shop Banner"
            className="w-full h-[150px] object-cover rounded-xl"
          />
        </div>

        {/* 4x4 grid of items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-[1200px] mx-auto">
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
              <button className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors text-lg sm:text-xl">
                Adicionar ao Carrinho
              </button>
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
