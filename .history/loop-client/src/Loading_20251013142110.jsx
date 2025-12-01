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
    }, 20);

    // Navigate after progress completes (~2s)
    const timer = setTimeout(() => {
      navigate("/perfil"); // redirect
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  // Circle settings
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <p className="mb-6 text-gray-700 font-bold text-2xl text-center">
        Carregando...
      </p>

      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          {/* Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="red"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="none"
            className="transition-all duration-100 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-red-500">
          {progress}%
        </div>
      </div>
    </div>
  );
}
