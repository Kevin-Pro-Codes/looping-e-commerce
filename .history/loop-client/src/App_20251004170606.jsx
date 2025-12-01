import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome";
import Registrar from "./Registro";
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
        
          <Routes>
            <Route path="/" element={<AppHome />} />
             <Route path="/registrar" element={<Login />} />
            <Route path="/registrar" element={<Registro />} />
          </Routes>
   
        {/* Footer & Pagamento always visible */}
        <Pagamento />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
