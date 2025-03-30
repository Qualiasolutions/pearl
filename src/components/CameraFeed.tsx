import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface CameraFeedProps {
  onVideoReady: (videoElement: HTMLVideoElement) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onVideoReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const setCameraReady = useAppStore((state) => state.setCameraReady);
  const [error, setError] = useState<string | null>(null);
  const [cameraStarting, setCameraStarting] = useState(true);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user"
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setCameraReady(true);
              onVideoReady(videoRef.current); // Notify parent component
              setError(null);
              // Small delay to hide the loading indicator
              setTimeout(() => setCameraStarting(false), 800);
            }
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
            setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err instanceof DOMException && err.name === 'NotFoundError') {
            setError('No camera found. Please ensure a camera is connected and enabled.');
        } else {
            setError('Could not access camera. Please check connections and permissions.');
        }
        setCameraReady(false);
        setCameraStarting(false);
      }
    };

    enableCamera();

    // Cleanup function to stop the stream when the component unmounts
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setCameraReady(false); // Reset camera state on unmount
    };
  }, [setCameraReady, onVideoReady]);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Camera feed */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        autoPlay
        playsInline
      ></video>
      
      {/* Face positioning guide overlay (only when camera is ready and no error) */}
      {!error && !cameraStarting && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white border-opacity-40 rounded-full"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
          <div className="max-w-md p-4 bg-gray-800 rounded-lg shadow-lg">
            <div className="text-red-400 text-xl mb-2">📷 Camera Error</div>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Initial loading state */}
      {cameraStarting && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-t-purple-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-2"></div>
            <p>Starting camera...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraFeed; 