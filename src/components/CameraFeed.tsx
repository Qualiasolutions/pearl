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
  const streamRef = useRef<MediaStream | null>(null);
  const initAttemptRef = useRef(0); // Track initialization attempts

  useEffect(() => {
    let mounted = true;
    
    // Camera initialization function
    const enableCamera = async () => {
      // Prevent multiple initialization attempts in quick succession
      if (initAttemptRef.current > 0) {
        return;
      }
      
      initAttemptRef.current += 1;
      
      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Request camera access with specific constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        
        // Store stream reference for cleanup
        streamRef.current = stream;
        
        // Only proceed if component is still mounted
        if (!mounted) return;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for metadata to load to ensure video dimensions are available
          videoRef.current.onloadedmetadata = () => {
            if (!videoRef.current || !mounted) return;
            
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  if (!mounted) return;
                  // Additional delay to ensure video is actually playing
                  setTimeout(() => {
                    if (!mounted || !videoRef.current) return;
                    setCameraReady(true);
                    onVideoReady(videoRef.current);
                    setCameraStarting(false);
                    
                    // Reset attempt counter after successful initialization
                    setTimeout(() => {
                      initAttemptRef.current = 0;
                    }, 1000);
                  }, 500);
                })
                .catch(err => {
                  console.error("Error playing video:", err);
                  if (!mounted) return;
                  setError('Could not play video stream. Please reload and try again.');
                  setCameraStarting(false);
                  
                  // Reset attempt counter to allow retrying
                  setTimeout(() => {
                    initAttemptRef.current = 0;
                  }, 1000);
                });
            }
          };
          
          // Handle video errors
          videoRef.current.onerror = () => {
            if (!mounted) return;
            setError('Video playback error. Please reload and try again.');
            setCameraStarting(false);
            setCameraReady(false);
            
            // Reset attempt counter to allow retrying
            setTimeout(() => {
              initAttemptRef.current = 0;
            }, 1000);
          };
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Error accessing camera:", err);
        
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
            setError('Camera access denied. Please allow camera access in your browser settings and reload the page.');
        } else if (err instanceof DOMException && err.name === 'NotFoundError') {
            setError('No camera found. Please connect a camera and reload the page.');
        } else if (err instanceof DOMException && err.name === 'NotReadableError') {
            setError('Camera is in use by another application. Please close other applications using your camera.');
        } else if (err instanceof DOMException && err.name === 'OverconstrainedError') {
            // Try again with less constraints
            try {
              const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
              if (!mounted) return;
              streamRef.current = basicStream;
              if (videoRef.current) {
                videoRef.current.srcObject = basicStream;
                videoRef.current.onloadedmetadata = () => {
                  if (!videoRef.current || !mounted) return;
                  videoRef.current.play()
                    .then(() => {
                      if (!mounted) return;
                      setCameraReady(true);
                      onVideoReady(videoRef.current!);
                      setCameraStarting(false);
                      
                      // Reset attempt counter after successful initialization
                      setTimeout(() => {
                        initAttemptRef.current = 0;
                      }, 1000);
                    })
                    .catch(() => {
                      if (!mounted) return;
                      setError('Failed to start video after retry.');
                      setCameraStarting(false);
                      
                      // Reset attempt counter to allow retrying
                      setTimeout(() => {
                        initAttemptRef.current = 0;
                      }, 1000);
                    });
                };
              }
            } catch (retryErr) {
              if (!mounted) return;
              setError('Your camera does not support the required features. Please try a different camera.');
              setCameraStarting(false);
              
              // Reset attempt counter to allow retrying
              setTimeout(() => {
                initAttemptRef.current = 0;
              }, 1000);
            }
        } else {
            setError('Camera access error. Please check your browser settings and reload.');
        }
        if (mounted) {
          setCameraReady(false);
          setCameraStarting(false);
          
          // Reset attempt counter to allow retrying
          setTimeout(() => {
            initAttemptRef.current = 0;
          }, 1000);
        }
      }
    };

    // Small delay before initializing camera to avoid flashing
    const initTimeout = setTimeout(() => {
      if (mounted) enableCamera();
    }, 500);

    // Handle visibility change to prevent camera restart when tab becomes active again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !cameraStarting && !streamRef.current) {
        // Only restart if the stream is actually gone and we're not in starting state
        setCameraStarting(true);
        enableCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setCameraReady(false);
    };
  }, [setCameraReady, onVideoReady, cameraStarting]);

  return (
    <div className="relative w-full h-full bg-gray-800 overflow-hidden">
      {/* Camera feed - added scaleX(-1) to fix orientation */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover transform scale-x-[-1]" 
        muted
        playsInline
        autoPlay
      ></video>
      
      {/* Face positioning guide overlay (only when camera is ready and no error) */}
      {!error && !cameraStarting && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 md:w-72 md:h-72 border-2 border-white border-opacity-40 rounded-full"></div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm text-white p-4 text-center z-10">
          <div className="max-w-md p-6 bg-gray-800 rounded-xl shadow-2xl border border-red-500/20">
            <div className="text-red-400 text-xl mb-3 font-medium">📷 Camera Error</div>
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors duration-300 shadow-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Initial loading state */}
      {cameraStarting && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm text-white z-10">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-t-purple-500 border-r-pink-500 border-b-indigo-500 border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-light">Initializing camera...</p>
            <p className="text-xs mt-2 text-gray-400 max-w-xs mx-auto">This may take a moment. Please allow camera access when prompted.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraFeed; 