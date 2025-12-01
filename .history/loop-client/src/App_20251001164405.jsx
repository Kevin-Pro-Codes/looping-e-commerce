import React from "react";
import Navbar from "./components/Navbar";

// Sample data for 16 items
const items = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  price: `$${(Math.random() * 100 + 10).toFixed(2)}`,
  image: `https://via.placeholder.com/200?text=Item+${i + 1}`, // Placeholder image
}));

function App() {
  return (
    <div>
      <Navbar />

      {/* Page content */}
      <main className="pt-32 px-4 bg-gray-100 min-h-screen">
        <h1 className="text-2xl sm:text-4xl font-bold text-red-500 mb-8 text-center">
         
        </h1>

        {/* 4x4 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:scale-105 transition-transform duration-300"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h2 className="text-lg font-bold mb-2 text-gray-800">
                {item.title}
              </h2>
              <p className="text-red-500 font-semibold mb-4">{item.price}</p>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
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
