import React from "react";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
      <main className="flex items-center justify-center min-h-screen pt-32 px-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-red-500">
          Welcome to Loop Shop!
        </h1>
      </main>
    </div>
  );
}

export default App;
