import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

// Mock images - replace with your actual imports
const places = [
  { id: 1, name: 'Taka', image: '/api/placeholder/300/200', location: 'Indonesia' },
  { id: 2, name: 'Komodo', image: '/api/placeholder/300/200', location: 'Indonesia' },
  { id: 3, name: 'Padar', image: '/api/placeholder/300/200', location: 'Indonesia' },
  { id: 4, name: 'Pink Beach', image: '/api/placeholder/300/200', location: 'Indonesia' },
  { id: 5, name: 'Flores', image: '/api/placeholder/300/200', location: 'Indonesia' },
  { id: 6, name: 'Rinca', image: '/api/placeholder/300/200', location: 'Indonesia' },
];

const ThumbnailCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
  }, []);

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
      setTimeout(checkScrollability, 300);
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 hover:shadow-xl ${
          !canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={scrollLeft}
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={18} className="text-gray-700" />
      </button>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
        onScroll={checkScrollability}
      >
        {places.map((place, index) => (
          <div
            key={place.id}
            className={`relative flex-shrink-0 w-64 h-40 cursor-pointer transition-all duration-300 hover:scale-105 ${
              currentIndex === index 
                ? 'ring-4 ring-purple-500 ring-offset-2 shadow-xl scale-105' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleThumbnailClick(index)}
          >
            {/* Image Container */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
              <img
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                src={place.image}
                alt={place.name}
                loading="lazy"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-white/80" />
                  <span className="text-white/80 text-xs font-medium">{place.location}</span>
                </div>
                <h3 className="text-white font-bold text-lg leading-tight">{place.name}</h3>
              </div>
              
              {/* Active Indicator */}
              {currentIndex === index && (
                <div className="absolute top-3 right-3 w-3 h-3 bg-purple-500 rounded-full shadow-lg animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:bg-white hover:scale-110 hover:shadow-xl ${
          !canScrollRight ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
        }`}
        onClick={scrollRight}
        disabled={!canScrollRight}
      >
        <ChevronRight size={18} className="text-gray-700" />
      </button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 gap-2">
        {places.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              currentIndex === index
                ? 'bg-purple-500 scale-125'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => handleThumbnailClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ThumbnailCarousel;