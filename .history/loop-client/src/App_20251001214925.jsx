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
    <div>
      <Navbar />

     
      <Footer />
    </div>
     
  );
}

export default App;
