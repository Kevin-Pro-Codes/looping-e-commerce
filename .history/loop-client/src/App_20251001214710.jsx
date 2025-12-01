import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import modelTshirt from "./assets/model-tshirt.png";

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

      {/* Main content grows to fill remaining space */}
      <main className="flex-1 bg-white pt-[100px] px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-red-500 mb-12 text-center">
          Bem-vindo à Loop Shop
        </h1>

        {/* 4x4 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-[1600px] mx-auto">
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

      <Footer />
    </div>
  );
}

export default App;
