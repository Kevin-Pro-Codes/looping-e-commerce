import React from "react";

const ProductSkeleton = () => {
  return (
    <div className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center p-4 border-1 border-black animate-pulse">
      {/* OFF Flag Skeleton */}
      <div className="absolute top-3 left-3 z-20 bg-gray-200 text-gray-200 px-2 py-0 rounded-sm font-bold text-md shadow-lg border-2 border-gray-300 w-16 h-6"></div>
      
      {/* Heart Icon Skeleton */}
      <div className="absolute top-3 right-3 z-20 bg-gray-200 rounded-full p-1 shadow-md w-8 h-8"></div>

      {/* Image Skeleton */}
      <div className="relative w-full mb-3 overflow-hidden rounded-xl mt-8">
        <div className="w-full h-[390px] bg-gray-200 rounded-xl"></div>
      </div>

      {/* Title Skeleton */}
      <div className="w-full text-center mb-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
      </div>

      {/* Price Skeleton */}
      <div className="w-full text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Add to Cart Button Skeleton */}
      <div className="w-full flex justify-center mt-3 pt-3">
        <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
