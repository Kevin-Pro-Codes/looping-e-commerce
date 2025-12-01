import React from "react";
import Navbar from "./components/Navbar";
import modelTshirt from "./assets/model-tshirt.png";

const items = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: modelTshirt,
}));

function App() {
  return (
    <div>
      <Navbar />

      <main className="pt-32 px-4 bg-gray-100 min-h-screen">
        <h1 className="text-3xl sm:text-5xl font-bold text-red-500 mb-12 text-center">
          Welcome to Loop Shop!
        </h1>

        {/* 4x4 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-[1600px] mx-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-xl flex flex-col items-center p-6 hover:scale-105 transition-transform duration-300"
              style={{ minHeight: "450px" }} // fixed height for consistency
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-80 object-cover rounded-xl mb-6" // bigger image
              />
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-800 text-center">
                {item.title}
              </h2>
              <p className="text-red-500 font-semibold mb-4 text-lg sm:text-xl text-center">
                {item.price}
              </p>
              <button className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors text-lg sm:text-xl">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
