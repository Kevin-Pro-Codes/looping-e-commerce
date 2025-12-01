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
    const timer = setTimeout(() => setLoading(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-b-4 border-black ${
        isMobile ? "h-[50vh]" : "h-[183vh]"
      } flex items-center justify-center`}
    >
      {loading ? (
        <div className="w-16 h-16 border-4 border-t-black border-gray-300 rounded-full animate-spin"></div>
      ) : (
        <div>
          {/* Your actual banner content goes here */}
          <h1 className="text-center text-2xl font-bold">Banner Loaded!</h1>
        </div>
      )}
    </div>
  );
}
