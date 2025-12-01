import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Loading() {
  const navigate = useNavigate();

  useEffect(() => {   
    const timer = setTimeout(() => {
      navigate("/perfil"); // or "/" if main page
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loader border-4 border-t-4 border-red-500 border-t-transparent rounded-full w-16 h-16 mx-auto animate-spin"></div>
        <p className="mt-4 text-gray-700 font-bold text-2xl" style={{ fontFamily: "Calibri, sans-serif" }}>
          Carregando...
        </p>
      </div>
    </div>
  );
}
