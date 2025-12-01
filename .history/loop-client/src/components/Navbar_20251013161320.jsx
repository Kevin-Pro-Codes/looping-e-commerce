import React, { useState, useRef, useEffect } from "react";
import { FiShoppingCart, FiMenu, FiUser, FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdLogIn } from "react-icons/io";
import logo from '../assets/finito.png';
import enFlag from "../assets/us.png";
import ptFlag from "../assets/br.png";
import eightBall from "../assets/8ball.png";
import { useNavigate } from "react-router-dom";


const categories = [
   "Finito", "Rock and roll", "Games", "Desenhos", "Super-heróis", "Filmes", "Futebol", "Basquete", "Luta", "Esportes", "Motociclismo",
  "Tecnologia", "Profissões", "Países",
  "Dinheiro", "Engraçados", "Literatura", "Psicodélico", "Yoga", "Espiritualidade", "Astrologia", "Aleatório"
];

const products = [
      "Masculino",
      "Feminino",
      "Camisetas",
      "Regatas",
      "Blusas",
      "Shorts",
      "Toucas",
      "Bonés",
      "Meias",
      "Chinelos",
      "Óculos",     
      "Canecas",
      "Almofadas",
      "Tapetes",
      "Ingressos"
];


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const profileRef = useRef();
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


 useEffect(() => {
  // Check if user is logged in on mount
  const token = localStorage.getItem("token");
  const storedStatus = localStorage.getItem("loggedIn");

  setLoggedIn(token !== null || storedStatus === "true");

  // Listen for changes in localStorage (other tabs)
  const handleStorageChange = (e) => {
    if (e.key === "loggedIn") {
      setLoggedIn(e.newValue === "true");
    }
  };

  window.addEventListener("storage", handleStorageChange);
  
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);



  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "pt" : "en"));
  };

  const handleRegister = () => {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    setProfileOpen(false);
  };
  
  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("token");
    setProfileOpen(false); // Close popup after logout
    navigate("/");
  };

  const currentFlag = language === "en" ? enFlag : ptFlag;

  
  const ProfilePopup = () => (
    <div
      ref={profileRef}
      className="absolute right-2 top-full mt-2 w-75 bg-white shadow-lg rounded-lg border border-black mr-2 p-3 z-50"
      style={{ fontFamily: "Calibri, sans-serif" }}
    >
      <div className="flex items-center justify-center mb-2 space-x-2">
        <IoMdLogIn className="text-xl sm:text-2xl text-black" />
        <span className="text-lg sm:text-xl font-bold text-black">Conta</span>
      </div>
{loggedIn ? (
  <>
    <button
      className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
      onClick={() => {                     
        navigate("/perfil"); 
        setProfileOpen(false);
      }}
    >
      <FaUserCircle className="text-xl" />
      {/*<span>Perfil</span>*/}
    </button>

    <button
      onClick={handleLogout}
      className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
    >
      Sair
    </button>
  </>
)  : (    
  <>
      
<button
  className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mb-2 flex items-center justify-center gap-2"
  onClick={() => { 
    handleLogin(); 
    setProfileOpen(false); 
    navigate("/logar");
  }}
>
  <span>Entrar</span>
</button>

          <button
            onClick={() => {
              handleRegister();                               
              setProfileOpen(false);
              navigate("/registrar");
            }}
            className="w-full bg-gray-100 text-black py-2 rounded-md hover:bg-gray-200 transition"
          >
            Registrar
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50 py-1 sm:py-2 md:py-2 lg:py-2 xl:py-2 2xl:py-2">
        {/* Top navbar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          {/* Logo + Title */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 flex-shrink-0 cursor-pointer ml-1"
          >
            {/* Your SVG logos here */}
            <svg viewBox="0 0 970 970" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 sm:h-13 md:h-14 lg:h-15 xl:h-16">
              <path d="M 406.617 913.539 C 361.002 905.487 297.406 874.062 249.066 835.687 C 167.369 770.831 113.36 680.183 96.0563 578.88 C 91.4632 551.99 90.5532 540.531 90.5859 510 c 0.04086 -38.1081 3.36073 -66.8921 11.4709 -99.4558 c 18.9388 -76.0422 57.7884 -144.109 113.07 -198.106 c 45.0029 -43.9569 93.0091 -73.9218 152.805 -95.3791 c 79.3373 -28.4695 163.724 -32.4217 246.849 -11.561 c 49.3718 12.3902 95.3767 33.1886 136.719 61.8095 c 26.0517 18.0354 39.8527 29.6522 62.2881 52.4305 c 40.8989 41.524 70.2914 88.2591 91.6724 145.762 c 12.3919 33.3276 20.6853 69.1819 24.7499 107 c 1.94095 18.0593 1.62111 64.5309 -0.56781 82.5 c -11.515 94.5279 -50.1329 175.302 -117.006 244.732 c -46.1619 47.9269 -112.163 88.8564 -172.663 107.073 c -33.3039 10.0281 -51.2658 10.3086 -70.6382 1.10325 c -22.7917 -10.8302 -39.0726 -35.9109 -40.809 -62.8667 c -0.26721 -4.14805 -0.74081 -58.1842 -1.05245 -120.08 l -0.56662 -112.538 l 9.79641 -2.22765 c 22.0166 -5.00646 37.7526 -13.682 53.8628 -29.6955 c 20.7361 -20.6116 30.7758 -43.0846 30.8255 -69 c 0.0496 -25.8499 -9.44997 -49.1724 -27.8332 -68.3339 C 576.052 424.918 557.048 414.575 530.5 408.846 c -3.63149 -0.78365 -12.316 -1.25972 -22 -1.20601 c -13.8526 0.0768 -17.317 0.43686 -25.8132 2.68265 c -11.8751 3.13895 -23.2802 7.96351 -34.0055 14.3849 c -9.96552 5.96652 -26.647 22.1118 -32.8479 31.7921 c -19.1704 29.927 -20.832 66.7728 -4.47407 99.2115 c 10.2114 20.2498 29.5112 37.9812 51.7306 47.5265 C 472.483 607.273 487.882 612 491.635 612 h 2.41141 L 493.773 732.75 L 493.5 853.5 l -3.42019 9.8824 c -6.93452 20.0368 -19.7042 34.914 -37.7412 43.97 c -12.6176 6.33504 -30.8801 8.80603 -45.7216 6.18633 Z m 25.1091 -19.1172 c 15.7271 -3.24852 28.5407 -13.0761 35.8028 -27.4597 c 7.3471 -14.5518 6.85927 -6.30407 7.06574 -119.462 c 0.10236 -56.1 -0.034 -105.895 -0.303 -110.655 l -0.48912 -8.65538 l -7.65127 -2.71232 c -30.1108 -10.6741 -57.3188 -33.737 -71.6624 -60.7448 c -8.91207 -16.7806 -13.4943 -35.6831 -13.4813 -55.6131 c 0.009 -13.3422 0.98164 -20.3675 4.54079 -32.7868 c 10.7765 -37.6038 43.5924 -70.2854 82.9808 -82.6413 c 15.3919 -4.82835 22.9707 -5.95758 40.4709 -6.03013 c 17.889 -0.0742 28.3792 1.55683 44.6041 6.93498 c 31.5066 10.4437 60.8521 35.6217 75.0077 64.3557 c 21.3491 43.3357 14.5155 92.0273 -18.176 129.511 c -14.0383 16.0963 -37.7777 31.613 -57.6038 37.6515 l -6.66797 2.03088 l 0.43215 100.178 C 546.834 783.42 547.217 833 547.447 838.5 c 0.7534 17.9956 5.45322 30.1165 16.0212 41.3191 c 7.75357 8.2192 14.8426 12.2237 26.0554 14.7183 c 9.23693 2.05502 18.296 1.06298 36.9305 -4.04417 c 33.0918 -9.06945 69.3079 -25.8596 101.85 -47.2187 C 798.524 797.185 852.511 733.317 881.955 661.5 C 917.815 574.035 922.113 485.208 894.844 395.109 C 871.897 319.291 829.746 255.529 769.466 205.451 C 742.761 183.265 723.378 170.723 691.5 155.003 C 646.206 132.668 605.1 120.598 553 114.335 c -20.4335 -2.45606 -69.0585 -2.46831 -88 -0.0222 c -49.5577 6.39998 -91.429 18.6758 -132.818 38.9393 c -41.4536 20.2953 -72.3496 42.6811 -107.192 77.6661 c -37.7535 37.9082 -64.21 77.523 -85.2675 127.676 c -31.6724 75.434 -38.6573 164.76 -19.1112 244.406 c 20.3391 82.8768 64.8933 153.618 132.949 211.093 C 300.77 853.961 362.62 885.458 411.5 894.521 c 9.4161 1.746 11.3351 1.73652 20.2261 -0.1 Z M 422 867.467 C 359.165 852.772 299.168 819.777 251.132 773.5 C 205.241 729.289 169.706 670.599 152.136 610 C 133.207 544.713 133.186 474.848 152.077 409 C 186.203 290.045 276.066 198.006 395.5 159.685 c 65.0622 -20.8757 136.292 -22.9715 205.493 -6.04624 c 53.4793 13.0802 103.014 37.129 144.507 70.1569 c 74.2976 59.1399 120.976 140.813 135.568 237.204 c 2.94371 19.4454 3.71582 59.7349 1.57145 82 c -3.796 39.4139 -12.5362 73.8127 -27.523 108.323 C 840.584 684.786 817.94 720.9 795.128 747 C 748.21 800.678 688.936 839.554 622 860.55 c -15.4101 4.83378 -31.2144 8.45979 -36.7326 8.42762 c -5.22165 -0.0304 -11.5235 -3.12279 -14.5081 -7.11919 c -2.9781 -3.98775 -5.07391 -7.87766 -4.53479 -8.41678 c 0.21265 -0.21265 5.31161 -1.32853 11.331 -2.47974 c 41.2868 -7.89603 80.7816 -23.1222 117.756 -45.3978 c 39.8663 -24.0179 79.0866 -60.3548 105.358 -97.6121 c 18.3977 -26.0915 36.193 -60.6684 46.0373 -89.4524 c 29.8108 -87.1642 22.5634 -180.556 -20.642 -266 c -4.72793 -9.35 -11.6991 -21.95 -15.4914 -28 C 782.922 280.387 742.93 241.356 698 214.63 C 652.035 187.289 603.049 171.122 544 163.804 c -15.7178 -1.94773 -57.1941 -1.6535 -74.5 0.5285 c -68.8786 8.68452 -130.775 34.1882 -181.697 74.8657 c -19.636 15.6858 -45.6417 42.5681 -61.2358 63.2999 c -44.3416 58.9506 -68.5767 132.015 -68.5641 206.708 c 0.005 32.1511 2.75433 55.2406 9.97599 83.7932 c 25.0984 99.2324 91.518 181.641 183.596 227.793 c 30.3465 15.2104 65.0543 26.712 94.9717 31.4721 c 4.09907 0.65219 7.45285 1.5567 7.45285 2.01002 c 0 1.7337 -2.93886 6.3339 -5.66072 8.86074 c -7.14659 6.63452 -12.633 7.5367 -26.3393 4.33119 Z m 17.9451 -45.9648 C 375.888 805.63 323.006 776.783 280.453 734.5 C 244.322 698.599 220.66 661.135 202.853 611.636 c -11.1452 -30.9795 -16.8781 -65.3704 -16.8994 -101.376 c -0.0356 -60.1032 15.0436 -113.956 46.3624 -165.575 c 41.7513 -68.8138 112.578 -121.221 191.553 -141.737 c 32.1735 -8.35795 49.3021 -10.4189 86.6319 -10.4237 c 27.1968 -0.004 32.8928 0.27764 46.4281 2.29159 c 22.6845 3.37528 38.5333 7.0741 58.2193 13.5873 C 683.871 231.141 744.283 277.109 783.495 336.5 c 34.2498 51.8754 52.6579 112.001 52.6596 172 c 0.004 138.011 -92.8846 262.106 -228.642 305.455 C 597.532 817.142 570.763 824 568.302 824 C 567.316 824 567 821.483 567 813.636 v -10.3641 l 4.25 -0.59737 c 2.3375 -0.32855 10.8325 -2.40926 18.8777 -4.6238 c 57.0672 -15.7084 109.009 -46.9938 146.732 -88.3793 c 42.314 -46.422 69.4912 -104.121 77.7985 -165.171 c 2.43147 -17.8688 2.41815 -54.2607 -0.026 -71 c -8.04837 -55.1214 -29.4724 -105.541 -62.7486 -147.674 c -10.3211 -13.0681 -33.3558 -35.8489 -47.099 -46.5798 c -62.3892 -48.7144 -137.098 -71.5716 -216.864 -66.3493 c -28.2471 1.84933 -49.2012 5.67039 -72.9205 13.2973 c -41.4524 13.3289 -76.7134 33.3166 -110.156 62.4419 c -42.312 36.8495 -76.4384 92.5357 -90.3096 147.364 c -11.4196 45.1379 -12.3959 89.3279 -2.96304 134.117 c 10.8756 51.6392 38.7609 104.847 74.6908 142.518 c 25.2882 26.5136 53.5654 47.3777 86.6304 63.9196 c 22.4807 11.2467 42.6101 18.5593 67.3575 24.4696 l 13.75 3.28381 v 9.84596 c 0 11.5879 0.98252 11.0742 -14.0549 7.34824 Z M 438.5 769.514 C 386.457 754.385 347.734 731.729 310.384 694.558 C 251.057 635.514 223.915 549.762 238.041 466 c 7.8668 -46.6481 25.7003 -86.5469 54.8617 -122.742 c 9.44375 -11.7215 32.3408 -34.243 44.0976 -43.3745 c 32.4163 -25.1776 74.9292 -44.6993 115.324 -52.9565 c 58.3435 -11.9259 120.818 -5.1253 174.762 19.0236 c 15.2683 6.83508 26.2752 12.996 41.3787 23.1613 c 55.1146 37.0943 93.4042 90.9042 110.569 155.387 c 13.0038 48.851 11.0265 100.061 -5.75309 149 c -5.19245 15.1441 -17.3988 40.9066 -25.8223 54.5 c -34.9691 56.4311 -93.7569 100.461 -159.959 119.804 c -7.7 2.24977 -15.4625 4.37498 -17.25 4.72268 l -3.25 0.6322 v -9.9699 v -9.96991 l 8.25 -2.21571 c 23.1156 -6.20819 52.0248 -18.7373 72.5992 -31.4641 C 714.648 678.219 758.366 609.823 767.078 533.007 C 768.565 519.889 767.745 489.458 765.514 475 C 757.737 424.599 734.98 378.168 700.332 342.01 C 671.936 312.377 641.122 291.971 603.95 278.182 C 568.63 265.082 527.39 259.14 490.427 261.827 C 409.046 267.742 337.105 309.805 292.874 377.333 C 266.096 418.217 252.864 466.153 254.32 517 c 1.78006 62.1607 25.1883 117.294 69.1386 162.843 c 31.8671 33.0258 75.5834 58.9823 118.348 70.2693 L 454 753.33 v 10.3349 c 0 5.68419 -0.1125 10.3067 -0.25 10.2723 c -0.1375 -0.0344 -7 -2.0248 -15.25 -4.42313 Z m 0 -50.9479 C 401.789 706.391 373.614 688.839 345.442 660.593 C 327.226 642.329 317.856 629.598 306.537 607.732 C 281.374 559.124 275.758 508.843 289.43 454.567 C 302.842 401.319 339.579 352.767 389 322.975 C 425.106 301.21 466.049 290 509.435 290 c 55.4837 0 105.669 17.3674 147.512 51.0488 c 32.2805 25.984 54.8465 57.2867 68.8698 95.5334 c 8.30552 22.6522 12.037 42.0397 12.8796 66.9178 c 0.87837 25.9347 -2.02006 46.1898 -10.1622 71.0163 c -15.1524 46.2017 -46.2546 86.9838 -87.1651 114.293 c -21.8482 14.5847 -54.7021 29.8096 -70.619 32.7258 L 567 722.223 V 712.111 C 567 703.927 567.277 702 568.456 702 c 2.56581 0 23.705 -8.5603 34.4291 -13.942 c 13.4216 -6.73545 26.1525 -14.64 38.0754 -23.641 c 10.1605 -7.67046 29.6251 -26.9915 37.1913 -36.917 c 29.5543 -38.77 44.8205 -87.6502 41.0189 -131.337 c -2.24958 -25.8512 -8.54056 -48.5231 -19.7962 -71.3431 c -10.26 -20.8014 -20.411 -35.5722 -34.8598 -50.7253 C 626.508 334.237 574.832 311.88 517 310.277 c -61.0213 -1.69144 -116.527 19.8168 -157.155 60.8967 c -38.1499 38.5743 -57.7601 84.9036 -57.8264 136.616 c -0.0378 29.4511 4.50504 52.1225 15.6219 77.9628 c 19.0964 44.3883 54.7091 81.1888 99.8598 103.19 c 6.6 3.21614 17.4 7.68708 24 9.93543 l 12 4.0879 l 0.28498 10.017 c 0.21805 7.66422 -0.0168 10.0026 -1 9.95589 c -0.70674 -0.0336 -7.13498 -2.00123 -14.285 -4.37251 Z m 5 -48.9542 c -23.5799 -9.5006 -41.8315 -21.2413 -59.4957 -38.2717 c -26.2553 -25.3132 -42.8041 -54.7188 -49.9975 -88.8405 c -3.03545 -14.3985 -3.79097 -40.3732 -1.5988 -54.9665 c 7.85366 -52.282 35.898 -93.462 83.8717 -123.156 c 16.1893 -10.0206 35.6539 -17.5904 57.7203 -22.4472 c 12.2143 -2.68839 43.3046 -3.75567 57.7103 -1.9811 c 48.0843 5.92329 88.9353 28.2142 120.131 65.551 c 18.8604 22.5736 30.4281 46.9944 36.3154 76.6662 c 3.18525 16.0536 3.22299 40.708 0.0862 56.3365 C 679.469 582.217 653.367 621.31 615 648.198 C 602.573 656.907 574.23 671 569.142 671 C 567.095 671 567 670.555 567 661 c 0 -7.32567 0.33429 -10.0038 1.25 -10.0144 c 2.43387 -0.028 21.9484 -9.98892 30.5382 -15.5878 c 35.152 -22.9123 58.4701 -55.1322 68.9346 -95.2507 c 2.58465 -9.90895 2.77518 -11.999 2.74826 -30.1471 c -0.0264 -17.7999 -0.2638 -20.4344 -2.72286 -30.2174 C 663.098 461.283 656.974 447.012 647.245 432 C 623.691 395.659 588.135 371.858 543.058 362.26 c -11.4394 -2.43586 -14.5186 -2.67459 -34.5584 -2.67926 c -20.5947 -0.005 -22.7665 0.17402 -34 2.79951 c -57.0378 13.3309 -99.4967 50.6634 -116.464 102.402 c -4.75926 14.5128 -7.03811 29.4226 -7.03042 45.9979 c 0.0193 41.5985 15.4447 77.1736 46.384 106.974 c 15.0938 14.538 37.6922 28.8949 52.4337 33.3115 L 454 652.317 v 10.3417 c 0 7.65058 -0.32528 10.3203 -1.25 10.2594 c -0.6875 -0.0453 -4.85 -1.53276 -9.25 -3.30557 Z" fill="black" stroke="black" strokeWidth="5" />
            </svg>
            <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" className="w-auto h-10 sm:h-11 md:h-12 lg:h-13 xl:h-14">
              <path d="M 367.981 139.25 C 359.442 134.884 358.606 132.434 358 110 l -0.5 -18.5 l -3.26941 -0.314806 c -4.76058 -0.458388 -6.59554 -3.77087 -6.00873 -10.847 C 348.741 74.0721 350.473 72 355.191 72 C 357.972 72 358 71.9381 358 65.7 c 0 -3.56667 0.52063 -6.82063 1.2 -7.5 c 0.73924 -0.739236 4.36518 -1.2 9.4433 -1.2 c 7.38477 0 8.40542 0.23147 9.8 2.22251 c 0.93154 1.32996 1.5567 4.34192 1.5567 7.5 V 72 h 5.30887 C 393.089 72 394.5 73.4224 394.5 81.2657 C 394.5 89.7671 393.408 91 385.878 91 H 380 v 14.9648 c 0 14.1121 0.118 15.028 2.07088 16.0731 c 1.47775 0.79087 2.93807 0.806 5.09867 0.0528 c 5.32097 -1.8549 7.83045 0.72196 7.83045 8.04071 c 0 6.2588 -2.18234 9.42523 -7.40176 10.7395 c -7.61943 1.91859 -13.6739 1.41832 -19.6173 -1.62095 Z m 75.2241 0.91062 c -11.1725 -3.97477 -17.3178 -12.1139 -19.3223 -25.5917 c -0.86789 -5.83527 -0.866 -9.44437 0.008 -14.7349 c 3.30552 -20.0157 15.8013 -29.6671 37.0922 -28.6492 c 14.9964 0.716987 23.6795 6.73871 28.1849 19.5462 c 2.86645 8.14849 2.3023 25.3402 -1.08279 32.996 c -2.5755 5.8248 -8.653 11.9671 -15.2353 15.3978 c -6.14727 3.20393 -21.9938 3.75762 -29.6444 1.0358 Z m 21.3974 -19.2772 c 2.65973 -2.47284 4.39921 -8.21538 4.39203 -14.4994 C 468.982 95.326 465.024 89.5 457.524 89.5 C 449.897 89.5 446 95.2312 446 106.448 c 0 8.5066 2.30872 14.3326 6.40376 16.1597 c 3.82426 1.70628 9.34894 0.92552 12.1986 -1.72393 Z M 51.2225 139.443 L 49 137.887 V 96.0983 c 0 -41.1974 0.02973 -41.8152 2.10261 -43.6933 c 1.90585 -1.72671 4.11349 -1.93361 23.5903 -2.21083 c 24.5378 -0.349251 25.6447 -0.07421 26.7815 6.65438 c 0.80176 4.74557 -0.90239 11.718 -3.06705 12.5486 C 97.5433 69.7287 91.0232 70 83.9182 70 H 71 v 8.5 v 8.5 h 12.3089 c 8.57327 0 12.8529 0.397817 14.1015 1.31081 c 1.97241 1.44226 3.24341 8.94813 2.21146 13.0597 C 98.3396 106.479 96.8417 107 83.4286 107 H 71 v 15.4433 C 71 140.823 70.8953 141 60 141 c -4.31431 0 -7.3147 -0.53213 -8.77749 -1.5567 Z m 87 0 C 136.006 137.891 136 137.8 136 106.5 C 136 69.8821 135.325 72 147 72 c 11.6753 0 11 -2.1179 11 34.5 c 0 36.6179 0.67527 34.5 -11 34.5 c -4.31431 0 -7.3147 -0.53213 -8.77749 -1.5567 Z m 60 0 C 196.006 137.891 196 137.8 196 106.5 C 196 75.1996 196.006 75.1091 198.223 73.5567 C 202.651 70.4549 215 72.1505 215 75.8602 c 0 1.55096 0.0333 1.54142 6.5 -1.86024 c 12.5422 -6.59758 26.3032 -2.61697 32.8416 9.5 c 2.019 3.74162 2.17942 5.62634 2.48353 29.1777 l 0.32512 25.1777 l -2.57208 1.68529 c -3.68272 2.41302 -16.1896 1.71108 -18.1872 -1.02073 c -1.07725 -1.47323 -1.3943 -6.42648 -1.40572 -21.9611 c -0.017 -23.0591 -0.46053 -24.8851 -6.16129 -25.3635 c -2.89773 -0.243139 -4.35567 0.33253 -7.22701 2.85359 L 218 97.2072 V 117.104 C 218 141.156 218.071 141 207.223 141 c -4.5157 0 -7.5192 -0.51951 -9 -1.5567 Z m 99 0 C 295.006 137.891 295 137.802 295 106.466 V 75.0461 l 2.49696 -1.63607 c 3.61073 -2.36584 16.141 -1.62563 18.1121 1.06994 C 316.725 76.0056 317 82.3841 317 106.691 C 317 142.61 317.506 141 306.223 141 c -4.5157 0 -7.5192 -0.51951 -9 -1.5567 Z M 140.308 67.9904 c -3.9106 -1.5752 -5.60347 -5.41752 -5.09394 -11.5618 c 0.67383 -8.12546 2.83502 -9.92863 11.9 -9.92863 c 6.49442 0 7.25177 0.224336 9.47222 2.80576 c 1.85672 2.15856 2.41342 3.96141 2.41342 7.81574 c 0 2.75549 -0.48622 5.91849 -1.08049 7.02889 c -2.13449 3.98833 -11.9368 6.12566 -17.6112 3.84 Z M 298.364 67.8304 C 293.431 65.442 292.243 54.1544 296.413 49.3058 C 298.634 46.7243 299.391 46.5 305.886 46.5 c 8.78551 0 11.1601 1.8383 11.8409 9.16655 c 0.60955 6.56152 -0.93815 10.1061 -5.18808 11.8818 c -3.9771 1.66174 -11.035 1.80218 -14.1744 0.282041 Z" fill="white" stroke="black" strokeWidth="7" />
            </svg>
          </div>

          

          {/* Flag + Search + Icons */}
          <div className="flex flex-col sm:flex-row sm:ml-5 ml-4 mt-2 sm:mt-0 w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              {/* Flag */}
              <img 
                src={currentFlag} 
                alt={language === "en" ? "English" : "Português"} 
                className="h-7 w-11 sm:h-8 sm:w-10 object-contain cursor-pointer"
                onClick={toggleLanguage}
              />

              {/* Search box */}
            <div className="relative flex-1 min-w-[150px] max-w-[350px] sm:max-w-[500px] w-full">
  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-lg sm:text-xl" />
  <input
    type="text"
    placeholder="Procurar..."
    className="w-full border border-black rounded-md py-1.5 sm:py-2 pl-10 pr-3 focus:outline-none focus:ring-1 focus:ring-black text-black placeholder-black text-base sm:text-lg"
    style={{ fontFamily: "Calibri, Arial, sans-serif" }}
  />
</div>


              {/* Cart + Profile */}
              <div className="flex items-center space-x-2 sm:space-x-3 mt-2 sm:mt-0 relative">
                {/* Cart */}
                <button className="relative p-1 sm:p-1 rounded-full hover:bg-gray-100">
                  <FiShoppingCart className="text-2xl sm:text-3xl text-black" />
                  <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-red-500 text-white text-xs sm:text-sm font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    5
                  </span>
                </button>

                {/* Main Navbar Profile Icon */}
             <button
  className="p-2 sm:p-3 mr-5 rounded-full hover:bg-gray-100 relative"
  onClick={() => setProfileOpen(prev => !prev)}
>
  {loggedIn ? (
    <FiUser className="text-2xl sm:text-3xl text-black" />
  ) : (
    <FiUser className="text-2xl sm:text-3xl text-black" />
  )}
  {loggedIn && (
    <span className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
  )}
</button>

  {/* Profile Popup */}
  {profileOpen && <ProfilePopup />}
  
    </div>
    </div>
    </div>
    </div>

{/* Second navbar: Hamburger + items */}
<div className="w-full flex items-center bg-white">

  {/* Hamburger button */}
  <button
    className="w-11 h-11 flex flex-col justify-between items-center p-3 rounded-full group transition-all duration-300
               absolute top-1 right-3 sm:static sm:mr-1 ml-3"
    onClick={() => setMenuOpen(true)}
  >
    <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
    <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
    <span className="block w-6 h-1 bg-black rounded-full transition-all duration-300 group-hover:bg-yellow-400"></span>
  </button>


{/* Horizontal items (hidden on mobile) */}
<div className="relative w-full">
  {/* Scrollable items */}
  <div className="hidden sm:flex ml-0 sm:ml-2 flex-nowrap gap-4 overflow-x-auto overflow-y-hidden items-center whitespace-nowrap pr-16 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] tracking-widest">
    {[
      "Masculino",
      "Feminino",
      "Camisetas",
      "Regatas",
      "Blusas",
      "Shorts",
      "Toucas",
      "Bonés",
      "Meias",
      "Chinelos",
      "Óculos",     
      "Canecas",
      "Almofadas",
      "Tapetes",
      "Ingressos"
      
    ].map((item, idx) => (
      <span
        key={idx}
        className="text-black text-sm sm:text-base md:text-lg px-2 hover:text-yellow-400 cursor-pointer font-bold"
        style={{ fontFamily: "Calibri, sans-serif" }}
      >
        {item}
      </span>
    ))}
  </div>

  {/* 8-ball overlay on the right (hidden on small screens) */}
  <img
    src={eightBall}
    alt="8ball"
    className="hidden sm:block h-8 w-8 sm:h-8 sm:w-8 object-contain cursor-pointer absolute top-1/2 right-2 transform -translate-y-1/2 z-10 hover:scale-110 transition-transform"
  
  />
</div>

</div> 
       
</nav>

 {/* Left-side menu drawer */}
{menuOpen && (
  <div
    className="fixed top-0 left-0 h-full bg-white shadow-xl z-50 rounded-xl w-full sm:w-2/3 md:w-1/2 lg:w-5/12 xl:w-1/4 flex flex-col p-5"
    style={{ fontFamily: "Calibri, sans-serif", color: "black" }}
  >
    
    {/* Drawer Profile / Login */}
    <div
      className="flex items-center gap-3 mb-6 cursor-pointer"
      onClick={() => setProfileOpen(prev => !prev)}
    >
      <div className="relative">
        <FiUser className="text-3xl text-black" />
        {loggedIn && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
        )}
      </div>
   <span
    className="text-2xl sm:text-2xl leading-tight ml-3 mr-3 whitespace-nowrap"
    style={{ fontFamily: "Calibri, sans-serif" }}
  >
    {loggedIn ? "Logado" : "Logar ou Cadastrar"}
  </span>
    </div>

{/*}
    {profileOpen && (
      <div className="mb-4">
        <ProfilePopup />
      </div>
    )}
*/}

 {profileOpen && (
    
        <ProfilePopup />
     
    )}

    {/* Single scrollable container for headers + lists */}
    <div className="flex-1 overflow-y-auto drawer-scroll">
           

 {/* Categorias Header */}
      <div className="flex justify-between items-center flex-shrink-0 mb-4">
        <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap">
          Categorias
        </h2>
      </div>

      {/* Categorias list */}
      <ul className="space-y-3">
        {categories.map((cat, index) => (
          <li
            key={index}
            className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
          >
            {cat}
          </li>
        ))}
      </ul>

{/* Produtos Header */}
      <div className="flex justify-between items-center flex-shrink-0 mb-4">
        <h2 className="font-bold text-4xl sm:text-5xl leading-tight whitespace-nowrap mt-15">
          Produtos
        </h2>
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-9 right-2 rounded-full hover:bg-transparent transition"
          style={{ fontFamily: "Calibri, sans-serif" }}
        >
          <div style={{ position: "relative", width: "2.3rem", height: "2.3rem" }}>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "0.3rem",
                backgroundColor: "red",
                borderRadius: "9999px",
                transform: "translate(-50%, -50%) rotate(45deg)",
                border: "1px solid black",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "100%",
                height: "0.3rem",
                backgroundColor: "red",
                borderRadius: "9999px",
                transform: "translate(-50%, -50%) rotate(-45deg)",
                border: "1px solid black",
              }}
            />
          </div>
        </button>
      </div>

      {/* Produtos list */}
      <ul className="space-y-3 mb-6">
        {products.map((cat, index) => (
          <li
            key={index}
            className="p-2 rounded cursor-pointer text-black text-xl md:text-3xl"
          >
            {cat}
          </li>
        ))}
      </ul>



    </div>
    </div>


      )}
    </>
  );
};

export default Navbar;