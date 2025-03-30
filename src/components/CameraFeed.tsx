import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

interface CameraFeedProps {
  onVideoReady: (videoElement: HTMLVideoElement) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onVideoReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const setCameraReady = useAppStore((state) => state.setCameraReady);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              setCameraReady(true);
              onVideoReady(videoRef.current); // Notify parent component
              setError(null);
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
    <div className="relative w-full h-full bg-gray-900">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        autoPlay
        playsInline
      ></video>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default CameraFeed; 