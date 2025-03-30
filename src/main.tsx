import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css' // Tailwind directives

// Error boundary for the entire app
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="mb-4 text-gray-700">
              We're sorry, but there was an error loading the application. 
              Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="mt-4 p-3 bg-gray-100 rounded text-left overflow-auto text-sm">
                <p className="font-mono text-red-800">{this.state.error.toString()}</p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Make sure the root element exists
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render React application:", error);
    
    // Show error in the DOM if React fails to initialize
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2 style="color: #d32f2f;">Application Failed to Load</h2>
        <p>There was a problem initializing the application. Please try refreshing the page.</p>
        <pre style="background: #f5f5f5; padding: 10px; text-align: left; margin-top: 20px; overflow: auto;">${error}</pre>
      </div>
    `;
  }
} else {
  console.error("Root element not found. Cannot mount React application.");
}

// Hide the loading spinner
const hideLoadingSpinner = () => {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) {
    spinner.style.opacity = '0';
    setTimeout(() => {
      spinner.style.display = 'none';
    }, 500);
  }
};

// Hide loading spinner when React has rendered
setTimeout(hideLoadingSpinner, 1500); 