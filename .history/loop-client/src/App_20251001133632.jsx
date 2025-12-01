// App.js
import React from "react";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div>
      <Navbar />

      {/* push content down so it's not hidden under fixed navbar */}
      <main className="pt-24"> {/* adjust pt-24 if your navbar is taller/shorter */}
        {/* use the same horizontal container as the navbar */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-red-500">
            Welcome to Loop Shop!
          </h1>
        </div>
      </main>
    </div>
  );
}

export default App;
