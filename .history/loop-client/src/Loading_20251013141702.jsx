import React, { useEffect, useState } from "react";

export default function Banner() {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640); // Tailwind sm breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Simulate loading for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-b-4 border-black ${
        isMobile ? "h-[50vh]" : "h-[183vh]"
      } flex items-center justify-center`}
    >
      {loading ? (
        <svg className="w-16 h-16 animate-spin" viewBox="0 0 50 50">
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            stroke="red"
            strokeWidth="5"
            fill="none"
          />
          <circle
            className="opacity-75"
            cx="25"
            cy="25"
            r="20"
            stroke="red"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="100"
            strokeDashoffset="75"
            fill="none"
          />
        </svg>
      ) : (
        <div>
          {/* Your actual banner content goes here */}
          <h1 className="text-center text-2xl font-bold">Banner Loaded!</h1>
        </div>
      )}
    </div>
  );
}
