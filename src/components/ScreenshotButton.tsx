import React from 'react';

interface ScreenshotButtonProps {
  // Pass the canvas element directly when needed, or the ref
  canvasElement: HTMLCanvasElement | null;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ canvasElement }) => {

  const handleScreenshot = () => {
    if (!canvasElement) {
      console.error("Canvas element not available for screenshot.");
      alert("Could not take screenshot. Canvas not ready.");
      return;
    }

    try {
        const dataUrl = canvasElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'my_pearl_tryon.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error taking screenshot:", error);
        alert("Failed to take screenshot.");
    }
  };

  return (
    <button
      onClick={handleScreenshot}
      disabled={!canvasElement} // Disable if canvas isn't ready
      className="px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Take Screenshot
    </button>
  );
};

export default ScreenshotButton; 