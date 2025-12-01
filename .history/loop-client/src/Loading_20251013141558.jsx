import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Loading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Increment progress every 20ms
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 10);

    // Navigate after progress completes (~2s)
    const timer = setTimeout(() => {
      navigate("/perfil"); // or "/" for main page
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-3/4 max-w-lg">
        <p
          className="mb-4 text-gray-700 font-bold text-2xl text-center"
          style={{ fontFamily: "Calibri, sans-serif" }}
        >
          Carregando...
        </p>
        <div className="w-full h-6 bg-gray-300 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p
          className="mt-2 text-center font-medium text-gray-600"
          style={{ fontFamily: "Calibri, sans-serif" }}
        >
          {progress}%
        </p>
      </div>
    </div>
  );
}
