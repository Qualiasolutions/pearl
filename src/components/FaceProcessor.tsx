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

// Simple polygon for face shapes if detection fails
const BASIC_FACE_SHAPE = [
  // Basic face oval points as fallback (normalized coordinates 0-1)
  { x: 0.5, y: 0.2 },   // Top middle
  { x: 0.65, y: 0.25 }, // Top right
  { x: 0.75, y: 0.4 },  // Right upper
  { x: 0.8, y: 0.5 },   // Right middle 
  { x: 0.75, y: 0.65 }, // Right lower
  { x: 0.65, y: 0.8 },  // Bottom right
  { x: 0.5, y: 0.85 },  // Bottom middle
  { x: 0.35, y: 0.8 },  // Bottom left
  { x: 0.25, y: 0.65 }, // Left lower
  { x: 0.2, y: 0.5 },   // Left middle
  { x: 0.25, y: 0.4 },  // Left upper 
  { x: 0.35, y: 0.25 }, // Top left
];

const FaceProcessor: React.FC<FaceProcessorProps> = ({ videoElement, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedShade = useAppStore((state) => state.selectedShade);
  const setFaceDetected = useAppStore((state) => state.setFaceDetected);
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Performance settings
  const deviceIsMobile = useRef(isMobile());
  const frameCount = useRef(0);
  const framesToSkip = useRef(deviceIsMobile.current ? 2 : 0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initAttemptRef = useRef(0);
  const MAX_ATTEMPTS = 2;

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current); // Pass canvas ref up for screenshot
    }
  }, [onCanvasReady]);

  // --- MediaPipe Setup ---
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    // Set a timeout to use fallback if face detection takes too long
    loadingTimeoutRef.current = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("Face detection loading timeout - switching to fallback");
        setUsingFallback(true);
        setIsLoading(false);
        setFaceDetected(true); // Always show "face detected" in fallback mode
      }
    }, 10000); // 10 second timeout

    const setupFaceMesh = async () => {
      try {
        initAttemptRef.current += 1;
        
        // Use simplified model for mobile
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
        });
    
        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false, // Disable detailed landmarks for better performance
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
    
        faceMesh.onResults((results: FaceMeshResults) => {
          if (mounted) {
            // If we get results, clear loading state
            if (isLoading) {
              setIsLoading(false);
              if (loadingTimeoutRef.current) {
                clearTimeout(loadingTimeoutRef.current);
              }
            }
            onResults(results);
          }
        });
        
        // Wait for model to load
        await faceMesh.initialize();
        
        if (mounted) {
          faceMeshRef.current = faceMesh;
        }
      } catch (error) {
        console.error("Error initializing FaceMesh:", error);
        
        // Retry once more before falling back
        if (initAttemptRef.current < MAX_ATTEMPTS) {
          console.log(`Retrying FaceMesh initialization (attempt ${initAttemptRef.current + 1}/${MAX_ATTEMPTS})`);
          setTimeout(setupFaceMesh, 2000); // Retry after 2 seconds
        } else {
          if (mounted) {
            console.log("Max attempts reached - switching to fallback mode");
            setUsingFallback(true);
            setIsLoading(false);
            setFaceDetected(true); // Always show "face detected" in fallback mode
          }
        }
      }
    };
    
    setupFaceMesh();

    // Cleanup function
    return () => {
      mounted = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      faceMeshRef.current?.close();
    };
  }, [isLoading, setFaceDetected]);

  // --- Drawing Logic ---
  const onResults = useCallback((results: FaceMeshResults) => {
    if (!canvasRef.current || !videoElement) {
      return;
    }

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) {
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
    
    // Draw video frame with mirroring
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(videoElement, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.restore();

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        setFaceDetected(true);
        const landmarks = results.multiFaceLandmarks[0]; // Use first detected face

        if (selectedShade) {
            // Draw foundation
            canvasCtx.globalCompositeOperation = 'multiply';
            canvasCtx.fillStyle = hexToRgba(selectedShade.colorHex, 0.4);

            canvasCtx.save();
            canvasCtx.scale(-1, 1);
            canvasCtx.translate(-canvasRef.current.width, 0);

            // Draw approximate face region using simpler points
            const cheekPoints = [
              // Left cheek area
              [67, 109, 10, 338, 297, 332, 284, 251, 389, 264],
              // Right cheek area
              [397, 365, 364, 394, 395, 369, 396, 175, 171, 140]
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
            
            canvasCtx.restore();
            canvasCtx.globalCompositeOperation = 'source-over';
        }
    } else {
      setFaceDetected(false);
    }
  }, [videoElement, selectedShade, setFaceDetected]);

  // Special fallback drawing when facemesh fails
  const drawFallbackFace = useCallback(() => {
    if (!canvasRef.current || !videoElement) {
      return;
    }

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) {
      return;
    }

    // Update canvas dimensions
    if (canvasRef.current.width !== videoElement.videoWidth || 
        canvasRef.current.height !== videoElement.videoHeight) {
      canvasRef.current.width = videoElement.videoWidth;
      canvasRef.current.height = videoElement.videoHeight;
    }

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw video frame with mirroring
    canvasCtx.save();
    canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(videoElement, -canvasRef.current.width, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.restore();

    // Only draw face if shade is selected
    if (selectedShade) {
      canvasCtx.globalCompositeOperation = 'multiply';
      canvasCtx.fillStyle = hexToRgba(selectedShade.colorHex, 0.35); // Slightly lighter for fallback

      // Use face detection fallback - simplified face oval in center
      canvasCtx.save();
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasRef.current.width, 0);
      
      // Draw basic face shape
      const centerX = canvasRef.current.width / 2;
      const centerY = canvasRef.current.height / 2;
      const faceWidth = canvasRef.current.width * 0.45; // Face takes up 45% of width
      const faceHeight = canvasRef.current.height * 0.6; // Face takes up 60% of height
      
      // Draw face area
      canvasCtx.beginPath();
      const firstPoint = BASIC_FACE_SHAPE[0];
      canvasCtx.moveTo(
        centerX + (firstPoint.x - 0.5) * faceWidth,
        centerY + (firstPoint.y - 0.5) * faceHeight
      );
      
      for (let i = 1; i < BASIC_FACE_SHAPE.length; i++) {
        const point = BASIC_FACE_SHAPE[i];
        canvasCtx.lineTo(
          centerX + (point.x - 0.5) * faceWidth, 
          centerY + (point.y - 0.5) * faceHeight
        );
      }
      
      canvasCtx.closePath();
      canvasCtx.fill();
      
      canvasCtx.restore();
      canvasCtx.globalCompositeOperation = 'source-over';
    }
  }, [videoElement, selectedShade]);

  // Animation loop
  useEffect(() => {
    const processVideo = async () => {
      // Skip frames for better performance
      frameCount.current = (frameCount.current + 1) % (framesToSkip.current + 1);
      
      // Use fallback mode if needed
      if (usingFallback) {
        if (frameCount.current === 0) {
          drawFallbackFace();
        }
        animationFrameId.current = requestAnimationFrame(processVideo);
        return;
      }

      // Regular processing
      if (frameCount.current === 0 && videoElement && videoElement.readyState >= 2 && faceMeshRef.current) {
        try {
          await faceMeshRef.current.send({ image: videoElement });
        } catch (error) {
          console.error("Error sending frame to FaceMesh:", error);
          
          // Switch to fallback if we encounter errors
          if (error && (
            String(error).includes("Cannot read properties") ||
            String(error).includes("Failed to load")
          )) {
            console.log("Switching to fallback mode due to errors");
            setUsingFallback(true);
          }
        }
      }
      
      animationFrameId.current = requestAnimationFrame(processVideo);
    };

    // Start animation loop
    if (videoElement) {
      animationFrameId.current = requestAnimationFrame(processVideo);
    } else {
      // Clear canvas if video is gone
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [videoElement, usingFallback, drawFallbackFace]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {isLoading && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-gray-800/70 text-white text-sm px-4 py-2 rounded-full backdrop-blur-sm">
            Loading face detection...
          </div>
        </div>
      )}
      
      {usingFallback && selectedShade && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-gray-800/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Using simplified makeup mode
          </div>
        </div>
      )}
    </>
  );
};

export default FaceProcessor; 