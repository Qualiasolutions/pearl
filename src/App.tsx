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
  <div className="w-full h-full flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
    <div className="animate-pulse flex space-x-2">
      <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
      <div className="h-3 w-3 bg-pink-500 rounded-full"></div>
      <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
    </div>
  </div>
);

// Error boundary for component-level errors
const ComponentErrorFallback = ({ componentName }: { componentName: string }) => (
  <div className="p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl text-center shadow-lg">
    <p className="text-red-700 mb-2 font-medium">Failed to load {componentName}</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm transition-colors"
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
    statusMessage = "Face detected! Select a shade below";
  } else if (isCameraReady && isFaceDetected && selectedShade) {
    statusMessage = `Wearing ${selectedShade.name}`;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 font-sans overflow-hidden select-none text-gray-100">
      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        {/* Left/Top: Camera and Canvas - increased height on mobile (70%) */}
        <div className="relative w-full md:w-3/4 h-[70vh] md:h-full bg-black flex items-center justify-center overflow-hidden">
          {/* Floating Logo */}
          <div className="absolute top-4 left-4 z-10 flex items-center pointer-events-none">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-lg text-white font-bold tracking-wide">My Pearl</h1>
            </div>
          </div>
          
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
          
          {/* Status Overlay - with glass morphism effect */}
          <div className="absolute bottom-0 left-0 right-0 backdrop-blur-md bg-black/40 text-white text-center py-3 font-light">
            <div className="flex items-center justify-center space-x-2">
              {isFaceDetected && (
                <span className="block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              )}
              <p className="text-sm">{statusMessage}</p>
            </div>
          </div>
        </div>

        {/* Right/Bottom: Controls Panel - with glass morphism */}
        <div className="w-full md:w-1/4 h-[30vh] md:h-full flex flex-col bg-gray-800/90 backdrop-blur-sm overflow-auto shadow-xl border-t border-gray-700 md:border-l md:border-t-0">
          {/* Shade Swiper Section */}
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="text-base font-medium mb-3 text-gray-200 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Select Foundation Shade
            </h2>
             
            {!swipeError ? (
              <ErrorBoundary 
                fallback={<ComponentErrorFallback componentName="Shade Selector" />}
                onError={() => setSwipeError(true)}
              >
                <ShadeSwiper />
              </ErrorBoundary>
            ) : (
              <div className="p-4 bg-gray-700/50 rounded-lg text-center text-sm">
                Unable to load shade selection. Please reload the page.
              </div>
            )}
          </div>

          {/* Actions Panel */} 
          <div className="p-4 space-y-3 flex-grow">
            <button 
              onClick={() => setShowCustomCreator(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={!isFaceDetected}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Custom Shade
              </div>
            </button>

            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary fallback={<ComponentErrorFallback componentName="Screenshot Button" />}>
                <ScreenshotButton canvasElement={canvasElement} />
              </ErrorBoundary>
            </Suspense>

            {/* Information Card */}
            <div className="mt-4 p-3 bg-gray-700/30 rounded-lg text-xs text-gray-300 shadow-inner">
              <p>Position your face in the circle for best results. Try different shades by selecting from the palette above.</p>
            </div>
          </div>
           
          {/* Footer - minimal, subtle */} 
          <div className="p-2 bg-gray-800/80 border-t border-gray-700/30 text-center text-xs text-gray-500 flex justify-between items-center">
            <span>v1.0.0</span>
            <span className="text-gray-400">My Pearl</span>
            <span>{new Date().getFullYear()}</span>
          </div>
        </div>
      </main>

      {/* Custom Shade Creator Modal */} 
      {showCustomCreator && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="animate-slideUp">
            <Suspense fallback={<LoadingComponent />}>
              <ErrorBoundary fallback={<ComponentErrorFallback componentName="Custom Shade Creator" />}>
                <CustomShadeCreator onClose={() => setShowCustomCreator(false)} />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}

// Add animation classes to tailwind
const customStyles = document.createElement('style');
customStyles.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-slideUp {
    animation: slideUp 0.4s ease-out;
  }
`;
document.head.appendChild(customStyles);

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