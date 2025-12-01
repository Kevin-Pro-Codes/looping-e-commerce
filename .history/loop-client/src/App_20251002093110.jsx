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

     

      <Pagamento />
      <Footer />
    </div>
  );
}

export default App;
