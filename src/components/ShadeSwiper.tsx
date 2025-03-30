import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useAppStore } from '../store/useAppStore';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation'; // If using navigation buttons
import 'swiper/css/pagination'; // If using pagination

// Optional: Import Swiper modules if needed
import { Navigation, FreeMode } from 'swiper/modules';

const ShadeSwiper: React.FC = () => {
  const allShades = useAppStore((state) => state.allShades);
  const selectedShade = useAppStore((state) => state.selectedShade);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);

  // Add custom styles for swiper navigation once on component mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .shade-swiper {
        padding: 0 25px;
      }
      
      .shade-swiper .swiper-button-next,
      .shade-swiper .swiper-button-prev {
        color: #e879f9;
        width: 20px;
        height: 20px;
        background: rgba(30, 30, 40, 0.6);
        border-radius: 50%;
        backdrop-filter: blur(4px);
      }
      
      .shade-swiper .swiper-button-next:after,
      .shade-swiper .swiper-button-prev:after {
        font-size: 10px;
        font-weight: bold;
      }
      
      .shade-swiper .swiper-button-disabled {
        opacity: 0.35;
        cursor: auto;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={15}
        slidesPerView={'auto'}
        centeredSlides={false}
        freeMode={true}
        navigation={true}
        className="shade-swiper relative"
      >
        {allShades.map((shade) => (
          <SwiperSlide key={shade.id} className="!w-auto">
            <div
              onClick={() => setSelectedShade(shade)}
              className={`w-14 h-14 rounded-full cursor-pointer transform transition-all duration-200 flex items-center justify-center shadow-md
                         ${selectedShade?.id === shade.id 
                            ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' 
                            : 'hover:scale-105'}`}
              style={{ 
                backgroundColor: shade.colorHex,
                boxShadow: `0 4px 10px ${shade.colorHex}40` 
              }}
              title={shade.name}
            >
               {selectedShade?.id === shade.id && (
                 <div className="w-3 h-3 rounded-full bg-white shadow-inner"></div>
               )}
            </div>
            <p className="text-xs text-center mt-1.5 text-gray-300 truncate max-w-[70px]">
              {shade.name.split(' ')[0]}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ShadeSwiper; 