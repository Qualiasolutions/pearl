import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useAppStore } from '../store/useAppStore';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation'; // If using navigation buttons
import 'swiper/css/pagination'; // If using pagination

// Optional: Import Swiper modules if needed
import { Navigation, FreeMode, Pagination, A11y } from 'swiper/modules';

// Detect if device is mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const ShadeSwiper: React.FC = () => {
  const allShades = useAppStore((state) => state.allShades);
  const selectedShade = useAppStore((state) => state.selectedShade);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);
  const deviceIsMobile = React.useRef(isMobile());

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
      
      .shade-swiper .swiper-pagination {
        position: relative;
        margin-top: 10px;
        bottom: auto;
      }
      
      .shade-swiper .swiper-pagination-bullet {
        background: #e879f9;
        opacity: 0.5;
      }
      
      .shade-swiper .swiper-pagination-bullet-active {
        background: #e879f9;
        opacity: 1;
      }
      
      @media (max-width: 640px) {
        .shade-swiper {
          padding: 0 15px;
        }
        .shade-item-label {
          font-size: 0.7rem;
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Group shades by category
  const shadesByCategory = React.useMemo(() => {
    const categories: Record<string, typeof allShades> = {};
    
    allShades.forEach(shade => {
      if (!categories[shade.category]) {
        categories[shade.category] = [];
      }
      categories[shade.category].push(shade);
    });
    
    return categories;
  }, [allShades]);

  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, FreeMode, Pagination, A11y]}
        spaceBetween={15}
        slidesPerView={'auto'}
        centeredSlides={false}
        freeMode={true}
        navigation={!deviceIsMobile.current}
        pagination={deviceIsMobile.current ? { clickable: true } : false}
        className="shade-swiper relative"
        a11y={{
          prevSlideMessage: 'Previous shade options',
          nextSlideMessage: 'Next shade options',
          firstSlideMessage: 'This is the first shade',
          lastSlideMessage: 'This is the last shade',
        }}
      >
        {Object.entries(shadesByCategory).map(([category, shades]) => (
          <SwiperSlide key={category} className="!w-auto">
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-300 font-medium mb-2">{category}</span>
              <div className="flex gap-3 mb-1">
                {shades.map((shade) => (
                  <div key={shade.id} className="flex flex-col items-center">
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
                      aria-label={`Select ${shade.name} shade`}
                    >
                       {selectedShade?.id === shade.id && (
                         <div className="w-3 h-3 rounded-full bg-white shadow-inner"></div>
                       )}
                    </div>
                    <p className="text-xs text-center mt-1.5 text-gray-300 truncate max-w-[70px] shade-item-label">
                      {shade.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ShadeSwiper; 