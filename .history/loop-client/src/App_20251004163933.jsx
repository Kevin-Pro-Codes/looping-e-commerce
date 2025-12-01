import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome";
import Registrar from "./Registrar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Pagamento from "./components/Pagamento";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        {/* Navbar always visible */}
        <Navbar />

        {/* Main content */}
        <div className="flex-1 pt-[130px] lg:pt-[95px]">
          <Routes>
            <Route path="/" element={<AppHome />} />
            <Route path="/registrar" element={<Registrar />} />
          </Routes>
        </div>

        {/* Footer & Pagamento always visible */}
        <Pagamento />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
