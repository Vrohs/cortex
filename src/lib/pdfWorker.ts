import { pdfjs } from 'react-pdf';

// Centralized PDF.js worker configuration
// This ensures we set the worker only once and with the correct version

let workerConfigured = false;

export const configurePDFWorker = () => {
  // Only configure once
  if (workerConfigured || typeof window === 'undefined') {
    return;
  }

  // Get the exact version that react-pdf is using
  const pdfVersion = pdfjs.version;
  console.log(`Configuring PDF.js worker for version: ${pdfVersion}`);

  // Set the worker source to match the exact version
  const workerSources = [
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.js`,
    `https://unpkg.com/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.js`,
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfVersion}/build/pdf.worker.min.js`,
    // Fallback to protocol-relative URL
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.js`
  ];

  let currentWorkerIndex = 0;

  const setWorker = (index: number) => {
    if (index < workerSources.length) {
      const workerUrl = workerSources[index];
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      console.log(`PDF.js worker set to: ${workerUrl}`);
      return true;
    }
    return false;
  };

  // Set initial worker
  setWorker(0);

  // Enhanced error handling for version mismatches
  const originalConsoleError = console.error as (...args: any[]) => void;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Check for version mismatch or worker loading errors
    if (message.includes('does not match the Worker version') || 
        message.includes('Setting up fake worker failed') ||
        message.includes('Failed to fetch dynamically imported module')) {
      
      currentWorkerIndex++;
      if (currentWorkerIndex < workerSources.length) {
        console.log(`Worker failed, trying fallback ${currentWorkerIndex + 1}/${workerSources.length}`);
        setWorker(currentWorkerIndex);
        
        // Don't show the error for fallback attempts
        return;
      } else {
        console.error('All PDF worker sources failed, showing original error:');
      }
    }
    
    // Call original console.error for all other messages
    originalConsoleError(...args);
  };

  workerConfigured = true;
};

// Auto-configure when this module is imported
configurePDFWorker(); 