import React from "react";

import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
      <main className="p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">
  Welcome to Loop Shop!
</h1>

      </main>
    </div>
  );
}

export default App;
