import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppHome from "./AppHome"; // sua página principal (antes era App)
import Registrar from "./pages/Registrar";

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
