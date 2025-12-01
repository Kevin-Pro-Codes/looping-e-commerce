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
         
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
         
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="black"
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



/*

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

////////////////////////////////////////////////////

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
         
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
         
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

*/