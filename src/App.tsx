import React, { useState, useRef } from 'react';
import CameraFeed from './components/CameraFeed';
import FaceProcessor from './components/FaceProcessor';
import ShadeSwiper from './components/ShadeSwiper';
import CustomShadeCreator from './components/CustomShadeCreator';
import ScreenshotButton from './components/ScreenshotButton';
import { useAppStore } from './store/useAppStore';

function App() {
  const isCameraReady = useAppStore((state) => state.isCameraReady);
  const isFaceDetected = useAppStore((state) => state.isFaceDetected);
  const selectedShade = useAppStore((state) => state.selectedShade);

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [showCustomCreator, setShowCustomCreator] = useState(false);

  const handleVideoReady = (element: HTMLVideoElement) => {
    setVideoElement(element);
  };

  const handleCanvasReady = (element: HTMLCanvasElement) => {
    setCanvasElement(element);
  };

  // Determine status message
  let statusMessage = "Initializing Camera...";
  if (isCameraReady && !isFaceDetected) {
    statusMessage = "Align your face in the camera view.";
  } else if (isCameraReady && isFaceDetected && !selectedShade) {
    statusMessage = "Face detected! Try selecting a shade below.";
  } else if (isCameraReady && isFaceDetected && selectedShade) {
    statusMessage = `Applying shade: ${selectedShade.name}`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-200 font-sans">
      {/* Header / Title */}
      <header className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 text-white p-4 shadow-md text-center">
        <h1 className="text-2xl font-bold">My Pearl - Virtual Foundation Try-On</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">

        {/* Left/Top: Camera and Canvas */}
        <div className="relative w-full md:w-2/3 h-1/2 md:h-full bg-black flex items-center justify-center overflow-hidden">
          <CameraFeed onVideoReady={handleVideoReady} />
          {/* Conditionally render FaceProcessor only when video is ready */} 
          {videoElement && <FaceProcessor videoElement={videoElement} onCanvasReady={handleCanvasReady} />}
          {/* Status Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-center text-sm">
             {statusMessage}
          </div>
        </div>

        {/* Right/Bottom: Controls */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-gray-50 overflow-auto">
          {/* Shade Swiper */}
          <div className="p-4 border-b border-gray-300">
             <h2 className="text-lg font-semibold mb-2 text-gray-700">Select a Shade</h2>
            <ShadeSwiper />
          </div>

          {/* Custom Shade and Screenshot Area */} 
          <div className="p-4 space-y-4 flex-grow">
             <button 
                onClick={() => setShowCustomCreator(true)}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors"
             >
                Create Custom Shade
             </button>

            <ScreenshotButton canvasElement={canvasElement} />

            {/* Custom Shade Creator Modal/Section */} 
            {showCustomCreator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                 <CustomShadeCreator onClose={() => setShowCustomCreator(false)} />
              </div>
            )}
          </div>
           {/* Footer/Info Area */} 
           <footer className="p-3 bg-gray-100 border-t text-center text-xs text-gray-500">
             Powered by MediaPipe & React
           </footer>
        </div>
      </main>
    </div>
  );
}

export default App; 