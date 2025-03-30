import React, { useState, useEffect } from 'react';

interface ScreenshotButtonProps {
  // Pass the canvas element directly when needed, or the ref
  canvasElement: HTMLCanvasElement | null;
}

const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ canvasElement }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleScreenshot = () => {
    if (!canvasElement) {
      setToastMessage("Canvas not ready. Try again in a moment.");
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      const dataUrl = canvasElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'my_pearl_tryon.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      setToastMessage("Image saved successfully!");
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error("Error taking screenshot:", error);
      setToastMessage("Failed to take screenshot. Please try again.");
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleScreenshot}
        disabled={!canvasElement} // Disable if canvas isn't ready
        className="w-full group relative px-4 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 22H15C20 22 22 20 22 15V13C22 8 20 6 15 6H9C4 6 2 8 2 13V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 2H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19C13.6569 19 15 17.6569 15 16C15 14.3431 13.6569 13 12 13C10.3431 13 9 14.3431 9 16C9 17.6569 10.3431 19 12 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 10H17.51" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Save My Look
          <span className="absolute right-0 top-0 -mt-2 -mr-2 w-3 h-3 rounded-full bg-pink-500 group-hover:animate-ping"></span>
        </div>
      </button>
      
      {/* Toast Notification */}
      {showToast && (
        <div 
          className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 py-3 px-5 rounded-lg shadow-xl text-white animate-slideUp z-50 flex items-center max-w-xs sm:max-w-sm md:max-w-md
                     ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <div className={`w-6 h-6 mr-3 flex-shrink-0 rounded-full ${toastType === 'success' ? 'bg-green-400' : 'bg-red-400'} flex items-center justify-center`}>
            {toastType === 'success' ? (
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ScreenshotButton; 