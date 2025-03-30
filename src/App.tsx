import { useState, lazy, Suspense } from 'react';
import React from 'react';
import { useAppStore } from './store/useAppStore';

// Regular import for the critical components
import CameraFeed from './components/CameraFeed';
import ShadeSwiper from './components/ShadeSwiper';

// Lazy load non-critical components
const FaceProcessor = lazy(() => import('./components/FaceProcessor'));
const CustomShadeCreator = lazy(() => import('./components/CustomShadeCreator'));
const ScreenshotButton = lazy(() => import('./components/ScreenshotButton'));

// Loading fallback component
const LoadingComponent = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="animate-pulse flex items-center">
      <div className="h-4 w-4 bg-purple-500 rounded-full mr-2"></div>
      <div className="h-4 w-4 bg-purple-400 rounded-full mr-2"></div>
      <div className="h-4 w-4 bg-purple-300 rounded-full"></div>
    </div>
  </div>
);

// Error boundary for component-level errors
const ComponentErrorFallback = ({ componentName }: { componentName: string }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
    <p className="text-red-700 mb-2">Failed to load {componentName}</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
    >
      Reload
    </button>
  </div>
);

function App() {
  const isCameraReady = useAppStore((state) => state.isCameraReady);
  const isFaceDetected = useAppStore((state) => state.isFaceDetected);
  const selectedShade = useAppStore((state) => state.selectedShade);

  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [showCustomCreator, setShowCustomCreator] = useState(false);
  
  // Error states to handle component failures gracefully
  const [faceProcessorError, setFaceProcessorError] = useState(false);
  const [swipeError, setSwipeError] = useState(false);

  const handleVideoReady = (element: HTMLVideoElement) => {
    setVideoElement(element);
  };

  const handleCanvasReady = (element: HTMLCanvasElement) => {
    setCanvasElement(element);
  };

  // Determine status message
  let statusMessage = "Initializing Camera...";
  if (isCameraReady && !isFaceDetected) {
    statusMessage = "Align your face in the camera view";
  } else if (isCameraReady && isFaceDetected && !selectedShade) {
    statusMessage = "Face detected! Try selecting a shade below";
  } else if (isCameraReady && isFaceDetected && selectedShade) {
    statusMessage = `Applying: ${selectedShade.name}`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Header / Title */}
      <header className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 text-white p-3 md:p-4 shadow-md text-center">
        <h1 className="text-xl md:text-2xl font-bold">My Pearl - Virtual Foundation Try-On</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Left/Top: Camera and Canvas */}
        <div className="relative w-full md:w-2/3 h-1/2 md:h-full bg-black flex items-center justify-center overflow-hidden">
          <CameraFeed onVideoReady={handleVideoReady} />
          
          {/* Conditionally render FaceProcessor only when video is ready */}
          {videoElement && !faceProcessorError && (
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary 
                fallback={<ComponentErrorFallback componentName="Face Processor" />}
                onError={() => setFaceProcessorError(true)}
              >
                <FaceProcessor videoElement={videoElement} onCanvasReady={handleCanvasReady} />
              </ErrorBoundary>
            </Suspense>
          )}
          
          {/* Status Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-center text-sm truncate">
             {statusMessage}
          </div>
        </div>

        {/* Right/Bottom: Controls */}
        <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-gray-50 overflow-auto">
          {/* Shade Swiper */}
          <div className="p-3 md:p-4 border-b border-gray-300">
             <h2 className="text-base md:text-lg font-semibold mb-2 text-gray-700">Select a Shade</h2>
             
             {!swipeError ? (
               <ErrorBoundary 
                 fallback={<ComponentErrorFallback componentName="Shade Selector" />}
                 onError={() => setSwipeError(true)}
               >
                 <ShadeSwiper />
               </ErrorBoundary>
             ) : (
               <div className="p-4 bg-gray-100 rounded text-center">
                 Unable to load shade selection. Please reload the page.
               </div>
             )}
          </div>

          {/* Custom Shade and Screenshot Area */} 
          <div className="p-3 md:p-4 space-y-3 md:space-y-4 flex-grow">
             <button 
                onClick={() => setShowCustomCreator(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md shadow hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-colors disabled:opacity-50"
                disabled={!isFaceDetected}
             >
                Create Custom Shade
             </button>

             <Suspense fallback={<LoadingComponent />}>
               <ErrorBoundary fallback={<ComponentErrorFallback componentName="Screenshot Button" />}>
                 <ScreenshotButton canvasElement={canvasElement} />
               </ErrorBoundary>
             </Suspense>

            {/* Custom Shade Creator Modal/Section */} 
            {showCustomCreator && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <Suspense fallback={<LoadingComponent />}>
                  <ErrorBoundary fallback={<ComponentErrorFallback componentName="Custom Shade Creator" />}>
                     <CustomShadeCreator onClose={() => setShowCustomCreator(false)} />
                  </ErrorBoundary>
                </Suspense>
              </div>
            )}
          </div>
           
           {/* Footer/Info Area */} 
           <footer className="p-2 md:p-3 bg-gray-100 border-t text-center text-xs text-gray-500 flex justify-between items-center">
             <span>v1.0.0</span>
             <span>Powered by MediaPipe & React</span>
             <span>{new Date().getFullYear()}</span>
           </footer>
        </div>
      </main>
    </div>
  );
}

// Simple error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, {hasError: boolean}> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Component error:", error);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default App;