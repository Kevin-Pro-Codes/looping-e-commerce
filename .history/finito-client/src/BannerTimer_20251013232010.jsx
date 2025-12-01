import React, { useEffect, useState } from "react";

function BannerTimer({ bannerCombos }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const displayDuration = 5000; // 25 seconds per banner
    const fadeDuration = 500;      // match your CSS transition

    let timeoutId;

    const changeBanner = () => {
      setFade(false); // start fade-out
      timeoutId = setTimeout(() => {
        setCurrentBanner(prev => (prev + 1) % bannerCombos.length);
        setFade(true); // fade-in
        timeoutId = setTimeout(changeBanner, displayDuration);
      }, fadeDuration);
    };

    // start first timeout
    timeoutId = setTimeout(changeBanner, displayDuration);

    return () => clearTimeout(timeoutId);
  }, [bannerCombos.length]);

  return (
    <div className={`relative w-full transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
      <img src={bannerCombos[currentBanner].bg} alt="Banner" className="w-full h-full object-cover" />
    </div>
  );
}

export default BannerTimer;
