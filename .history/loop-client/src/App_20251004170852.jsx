import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome";
import Login from "./Login";
import Registro from "./Registrar";
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
 
            <Route path="/registrar" element={<Registrar />} />
          </Routes>
   
        {/* Footer & Pagamento always visible */}
        <Pagamento />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
