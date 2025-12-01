import React, { useEffect, useState } from "react";

function BannerCarousel({ bannerCombos }) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const fadeDuration = 500;      // fade-out/in duration in ms
    const displayDuration = 1000; // 25 seconds per banner

    let timeoutId;

    const nextBanner = () => {
      setFade(false); // start fade-out

      timeoutId = setTimeout(() => {
        setCurrentBanner(prev => (prev + 1) % bannerCombos.length);
        setFade(true); // fade-in new banner

        // schedule next banner change after full display duration
        timeoutId = setTimeout(nextBanner, displayDuration);
      }, fadeDuration);
    };

    // initial wait for the first banner
    timeoutId = setTimeout(nextBanner, displayDuration);

    return () => clearTimeout(timeoutId); // cleanup
  }, [bannerCombos.length]);

  return (
    <div className={`relative w-full transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
      <img src={bannerCombos[currentBanner].bg} alt="Banner" className="w-full h-full object-cover" />
    </div>
  );
}

export default BannerCarousel;
