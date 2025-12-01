import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome";
import Registrar from "./Registrar";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppHome />} />
        <Route path="/registrar" element={<Registrar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
