import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

// Detect if device is mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if device is iOS
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

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
  const userInteractedRef = useRef(false); // Track if user has interacted with the page

  // Detect mobile and iOS once
  const deviceIsMobile = useRef(isMobile());
  const deviceIsIOS = useRef(isIOS());

  // Camera initialization function - declared here so it can be referenced in other useEffects
  const enableCamera = async () => {
    console.log(`CameraFeed: enableCamera called (attempt: ${initAttemptRef.current})`);
    // Prevent multiple initialization attempts in quick succession
    if (initAttemptRef.current > 0) {
      console.log('CameraFeed: enableCamera aborted, attempt already in progress.');
      return;
    }
    
    initAttemptRef.current += 1;
    setCameraStarting(true); // Ensure loading state is active
    setError(null); // Clear previous errors

    try {
      console.log('CameraFeed: Stopping existing stream (if any)...');
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        console.log('CameraFeed: Existing stream stopped.');
      }

      // Different constraints for mobile vs desktop
      const constraints = deviceIsMobile.current 
        ? { 
            video: {
              facingMode: "user",
              width: { ideal: deviceIsIOS.current ? 640 : 720 },
              height: { ideal: deviceIsIOS.current ? 480 : 1280 },
            },
            audio: false
          }
        : { 
            video: { 
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: "user",
              frameRate: { ideal: 30 }
            },
            audio: false
          };

      console.log('CameraFeed: Requesting camera access with constraints:', constraints);
      // Request camera access with appropriate constraints
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('CameraFeed: Camera access granted.');
      // Store stream reference for cleanup
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('CameraFeed: Assigning stream to video element.');
        videoRef.current.srcObject = stream;
        
        // Extra attributes for iOS
        if (deviceIsIOS.current) {
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('webkit-playsinline', 'true');
        }
        
        // Wait for metadata to load to ensure video dimensions are available
        videoRef.current.onloadedmetadata = () => {
          if (!videoRef.current) {
             console.log('CameraFeed: onloadedmetadata skipped (no videoRef).');
             return;
          }
          console.log('CameraFeed: Video metadata loaded. Attempting to play...');
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('CameraFeed: play() resolved successfully.');
                // Additional delay to ensure video is actually playing
                setTimeout(() => {
                  if (!videoRef.current) {
                     console.log('CameraFeed: Post-play timeout skipped (no videoRef).');
                     return;
                  }
                  console.log('CameraFeed: Setting camera ready.');
                  setCameraReady(true);
                  onVideoReady(videoRef.current);
                  setCameraStarting(false);
                  
                  // Reset attempt counter after successful initialization
                  setTimeout(() => {
                    initAttemptRef.current = 0;
                    console.log('CameraFeed: Init attempt counter reset.');
                  }, 1000);
                }, 500);
              })
              .catch(err => {
                console.error("CameraFeed: Error playing video:", err);
                
                // Special handling for autoplay policy error
                if (err.name === 'NotAllowedError' && !userInteractedRef.current) {
                  setError('Browser requires user interaction before camera can start. Please tap anywhere on the screen.');
                } else {
                  setError('Could not play video stream. Please reload and try again.');
                }
                
                setCameraStarting(false);
                
                // Reset attempt counter to allow retrying
                setTimeout(() => {
                  initAttemptRef.current = 0;
                  console.log('CameraFeed: Init attempt counter reset after play error.');
                }, 1000);
              });
          }
        };
        
        // Handle video errors
        videoRef.current.onerror = () => {
          console.error('CameraFeed: Video element error occurred.');
          setError('Video playback error. Please reload and try again.');
          setCameraStarting(false);
          setCameraReady(false);
          
          // Reset attempt counter to allow retrying
          setTimeout(() => {
            initAttemptRef.current = 0;
            console.log('CameraFeed: Init attempt counter reset after video.onerror.');
          }, 1000);
        };
      }
    } catch (err) {
      console.error("CameraFeed: Error during camera access/setup:", err);
      
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access in your browser settings and reload the page.');
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and reload the page.');
      } else if (err instanceof DOMException && err.name === 'NotReadableError') {
          setError('Camera is in use by another application. Please close other applications using your camera.');
      } else if (err instanceof DOMException && err.name === 'OverconstrainedError') {
          console.log('CameraFeed: OverconstrainedError, attempting fallback.');
          // Try again with less constraints - mobile-friendly fallback
          try {
            // Minimal constraints as last resort
            const basicStream = await navigator.mediaDevices.getUserMedia({ 
              video: deviceIsIOS.current ? { facingMode: "user" } : true 
            });
            
            console.log('CameraFeed: Fallback camera access granted.');
            streamRef.current = basicStream;
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
              
              // Extra attributes for iOS
              if (deviceIsIOS.current) {
                videoRef.current.setAttribute('playsinline', 'true');
                videoRef.current.setAttribute('webkit-playsinline', 'true');
              }
              
              videoRef.current.onloadedmetadata = () => {
                if (!videoRef.current) return;
                console.log('CameraFeed: Fallback video metadata loaded. Attempting to play...');
                videoRef.current.play()
                  .then(() => {
                    console.log('CameraFeed: Fallback play() resolved successfully.');
                    setCameraReady(true);
                    onVideoReady(videoRef.current!);
                    setCameraStarting(false);
                    
                    // Reset attempt counter after successful initialization
                    setTimeout(() => {
                      initAttemptRef.current = 0;
                      console.log('CameraFeed: Init attempt counter reset after fallback success.');
                    }, 1000);
                  })
                  .catch((playErr) => {
                    console.error('CameraFeed: Error playing fallback video:', playErr);
                    
                    // Check if this is an autoplay policy issue
                    if (playErr.name === 'NotAllowedError' && !userInteractedRef.current) {
                      setError('Browser requires user interaction before camera can start. Please tap anywhere on the screen.');
                    } else {
                      setError('Failed to start video after retry.');
                    }
                    
                    setCameraStarting(false);
                    
                    // Reset attempt counter to allow retrying
                    setTimeout(() => {
                      initAttemptRef.current = 0;
                      console.log('CameraFeed: Init attempt counter reset after fallback play error.');
                    }, 1000);
                  });
              };
            }
          } catch (retryErr) {
            console.error("CameraFeed: Error during fallback camera access:", retryErr);
            setError('Your camera does not support the required features. Please try a different camera or device.');
            setCameraStarting(false);
            
            // Reset attempt counter to allow retrying
            setTimeout(() => {
              initAttemptRef.current = 0;
              console.log('CameraFeed: Init attempt counter reset after fallback setup error.');
            }, 1000);
          }
      } else {
          setError('Camera access error. Please check your browser settings and reload.');
      }
      setCameraReady(false);
      setCameraStarting(false);
      
      // Reset attempt counter to allow retrying
      setTimeout(() => {
        initAttemptRef.current = 0;
         console.log('CameraFeed: Init attempt counter reset after general catch block.');
      }, 1000);
    }
  };

  // Handle autoplay policy
  useEffect(() => {
    const handleUserInteraction = () => {
      userInteractedRef.current = true;
      
      // If camera isn't starting and no stream exists, try to start it on interaction
      if (!cameraStarting && !streamRef.current) {
        enableCamera();
      }
    };

    // Add event listeners for user interaction
    ["click", "touchstart", "keydown"].forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      // Cleanup event listeners
      ["click", "touchstart", "keydown"].forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [cameraStarting]);

  useEffect(() => {
    let mounted = true;
    console.log('CameraFeed: useEffect mounting/running.');

    // Small delay before initializing camera to avoid flashing
    const initTimeout = setTimeout(() => {
      console.log('CameraFeed: Initial timeout finished, calling enableCamera.');
      if (mounted) enableCamera();
    }, 500);

    // Handle visibility change to prevent camera restart when tab becomes active again
    const handleVisibilityChange = () => {
      console.log(`CameraFeed: Visibility changed to ${document.visibilityState}. Stream exists: ${!!streamRef.current}. Camera starting: ${cameraStarting}`);
      if (document.visibilityState === 'visible' && !cameraStarting && !streamRef.current) {
        // Only restart if the stream is actually gone and we're not in starting state
        console.log('CameraFeed: Tab became visible and stream needs restart. Calling enableCamera.');
        enableCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      console.log('CameraFeed: useEffect cleanup running.');
      mounted = false;
      clearTimeout(initTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (streamRef.current) {
        console.log('CameraFeed: Stopping stream in cleanup.');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setCameraReady(false);
    };
  }, [setCameraReady, onVideoReady, cameraStarting]);

  // Function to manually retry camera initialization after an error
  const handleRetry = () => {
    if (initAttemptRef.current === 0) {
      console.log('CameraFeed: Manual retry requested');
      // We'll mark user interaction as happened
      userInteractedRef.current = true;
      // Reset error state
      setError(null);
      // Try to initialize camera again
      setTimeout(() => enableCamera(), 500);
    }
  };

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
            {error.includes('user interaction') ? (
              <button 
                onClick={handleRetry}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors duration-300 shadow-lg"
              >
                Start Camera
              </button>
            ) : (
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-colors duration-300 shadow-lg"
              >
                Reload Page
              </button>
            )}
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