import React, { useRef, useEffect, useCallback } from 'react';
import { FaceMesh, Results as FaceMeshResults } from '@mediapipe/face_mesh';
import { useAppStore } from '../store/useAppStore';
import { FACEMESH_TESSELATION } from './faceLandmarks'; // Assuming we create this file/constant

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

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current); // Pass canvas ref up for screenshot
    }
  }, [onCanvasReady]);

  // --- MediaPipe Setup ---
  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        // Use CDN for model files
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // Provides more detailed landmarks (iris, lips)
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
    faceMeshRef.current = faceMesh;

    // Cleanup function
    return () => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
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
    canvasRef.current.width = videoElement.videoWidth;
    canvasRef.current.height = videoElement.videoHeight;

    // Clear canvas and draw video frame
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(videoElement, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        setFaceDetected(true);
        const landmarks = results.multiFaceLandmarks[0]; // Use first detected face

        if (selectedShade) {
            // --- Draw Foundation --- 
            canvasCtx.globalCompositeOperation = 'multiply'; // Or 'overlay', 'soft-light'
            canvasCtx.fillStyle = hexToRgba(selectedShade.colorHex, 0.4); // Adjust alpha for desired intensity

            // Iterate through the tesselation indices to draw triangles covering the face
            // FACEMESH_TESSELATION defines pairs of landmark indices forming lines of the mesh
            // We adapt this to draw filled triangles. Need to be careful with triangle winding order.
            // Simplified approach: Draw polygons for key areas (cheeks, forehead) later if tesselation is too complex.
            
            // Let's use a simplified approach: Draw the full face mesh tesselation as a starting point
            // Note: This covers the *entire* face mesh area, not just typical foundation zones.
            // You might want to refine this to specific zones later.
            canvasCtx.beginPath();
            for (const connection of FACEMESH_TESSELATION) {
                const startIdx = connection[0];
                const endIdx = connection[1];

                if (landmarks[startIdx] && landmarks[endIdx]) {
                   // This draws lines, not filled polygons. We need triangles.
                   // Let's draw the convex hull as a simpler approximation for now
                   // For actual makeup, drawing specific triangles based on FACEMESH_TESSELATION is better.
                }
            }
            // --- Convex Hull Approximation --- (Simpler than full triangulation)
            // This is a placeholder. For real foundation, use triangulation.
            const hullPoints = [ // Example indices for a rough face outline - ADJUST AS NEEDED
                10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
            ];
            
            if (landmarks.length > hullPoints[hullPoints.length - 1]) { // Check if landmarks are available
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
            // ---------------------------------


            canvasCtx.globalCompositeOperation = 'source-over'; // Reset composite operation
        } else {
            // Optionally: Draw landmarks if no shade is selected (for debugging)
            // drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
            // drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
        }

    } else {
      setFaceDetected(false);
    }
  }, [videoElement, selectedShade, setFaceDetected]);

  // --- Animation Loop ---
  useEffect(() => {
    const processVideo = async () => {
      if (videoElement && videoElement.readyState >= 3 && faceMeshRef.current) { // readyState 3 = HAVE_FUTURE_DATA
        try {
            await faceMeshRef.current.send({ image: videoElement });
        } catch (error) {
            console.error("Error sending frame to FaceMesh:", error);
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
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none" // Overlay canvas
    />
  );
};

export default FaceProcessor; 