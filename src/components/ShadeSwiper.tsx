import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useAppStore } from '../store/useAppStore';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation'; // If using navigation buttons
import 'swiper/css/pagination'; // If using pagination

// Optional: Import Swiper modules if needed
// import { Navigation, Pagination } from 'swiper/modules';

const ShadeSwiper: React.FC = () => {
  const allShades = useAppStore((state) => state.allShades);
  const selectedShade = useAppStore((state) => state.selectedShade);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);

  return (
    <div className="w-full py-2 px-4 bg-gray-100">
      <Swiper
        // modules={[Navigation, Pagination]} // Uncomment if using Navigation/Pagination
        spaceBetween={10}       // Space between slides
        slidesPerView={'auto'}  // Show partial next/prev slides
        centeredSlides={true}   // Center the active slide
        className="h-20"        // Set a fixed height for the swiper container
      >
        {allShades.map((shade) => (
          <SwiperSlide key={shade.id} className="!w-auto"> {/* Use !w-auto to let content size the slide */}            <div
              onClick={() => setSelectedShade(shade)}
              className={`w-12 h-12 rounded-full cursor-pointer border-2 hover:border-gray-600 transition-all duration-150 flex items-center justify-center
                         ${selectedShade?.id === shade.id ? 'border-blue-500 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: shade.colorHex }}
              title={shade.name}
            >
               {/* Optional: Add a checkmark or inner ring for selected */}
               {selectedShade?.id === shade.id && (
                 <div className="w-4 h-4 rounded-full bg-white opacity-50"></div>
               )}
            </div>
            {/* Optional: Display shade name below swatch */}
            {/* <p className="text-xs text-center mt-1">{shade.name}</p> */}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ShadeSwiper; 