import React, { useState, useMemo } from 'react';
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

interface CustomShadeCreatorProps {
    onClose: () => void; // Function to close/hide the creator
}

const CustomShadeCreator: React.FC<CustomShadeCreatorProps> = ({ onClose }) => {
  const addCustomShade = useAppStore((state) => state.addCustomShade);
  const [selectedForBlend, setSelectedForBlend] = useState<Shade[]>([]);
  const [customName, setCustomName] = useState('');
  const maxBlendShades = 4;

  const handleSelectBlendShade = (shade: Shade) => {
    setSelectedForBlend((prev) => {
      if (prev.find((s) => s.id === shade.id)) {
        // Deselect if already selected
        return prev.filter((s) => s.id !== shade.id);
      } else if (prev.length < maxBlendShades) {
        // Select if not max count
        return [...prev, shade];
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
    if (selectedForBlend.length > 0 && customName.trim()) {
      const newShade: Shade = {
        id: `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`, // More unique ID
        name: customName.trim(),
        category: 'Custom',
        colorHex: blendedColorHex,
      };
      addCustomShade(newShade);
      // Reset state after adding
      setSelectedForBlend([]);
      setCustomName('');
      onClose(); // Close the modal/creator view
    } else {
        alert("Please select at least one shade to blend and provide a name.");
    }
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-md border border-gray-200 max-w-md mx-auto my-4">
        <h3 className="text-lg font-semibold mb-3 text-center">Create Custom Shade</h3>

        <p className="text-sm text-gray-600 mb-3">Select up to {maxBlendShades} predefined shades to blend:</p>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {predefinedShades.map((shade) => (
                <div
                    key={shade.id}
                    onClick={() => handleSelectBlendShade(shade)}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 hover:border-gray-500 transition-all
                                ${selectedForBlend.find(s => s.id === shade.id) ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'}`}
                    style={{ backgroundColor: shade.colorHex }}
                    title={`Select ${shade.name}`}
                ></div>
            ))}
        </div>

        <p className="text-sm text-gray-600 mb-1">Selected Shades ({selectedForBlend.length}/{maxBlendShades}):</p>
        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] bg-gray-50 p-2 rounded">
            {selectedForBlend.length > 0 ? selectedForBlend.map((shade) => (
                 <div
                    key={`selected-${shade.id}`}
                    className={`w-8 h-8 rounded-full border border-gray-400`}
                    style={{ backgroundColor: shade.colorHex }}
                    title={shade.name}
                ></div>
            )) : <p className="text-xs text-gray-400 italic self-center">No shades selected</p>}
        </div>

        <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-gray-600">Blended Result:</p>
            <div
                className="w-10 h-10 rounded-full border border-gray-400"
                style={{ backgroundColor: blendedColorHex }}
            ></div>
        </div>

        <div className="mb-4">
            <label htmlFor="customShadeName" className="block text-sm font-medium text-gray-700 mb-1">Custom Shade Name:</label>
            <input
                type="text"
                id="customShadeName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., My Perfect Blend"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
        </div>

        <div className="flex justify-end gap-2">
             <button
                onClick={onClose} // Use the onClose prop
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Cancel
            </button>
            <button
                onClick={handleCreateAndAdd}
                disabled={selectedForBlend.length === 0 || !customName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Create & Add Shade
            </button>
        </div>
    </div>
  );
};

export default CustomShadeCreator; 