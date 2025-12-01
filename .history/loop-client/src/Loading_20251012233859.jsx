import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Loading() {
  const navigate = useNavigate();
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500);

    // Navigate after 1.5s
    const timer = setTimeout(() => {
      navigate("/perfil"); // or "/" if main page
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(dotsInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loader border-4 border-t-4 border-red-500 border-t-transparent rounded-full w-16 h-16 mx-auto animate-spin"></div>
        <p
          className="mt-4 text-gray-700 font-bold text-2xl"
          style={{ fontFamily: "Calibri, sans-serif" }}
        >
          Carregando{dots}
        </p>
      </div>
    </div>
  );
}
