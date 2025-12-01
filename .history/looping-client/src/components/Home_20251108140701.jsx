import React, { useEffect, useState } from "react";
// Removed react-icons/fi and react-icons/fa imports to fix the compilation error.

// --- INLINE SVG ICON COMPONENTS ---
const WhatsappIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M380.9 97.1C339.4 55.4 283.4 32 223.7 32c-122.4 0-221.7 99.3-221.7 221.7 0 39.2 10.5 77.1 30.2 111.4L6 480l113.8-30.7c31.4 17 66.4 26 102.2 26h.1c122.4 0 221.7-99.3 221.7-221.7 0-60.5-23.4-116.5-65.7-158.8zM223.7 448h-.1c-31.5 0-61.9-8.7-88.3-25.1L46.6 464 88.1 340.9c-20.8-35.1-32-76-32-117.3C56.1 120.3 131.5 45 223.7 45c44.2 0 85.1 17.2 116.3 48.5 31.3 31.3 48.5 72.2 48.5 116.3 0 92.2-75.4 167.7-167.7 167.7zm116.8-150.3c-2.8-1.4-16.7-8.2-19.3-9.1-2.7-.9-4.7-1.4-6.6 1.4-1.8 2.8-7.2 9.1-8.8 10.9-1.5 1.8-3 2-5.6.7-2.7-1.3-11.4-4.2-21.7-13.3-8.3-7.1-13.9-15.8-15.5-18.7-1.6-2.8-.2-4.2 1.2-5.5 1.2-1.2 2.7-3.2 4.1-4.8 1.4-1.6 1.8-2.8.9-4.5-.9-1.5-6.6-17.5-9-23.9-2.3-6.2-4.7-5.3-6.6-5.4-1.8-.1-4-.1-6.1-.1-2.1 0-5.6.8-8.6 3.8-3 3-11.4 11.1-11.4 27.2 0 16.1 11.7 31.5 13.3 33.3 1.5 1.8 23.3 35.5 56.4 48.7 7.7 3 13.8 4.8 18.6 6.1 7.4 2 14.1 1.3 19.4.8 5.8-.6 16.7-6.8 19-13.7 2.3-7 2.3-12.9 1.6-13.7-1.6-1.5-2.7-2.4-5.6-3.8z"/>
  </svg>
);
const InstagramIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224.1 179.7c-24.3 0-44 19.7-44 44s19.7 44 44 44 44-19.7 44-44-19.7-44-44-44zm115.3 62.5c0-14.7-11.9-26.6-26.6-26.6-14.7 0-26.6 11.9-26.6 26.6s11.9 26.6 26.6 26.6 26.6-11.9 26.6-26.6zm-171.7 42.6c1.1 0 2.2-.1 3.3-.2 46.5-4.4 83.2-41.2 87.6-87.6.1-1.1.2-2.2.2-3.3v-1.1c0-48.4-39.4-87.7-87.7-87.7s-87.7 39.3-87.7 87.7c0 48.3 39.3 87.6 87.7 87.7zM224 32c52.3 0 102.7 11.4 147.2 33.1 44.4 21.8 79.9 56.7 101.5 101.1 21.6 44.5 33.3 94.9 33.3 147.2s-11.7 102.7-33.3 147.2c-21.6 44.4-57.1 79.3-101.5 101.1C326.7 480.6 276.3 492 224 492s-102.7-11.4-147.2-33.1C32.4 437.1-2.9 402.2-24.5 357.8-46.1 313.3-57.8 262.9-57.8 210.6s11.7-102.7 33.3-147.2C54.7 35.1 90.2.2 134.6-21.6 179.1-43.3 229.5-54.7 281.8-54.7c52.3 0 102.7 11.4 147.2 33.1 44.4 21.8 79.9 56.7 101.5 101.1 21.6 44.5 33.3 94.9 33.3 147.2s-11.7 102.7-33.3 147.2c-21.6 44.4-57.1 79.3-101.5 101.1-44.5 21.8-94.9 33.5-147.2 33.5s-102.7-11.7-147.2-33.3c-44.4-21.6-79.9-56.5-101.5-101.1-21.6-44.5-33.3-94.9-33.3-147.2zM224 32c-48.4 0-93.5 10.9-133.5 31.8-40 21-72.7 51.6-93.7 91.6-21 40-31.8 85.1-31.8 133.5s10.9 93.5 31.8 133.5c20.9 40 53.6 70.6 93.7 91.6 40 21 85.1 31.8 133.5 31.8s93.5-10.9 133.5-31.8c40-21 72.7-51.6 93.7-91.6 21-40 31.8-85.1 31.8-133.5s-10.9-93.5-31.8-133.5c-20.9-40-53.6-70.6-93.7-91.6C317.5 42.9 272.4 32 224 32zm0 88c-44.2 0-80 35.8-80 80s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80zm0 136c-30.9 0-56-25.1-56-56s25.1-56 56-56 56 25.1 56 56-25.1 56-56 56zm96-128c0 8.8-7.2 16-16 16s-16-7.2-16-16 7.2-16 16-16 16 7.2 16 16z"/>
  </svg>
);
const FacebookIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.7 85.2 226.4 199.1 247.2V376h-54.8c-2.3 0-4.5-1.9-4.5-4.2V327.9c0-2.3 2.2-4.2 4.5-4.2h54.8v-39c0-57.9 35.3-90 87.5-90 25.1 0 49.3 1.8 56 2.6V227c-6.7-.8-23.7-3.7-44.9-3.7-22 0-37 13.5-37 36.9v28.8h56.8c2.5 0 4.5 1.9 4.5 4.2v43.9c0 2.3-2 4.2-4.5 4.2h-56.8v127.3c113.9-20.8 199.1-123.5 199.1-247.2z"/>
  </svg>
);
// --- END INLINE SVG ICON COMPONENTS ---


// Mock Imports - replace with your actual components/assets in a real project
// FIX 1: Changed h-[6.4rem] to fixed h-[102.4px] to prevent Navbar height from scaling on zoom.
const Navbar = () => <div className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50 h-[102.4px] flex items-center justify-center shadow-lg">Navbar Placeholder</div>;
const Products = () => <div className="p-8 text-center bg-gray-50">Products Listing Placeholder</div>;
const showImage = "https://placehold.co/1200x500/000000/FFFFFF?text=Background+Image";
const kt = "https://placehold.co/100x300/e84393/FFFFFF?text=Kurt";
const rockBanner = "https://placehold.co/300x100/2d3436/FFFFFF?text=ROCK+N+ROLL";
const ch = "https://placehold.co/100x300/6c5ce7/FFFFFF?text=Chad";
const jd = "https://placehold.co/100x300/0984e3/FFFFFF?text=JD";
const fclub = "https://placehold.co/1200x500/fdcb6e/000000?text=F+CLUB";
const bt = "https://placehold.co/1200x500/f1c40f/000000?text=Bart";
const hotSymbol = "https://placehold.co/20x20/ff7675/FFFFFF?text=HOT";
const ks = "https://placehold.co/1200x500/7f8c8d/FFFFFF?text=Krusty";
const coldSymbol = "https://placehold.co/20x20/00cec9/FFFFFF?text=COLD";
const py = "https://placehold.co/1200x500/2ecc71/FFFFFF?text=PYTHON+GIF";
const finitoBanner = "https://placehold.co/600x400/3498db/FFFFFF?text=Finito+Logo+Banner";
const finitoAd = "https://placehold.co/600x400/e74c3c/FFFFFF?text=Finito+Ad+Promo";
const logo = "https://placehold.co/300x150/000000/FFFFFF?text=FINITO+LOGO";
const mnq = "https://placehold.co/1200x500/9b59b6/FFFFFF?text=Design+Pattern";


// REORDERED bannerCombos array - Python RIGHT AFTER FClub
const bannerCombos = [
  { bg: finitoBanner, overlay: null }, // 0 - Finito Banner
  { bg: showImage, overlay: [kt, rockBanner, ch, jd], animated: true }, // 1 - Show Image Banner (Targeted for fix)
  { bg: "promo", overlay: null, promo: true }, // 2 - "Leve 4 Pague 3" banner
  { bg: bt, overlay: hotSymbol, symbolType: "hot" }, // 3 - Bart with hot symbols
  { bg: ks, overlay: coldSymbol, symbolType: "cold" }, // 4 - Krusty with cold symbols
  { bg: fclub, overlay: null }, // 5 - FClub banner
  { bg: py, overlay: null }, // 6 - Python banner (IMMEDIATELY AFTER FCLUB)
  { bg: "cupons", overlay: null, cupons: true }, // 7 - "CUPONS DE DESCONTO" banner
  { bg: "black", overlay: null, logo: true }, // 8 - Logo banner
  { bg: "designs", overlay: null, designs: true } // 9 - "MAIS DE 500 DESIGNS" banner
];

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState(Array(24).fill({ id: 1 })); // Mock data

  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  // const pagedItems is not used in the render function provided but kept for context.
  // const pagedItems = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );

  useEffect(() => {
    const bannerDuration = 18.15;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerCombos.length);
    }, bannerDuration * 1000);

    return () => clearInterval(interval);
  }, [bannerCombos.length]);

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    const phoneNumber = "5511999999999";
    const message = "Olá! Gostaria de mais informações sobre os produtos.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Instagram click handler
  const handleInstagramClick = () => {
    const instagramUrl = "https://instagram.com/finito.official";
    window.open(instagramUrl, '_blank');
  };

  // Facebook click handler
  const handleFacebookClick = () => {
    const facebookUrl = "https://facebook.com/finito.official";
    window.open(facebookUrl, '_blank');
  };

  // Function to generate floating symbols
  const generateFloatingSymbols = (symbolType) => {
    const symbolSrc = symbolType === "hot" ? hotSymbol : coldSymbol;
    const symbols = [];
    const placed = [];
    const cols = 8;
    const rows = 5;
    const cellWidth = 1000 / cols;
    const cellHeight = 500 / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() < 0.4) continue;
        const size = 20 + Math.random() * 20;
        const leftPx =
          col * cellWidth +
          cellWidth * 0.2 +
          Math.random() * (cellWidth * 0.6);
        const topPx =
          row * cellHeight +
          cellHeight * 0.2 +
          Math.random() * (cellHeight * 0.6);
        placed.push({ top: topPx, left: leftPx, size });
        symbols.push(
          <img
            key={`${row}-${col}`}
            src={symbolSrc}
            alt={symbolType === "hot" ? "Hot" : "Cold"}
            className="absolute opacity-65"
            style={{
              top: `${(topPx / 500) * 100}%`,
              left: `${(leftPx / 1000) * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              transform: `translate(-50%, -50%) rotate(${
                Math.random() * 360
              }deg)`,
              zIndex: 1
            }}
          />
        );
      }
    }
    return symbols;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* FIX: Simplified pt to fixed px only, matching Navbar height, to prevent zoom-based scaling issues. */}
      <main className="flex-1 bg-white pt-[102.4px]">

        {/* Outer container: No vertical padding to prevent zoom scaling */}
        <div className="flex justify-center items-center px-4">
          <div 
            className="relative rounded-xl overflow-hidden border-4 border-black shadow-2xl bg-white max-w-[95%] w-[87.5rem] h-[30vh] md:h-[40vh] lg:h-[45vh]"
            style={{ minHeight: '300px' }} // Added min-height fallback
          >
            
            {/* Banner Content */}
            {currentBanner === 2 ? ( // "Leve 4 Pague 3" Promo Banner - CALIBRI
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-600 via-red-500 to-red-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8">
                  {/* Main Promo Text */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      LEVE 4
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-yellow-300 mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      PAGUE 3
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="text-center">
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      PROMOÇÃO ESPECIAL
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white opacity-90" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Em todas as camisetas!
                    </p>
                  </div>
                </div>
              </div>
            ) : currentBanner === 7 ? ( // "CUPONS DE DESCONTO" Banner - CALIBRI
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-green-600 via-green-500 to-green-700 flex items-center justify-center">
                <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8">
                  {/* Main Title */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      CUPONS DE
                    </h1>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-yellow-300 mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      DESCONTO
                    </h2>
                  </div>
                  
                  {/* Promo Details */}
                  <div className="text-center mb-3 sm:mb-4 md:mb-6">
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      ATÉ 50% OFF
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white opacity-90 font-semibold" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Em toda a loja!
                    </p>
                  </div>

                  {/* Additional Info */}
                  <div className="text-center">
                    <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white opacity-90" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Use o código: <span className="font-bold text-yellow-300">FINITO50</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : currentBanner === 8 ? ( // Logo banner
              <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                <div className="relative flex justify-center items-center w-full h-full">
                  <img
                    src={logo}
                    alt="Finito Logo"
                    className="object-contain 
                      w-[85%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[65%]
                      h-auto max-h-[80%] sm:max-h-[85%] md:max-h-[90%]
                      transition-transform duration-500 ease-out
                      hover:scale-[1.02]"
                    style={{ 
                      objectFit: "contain",
                      objectPosition: "center center"
                    }}
                  />
                </div>
              </div>
            ) : currentBanner === 9 ? ( // "MAIS DE 500 DESIGNS" Banner with horizontally stretched background
              <div className="absolute inset-0 w-full h-full">
                {/* Background stretched horizontally with up/down movement */}
                <img
                  src={mnq}
                  alt="Background Pattern"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                  style={{
                    animation: 'containedBounce 8s ease-in-out infinite',
                    objectPosition: 'center center'
                  }}
                />
                
                {/* Content Container */}
                <div className="relative flex flex-col items-center justify-center w-full h-full p-4 sm:p-6 md:p-8 z-10">
                  {/* Main Title */}
                  <div className="text-center mb-3 sm:mb-4 md:mb-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-black mb-2 sm:mb-3 md:mb-4 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      MAIS DE
                    </h1>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-red-600 mb-3 sm:mb-4 md:mb-6 leading-tight" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      500 DESIGNS
                    </h2>
                  </div>
                  
                  {/* Subtitle */}
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-2 sm:mb-3 md:mb-4" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      VARIEDADE E QUALIDADE
                    </p>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-800 font-semibold" style={{ fontFamily: 'Calibri, sans-serif' }}>
                      Para todos os gostos!
                    </p>
                  </div>
                </div>
              </div>
              
            ) : currentBanner === 1 ? ( // showImage BANNER - REMOVED ALL SCALES FOR STABILITY
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={showImage}
                  alt="Banner Background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 animate-scaleSlow"
                />

                {/* MOBILE LAYOUT - FIX 2: Removed transform scales */}
                <div className="md:hidden absolute inset-0 flex flex-col items-end justify-center pb-2 px-2">
                  <div className="relative w-full flex justify-center mb-1">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="object-contain max-h-[80px] z-10"
                      style={{}} // Removed transform: "scale(1.1)"
                    />
                  </div>
                  
                  <div className="relative w-full flex justify-center">
                    <img
                      src={ch}
                      alt="Chad"
                      className="object-contain max-h-[220px]"
                      style={{}} // Removed transform: "scale(1.05)"
                    />
                  </div>
                </div>

                {/* DESKTOP LAYOUT - SCALES ALREADY REMOVED */}
                <div className="hidden md:flex absolute inset-0 items-end justify-between px-4 md:px-8 lg:px-12 xl:px-16 pb-2">
                  {/* KT - Left */}
                  <div className="flex-1 flex justify-center items-end h-full">
                    <img
                      src={kt}
                      alt="Kurt"
                      className="w-full h-full object-contain" 
                      style={{}} 
                    />
                  </div>

                  {/* CH with rockBanner - Center */}
                  <div className="flex-1 flex flex-col justify-end items-center h-full mx-2 md:mx-4">
                    <img
                      src={rockBanner}
                      alt="rockBanner"
                      className="max-h-[80px] object-contain z-10 mb-1"
                      style={{}}
                    />
                    <img
                      src={ch}
                      alt="Chad"
                      className="w-full h-full object-contain" 
                      style={{}}
                    />
                  </div>

                  {/* JD - Right */}
                  <div className="flex-1 flex justify-center items-end h-full">
                    <img
                      src={jd}
                      alt="JD"
                      className="w-full h-full object-contain" 
                      style={{}}
                    />
                  </div>
                </div>
              </div>
            ) : currentBanner === 3 ? ( // Bart with hot symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("hot")}
                <img
                  src={bt}
                  alt="Bart"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                />
              </div>
            ) : currentBanner === 4 ? ( // Krusty with cold symbols banner
              <div className="absolute inset-0 w-full h-full">
                {generateFloatingSymbols("cold")}
                <img
                  src={ks}
                  alt="Krusty"
                  className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                  style={{
                    transform: "scale(1.1)"
                  }}
                />
              </div>
            ) : currentBanner === 5 ? ( // FCLUB BANNER WITH INSTAGRAM AND FACEBOOK
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                <div className="relative w-full h-full flex justify-center items-center">
                  <img
                    src={fclub}
                    alt="F Club"
                    className="object-contain w-[90%] h-[90%]"
                  />
                  
                  {/* Social Media Icons Container */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Instagram - Left Side */}
                    <button
                      onClick={handleInstagramClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-110
                                 left-[10%] top-[15%]
                                 sm:left-[12%] sm:top-[18%]
                                 md:left-[15%] md:top-[20%]
                                 lg:left-[18%] lg:top-[22%]"
                      aria-label="Follow us on Instagram"
                    >
                      <InstagramIcon className="text-pink-600 size-12 sm:size-14 md:size-16 lg:size-18 xl:size-20" />
                    </button>

                    {/* Facebook - Right Side */}
                    <button
                      onClick={handleFacebookClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-110
                                 right-[10%] top-[15%]
                                 sm:right-[12%] sm:top-[18%]
                                 md:right-[15%] md:top-[20%]
                                 lg:right-[18%] lg:top-[22%]"
                      aria-label="Follow us on Facebook"
                    >
                      <FacebookIcon className="text-blue-600 
                        size-12 sm:size-14 md:size-16 lg:size-18 xl:size-20" />
                    </button>
                  </div>
                </div>
              </div>
            ) : currentBanner === 6 ? ( // PYTHON BANNER - IMMEDIATELY AFTER FCLUB
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                <div className="relative w-full h-full flex justify-center items-center">
                  <img
                    src={py}
                    alt="Python"
                    className="object-contain w-[85%] h-[85%]"
                  />
                  
                  {/* WhatsApp Button */}
                  <div className="absolute inset-0 pointer-events-none">
                    <button
                      onClick={handleWhatsAppClick}
                      className="pointer-events-auto absolute z-30 transition-all duration-300 hover:scale-105
                                 right-[15%] top-[10%]
                                 md:right-[25%] md:top-[10%]"
                      aria-label="Contact via WhatsApp"
                    >      
                      <WhatsappIcon className="text-green-500 size-12 sm:size-16 md:size-20 lg:size-22 xl:size-24" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Other banners (Finito banner at position 0)
              <div className="absolute inset-0 w-full h-full flex justify-center items-center">
                {bannerCombos[currentBanner].bg === finitoBanner ? (
                  // finito banner layout
                  <div className="flex flex-col sm:flex-row justify-center items-center w-full h-full gap-4 sm:gap-6 md:gap-8 p-4">
                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoBanner}
                        alt="Finito Banner"
                        className="object-contain w-full h-full max-h-[90%]"
                      />
                    </div>

                    <div className="flex justify-center items-center w-full sm:w-1/2 h-1/2 sm:h-full">
                      <img
                        src={finitoAd}
                        alt="Finito Ad"
                        className="object-contain w-full h-full max-h-[90%]"
                      />
                    </div>
                  </div>
                ) : (
                  // Other single banners
                  <div className="flex justify-center items-center w-full h-full p-4">
                    <img
                      src={bannerCombos[currentBanner].bg}
                      alt="Banner Background"
                      className={`${
                        bannerCombos[currentBanner].animated ? "animate-scaleSlow" : ""
                      } object-contain w-full h-full max-h-[90%]`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        {/* Fixed px margin for stable spacing */}
        <div className="flex justify-center space-x-3 mb-6" style={{ marginTop: '24px' }}>
          {bannerCombos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentBanner(idx)}
              className={`w-4 h-4 rounded-full border-2 border-black transition-colors duration-300 ${
                idx === currentBanner ? "bg-red-500" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

        <Products />

        {/* Pagination */}
        <div className="flex justify-center space-x-3 mt-6 mb-20">
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 rounded-full border-2 border-black transition-colors ${
                currentPage === idx + 1 ? "bg-red-500 text-white" : "bg-white"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>
      {/*<Footer />*/}
    </div>
  );
}

export default App;