import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Shade, predefinedShades } from '../data/shades';

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Helper function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

// Detect if device is mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

interface CustomShadeCreatorProps {
    onClose: () => void; // Function to close/hide the creator
}

const CustomShadeCreator: React.FC<CustomShadeCreatorProps> = ({ onClose }) => {
  const addCustomShade = useAppStore((state) => state.addCustomShade);
  const setSelectedShade = useAppStore((state) => state.setSelectedShade);
  const [selectedForBlend, setSelectedForBlend] = useState<Shade[]>([]);
  const [customName, setCustomName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const maxBlendShades = 4;
  const deviceIsMobile = React.useRef(isMobile());

  // Group shades by category for better organization
  const shadesByCategory = useMemo(() => {
    const categories: Record<string, typeof predefinedShades> = {};
    
    predefinedShades.forEach(shade => {
      if (!categories[shade.category]) {
        categories[shade.category] = [];
      }
      categories[shade.category].push(shade);
    });
    
    return categories;
  }, []);

  useEffect(() => {
    // Reset error when selection changes
    setErrorMessage(null);
  }, [selectedForBlend, customName]);

  const handleSelectBlendShade = (shade: Shade) => {
    setSelectedForBlend((prev) => {
      if (prev.find((s) => s.id === shade.id)) {
        // Deselect if already selected
        return prev.filter((s) => s.id !== shade.id);
      } else if (prev.length < maxBlendShades) {
        // Select if not max count
        return [...prev, shade];
      }
      // Show error message if trying to select more than max
      if (prev.length >= maxBlendShades) {
        setErrorMessage(`You can select up to ${maxBlendShades} shades only.`);
        // Hide error after 3 seconds
        setTimeout(() => setErrorMessage(null), 3000);
      }
      return prev; // Otherwise, do nothing (max reached)
    });
  };

  const blendedColorHex = useMemo(() => {
    if (selectedForBlend.length === 0) return '#FFFFFF'; // Default or indicate no selection

    let totalR = 0, totalG = 0, totalB = 0;
    let count = 0;

    selectedForBlend.forEach((shade) => {
      const rgb = hexToRgb(shade.colorHex);
      if (rgb) {
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
        count++;
      }
    });

    if (count === 0) return '#FFFFFF';

    const avgR = Math.round(totalR / count);
    const avgG = Math.round(totalG / count);
    const avgB = Math.round(totalB / count);

    return rgbToHex(avgR, avgG, avgB);
  }, [selectedForBlend]);

  const handleCreateAndAdd = () => {
    if (selectedForBlend.length === 0) {
      setErrorMessage("Please select at least one shade to blend.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    if (!customName.trim()) {
      setErrorMessage("Please provide a name for your custom shade.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    
    try {
      // Validate that color was properly computed
      if (blendedColorHex === '#FFFFFF' && !selectedForBlend.some(s => s.colorHex === '#FFFFFF')) {
        setErrorMessage("Error computing blend color. Please try again.");
        return;
      }
      
      const newShade: Shade = {
        id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More unique ID
        name: customName.trim(),
        category: 'Custom',
        colorHex: blendedColorHex,
      };
      
      // Add to store and select it immediately
      addCustomShade(newShade);
      setSelectedShade(newShade); // Auto-select the new shade
      
      // Reset state after adding
      setSelectedForBlend([]);
      setCustomName('');
      onClose(); // Close the modal/creator view
    } catch (error) {
      console.error("Error creating custom shade:", error);
      setErrorMessage("Unexpected error creating shade. Please try again.");
    }
  };

  return (
    <div className={`p-6 bg-gray-800/90 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl
                     ${deviceIsMobile.current ? 'max-w-full w-[95%]' : 'max-w-md w-full'} 
                     text-gray-100 overflow-hidden`}>
      {/* Header with decorative background */}
      <div className="relative -m-6 mb-6 p-6 pb-8 bg-gradient-to-r from-purple-600 to-pink-500">
        <div className="absolute -bottom-5 left-0 right-0 h-10 bg-gradient-to-r from-purple-600 to-pink-500 clip-path-wave opacity-80"></div>
        <h3 className="text-xl font-bold text-white mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          Create Custom Shade
        </h3>
        <p className="text-sm text-white/80">
          Blend up to {maxBlendShades} shades to create your perfect match
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-5">
        <div>
          <p className="text-sm mb-3 font-medium text-purple-200 flex items-center">
            <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs mr-2">1</span>
            Select shades to blend:
          </p>
          
          {/* Show shades by category for easier selection */}
          <div className={`overflow-auto max-h-[180px] pr-2 ${deviceIsMobile.current ? 'pb-2' : 'pb-0'}`}>
            {Object.entries(shadesByCategory).map(([category, shades]) => (
              <div key={category} className="mb-3">
                <h4 className="text-xs font-medium text-gray-400 mb-2">{category}</h4>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {shades.map((shade) => (
                    <div
                      key={shade.id}
                      onClick={() => handleSelectBlendShade(shade)}
                      className={`w-9 h-9 rounded-full cursor-pointer transform transition-all duration-200 shadow-md
                                ${selectedForBlend.find(s => s.id === shade.id) 
                                  ? 'ring-2 ring-offset-1 ring-purple-400 scale-110 z-10' 
                                  : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                      style={{ 
                        backgroundColor: shade.colorHex,
                        boxShadow: `0 4px 6px ${shade.colorHex}40` 
                      }}
                      title={shade.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm mb-3 font-medium text-purple-200 flex items-center">
            <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs mr-2">2</span>
            Selected ({selectedForBlend.length}/{maxBlendShades}):
          </p>
          <div className="flex items-center gap-3 h-16 px-4 py-2 bg-gray-700/40 backdrop-blur-sm rounded-lg">
            {selectedForBlend.length > 0 ? selectedForBlend.map((shade) => (
              <div
                key={`selected-${shade.id}`}
                className="w-10 h-10 rounded-full shadow-lg transform transition-transform hover:scale-105"
                style={{ backgroundColor: shade.colorHex }}
                title={shade.name}
                onClick={() => handleSelectBlendShade(shade)}
              />
            )) : (
              <p className="text-sm text-gray-400 italic">Select shades to blend</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm mb-3 font-medium text-purple-200 flex items-center">
            <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs mr-2">3</span>
            Preview result:
          </p>
          <div className="flex items-center gap-4 px-4 py-3 bg-gray-700/40 backdrop-blur-sm rounded-lg">
            <div
              className="w-12 h-12 rounded-full shadow-lg"
              style={{ 
                backgroundColor: blendedColorHex,
                boxShadow: `0 0 15px ${blendedColorHex}80`
              }}
            />
            <div className="text-sm">
              <p className="font-medium">{blendedColorHex}</p>
              <p className="text-xs text-gray-400">Blended from {selectedForBlend.length} shade{selectedForBlend.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm mb-3 font-medium text-purple-200 flex items-center">
            <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs mr-2">4</span>
            Name your creation:
          </p>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g., My Perfect Match"
            className="w-full px-4 py-3 bg-gray-700/40 border border-gray-600/50 rounded-lg shadow-inner text-gray-100 
                      placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={30} // Prevent extremely long names
          />
        </div>

        <div className="flex justify-between pt-3 mt-4 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAndAdd}
            disabled={selectedForBlend.length === 0 || !customName.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-lg 
                      hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 
                      focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Shade
          </button>
        </div>
      </div>
    </div>
  );
};

// Add the wave clip path for decorative header
const clipPathStyle = document.createElement('style');
clipPathStyle.textContent = `
  .clip-path-wave {
    clip-path: polygon(
      0% 0%,
      100% 0%,
      100% 70%,
      85% 70%,
      75% 100%,
      60% 70%,
      45% 70%,
      30% 100%,
      15% 70%,
      0% 70%
    );
  }
`;
document.head.appendChild(clipPathStyle);

export default CustomShadeCreator; 