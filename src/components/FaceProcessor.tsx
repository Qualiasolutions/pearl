import React, { useRef, useEffect, useCallback, useState } from 'react';
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { useAppStore } from '../store/useAppStore';

// Detect if device is mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Detect if it's a low-performance device (simplified check, can be refined)
const isLowPerformanceDevice = (): boolean => {
  // Check for mobile device first
  if (isMobile()) {
    // If we can detect Core count, use that
    if (navigator.hardwareConcurrency) {
      return navigator.hardwareConcurrency <= 4;
    }
    // Otherwise assume mobile devices are lower performance
    return true;
  }
  return false;
};

interface FaceProcessorProps {
  videoElement: HTMLVideoElement | null;
  onCanvasReady: (canvasElement: HTMLCanvasElement) => void; // Callback for screenshot
}

// Helper to convert hex to RGBA
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FaceProcessor: React.FC<FaceProcessorProps> = ({ videoElement, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedShade = useAppStore((state) => state.selectedShade);
  const setFaceDetected = useAppStore((state) => state.setFaceDetected);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const processingRef = useRef<boolean>(false);
  const [faceMeshError, setFaceMeshError] = useState<string | null>(null);
  
  // Performance settings based on device capability
  const deviceIsMobile = useRef(isMobile());
  const isLowPerformance = useRef(isLowPerformanceDevice());
  
  // Skip frame logic for performance
  const frameCount = useRef(0);
  const framesToSkip = useRef(deviceIsMobile.current ? (isLowPerformance.current ? 3 : 2) : 0);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current); // Pass canvas ref up for screenshot
    }
  }, [onCanvasReady]);

  // --- MediaPipe Setup ---
  useEffect(() => {
    let mounted = true;
    setFaceMeshError(null);
    
    const setupFaceMesh = async () => {
      try {
        // Try loading with timeout for error handling
        const loadTimeoutId = setTimeout(() => {
          if (mounted) {
            setFaceMeshError("Face detection is taking too long to load. Please check your connection or try again later.");
          }
        }, 15000); // 15s timeout
        
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            // Use CDN for model files
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });
        
        // Clear timeout once created
        clearTimeout(loadTimeoutId);
    
        // Adjust confidence thresholds for mobile
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: !deviceIsMobile.current, // Only use detailed landmarks on desktop
          minDetectionConfidence: deviceIsMobile.current ? 0.6 : 0.5, // Higher on mobile to avoid false positives
          minTrackingConfidence: deviceIsMobile.current ? 0.6 : 0.5
        });
    
        // Use wrap to prevent potential reference issues
        const wrappedOnResults = (results: FaceMeshResults) => {
          if (mounted) {
            onResults(results);
          }
        };
        
        faceMesh.onResults(wrappedOnResults);
        
        if (mounted) {
          faceMeshRef.current = faceMesh;
        }
      } catch (error) {
        console.error("Error initializing FaceMesh:", error);
        if (mounted) {
          setFaceMeshError("Failed to initialize face detection. Please refresh the page or try a different browser.");
        }
      }
    };
    
    setupFaceMesh();

    // Cleanup function
    return () => {
        mounted = false;
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
        faceMeshRef.current?.close();
        setFaceDetected(false); // Reset face detection state on unmount
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty dependency array to run setup once

  // --- Drawing Logic ---
  const onResults = useCallback((results: FaceMeshResults) => {
    if (!canvasRef.current || !videoElement) {
      return;
    }

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) {
      console.error("Could not get 2D context");
      return;
    }

    // Match canvas dimensions to video
    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    
    // Only update dimensions if they've changed
    if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Apply the same mirroring as the video element
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(videoElement, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        setFaceDetected(true);
        const landmarks = results.multiFaceLandmarks[0]; // Use first detected face

        if (selectedShade) {
            // --- Draw Foundation --- 
            canvasCtx.globalCompositeOperation = 'multiply'; // Or 'overlay', 'soft-light'
            canvasCtx.fillStyle = hexToRgba(selectedShade.colorHex, 0.4); // Adjust alpha for desired intensity

            // Apply mirroring for the face drawing
            canvasCtx.save();
            canvasCtx.scale(-1, 1);
            canvasCtx.translate(-canvasRef.current.width, 0);

            // Draw simpler approximation on mobile for performance
            if (deviceIsMobile.current) {
              // Simplified face region - just draw key areas
              const cheekPoints = [
                // Left cheek (key points only)
                [92, 165, 167, 393, 391, 371, 266, 264],
                // Right cheek (key points only)
                [322, 323, 361, 401, 435, 367, 364, 346]
              ];
              
              // Draw cheeks separately
              for (const region of cheekPoints) {
                canvasCtx.beginPath();
                if (landmarks[region[0]]) {
                  canvasCtx.moveTo(
                    landmarks[region[0]].x * canvasRef.current.width,
                    landmarks[region[0]].y * canvasRef.current.height
                  );
                  
                  for (let i = 1; i < region.length; i++) {
                    canvasCtx.lineTo(
                      landmarks[region[i]].x * canvasRef.current.width,
                      landmarks[region[i]].y * canvasRef.current.height
                    );
                  }
                  canvasCtx.closePath();
                  canvasCtx.fill();
                }
              }
            } else {
              // Desktop - more detailed approach
              // --- Convex Hull Approximation ---
              const hullPoints = [ // Example indices for a rough face outline
                  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
              ];
              
              if (landmarks.length > hullPoints[hullPoints.length - 1]) {
                  canvasCtx.beginPath();
                  const firstPoint = landmarks[hullPoints[0]];
                  canvasCtx.moveTo(firstPoint.x * canvasRef.current.width, firstPoint.y * canvasRef.current.height);

                  for (let i = 1; i < hullPoints.length; i++) {
                      const point = landmarks[hullPoints[i]];
                      canvasCtx.lineTo(point.x * canvasRef.current.width, point.y * canvasRef.current.height);
                  }
                  canvasCtx.closePath();
                  canvasCtx.fill();
              }
            }
            
            // Restore canvas state
            canvasCtx.restore();
            
            canvasCtx.globalCompositeOperation = 'source-over'; // Reset composite operation
        }
    } else {
      setFaceDetected(false);
    }
  }, [videoElement, selectedShade, setFaceDetected]);

  // --- Animation Loop ---
  useEffect(() => {
    const processVideo = async () => {
      frameCount.current += 1;
      
      // Skip frames on low-performance devices
      if (framesToSkip.current > 0 && frameCount.current % (framesToSkip.current + 1) !== 0) {
        // Skip this frame
        animationFrameId.current = requestAnimationFrame(processVideo);
        return;
      }
      
      // Only process if video is ready and faceMesh is available and not already processing
      if (videoElement && videoElement.readyState >= 3 && faceMeshRef.current && !processingRef.current) {
        try {
            processingRef.current = true;
            await faceMeshRef.current.send({ image: videoElement });
            processingRef.current = false;
        } catch (error) {
            processingRef.current = false;
            console.error("Error sending frame to FaceMesh:", error);
            
            // Limit attempts on serious errors
            if (String(error).includes("Cannot read properties of undefined") || 
                String(error).includes("Failed to load model")) {
              setFaceMeshError("Face detection encountered a problem. Please reload the page.");
              return; // Stop requesting frames
            }
        }
      }
      // Request next frame
      animationFrameId.current = requestAnimationFrame(processVideo);
    };

    // Start the loop only when video is potentially ready
    if (videoElement) {
        animationFrameId.current = requestAnimationFrame(processVideo);
    } else {
        // Clear canvas if video element disappears
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
        }
    }

    // Cleanup on dependency change or unmount
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [videoElement]); // Rerun setup if videoElement changes

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none" // Overlay canvas
      />
      
      {/* Error message for FaceMesh failures */}
      {faceMeshError && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 text-center">
          <p className="text-sm">
            {faceMeshError}
          </p>
        </div>
      )}
    </>
  );
};

export default FaceProcessor; 