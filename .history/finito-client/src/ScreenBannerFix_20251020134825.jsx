import React, { useEffect, useState } from "react";

export default function Banner() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640); // Tailwind sm breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-b-4 border-black ${
        isMobile ? "h-[50vh]" : "h-[183vh]"
      }`}
    >
      {/* banner content here */}
    </div>
  );
}