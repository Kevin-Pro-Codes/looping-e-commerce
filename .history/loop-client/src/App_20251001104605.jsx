import React from "react";
import Navbar from "./Navbar";

function App() {
  return (
    <div>
      <Navbar />
      {/* Your page content */}
      <main className="p-4">
        <h1 className="text-2xl font-bold">Welcome to Loop Shop!</h1>
      </main>
    </div>
  );
}

export default App;
