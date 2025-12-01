import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Banner() {
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640); // Tailwind sm breakpoint
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      router.push("/profile"); // Redirect to /profile
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-b-4 border-black ${
        isMobile ? "h-[50vh]" : "h-[183vh]"
      } flex flex-col items-center justify-center gap-4`}
    >
      {loading && (
        <>
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
          <span className="text-red-600 font-semibold text-lg">Carregando ...</span>
        </>
      )}
    </div>
  );
}
