import { useRef, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';
import { vibratePageTurn, vibrateChapterBreak } from '@/utils/hapticFeedback';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  initialPage?: number;
  onPageChange?: (pageNumber: number) => void;
}

const PDFViewer = ({ pdfUrl, initialPage = 1, onPageChange }: PDFViewerProps) => {
  const { settings } = useReaderSettings();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(settings.magnificationLevel);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Update scale when magnification level changes
  useEffect(() => {
    setScale(settings.magnificationLevel);
  }, [settings.magnificationLevel]);

  // Handle document loading success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  // Navigate to the next page
  const goToNextPage = () => {
    if (pageNumber < (numPages || 0)) {
      if (settings.isHapticFeedbackEnabled) {
        vibratePageTurn();
      }
      setPageNumber(pageNumber + 1);
      if (onPageChange) onPageChange(pageNumber + 1);
    }
  };

  // Navigate to the previous page
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      if (settings.isHapticFeedbackEnabled) {
        vibratePageTurn();
      }
      setPageNumber(pageNumber - 1);
      if (onPageChange) onPageChange(pageNumber - 1);
    }
  };

  // Calculate text presentation styles based on settings
  const getTextStylesCSS = () => {
    return {
      letterSpacing: `${settings.letterSpacingPercentage * 0.01}em`,
      lineHeight: `${settings.lineSpacingMultiplier}`,
      color: settings.isDarkMode ? '#E6E6E6' : '#121212',
      backgroundColor: settings.isDarkMode ? '#121212' : '#FFFFFF',
    };
  };

  // Calculate the peripheral darkness gradient
  const getPeripheralDarknessCss = () => {
    if (!settings.isDarknessGradientEnabled) return {};
    
    const darknessLevel = settings.peripheralDarknessLevel / 100;
    
    return {
      maskImage: `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.05),
        rgba(0, 0, 0, 1) 10%,
        rgba(0, 0, 0, 1) ${50 - settings.lineWindowSize * 5}%,
        rgba(0, 0, 0, 1) ${50 + settings.lineWindowSize * 5}%,
        rgba(0, 0, 0, 1) 90%,
        rgba(0, 0, 0, 0.05)
      )`,
      WebkitMaskImage: `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.05),
        rgba(0, 0, 0, 1) 10%,
        rgba(0, 0, 0, 1) ${50 - settings.lineWindowSize * 5}%,
        rgba(0, 0, 0, 1) ${50 + settings.lineWindowSize * 5}%,
        rgba(0, 0, 0, 1) 90%,
        rgba(0, 0, 0, 0.05)
      )`,
    };
  };

  return (
    <div
      ref={viewerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        ...getTextStylesCSS(),
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        transition: `transform ${settings.scrollAnimationDuration}ms ease-out`,
      }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Horizontal stabilizer bar (15% width) */}
      {settings.isStabilizerBarEnabled && (
        <div 
          className="absolute left-1/2 h-0.5 bg-blue-500 opacity-30 z-10"
          style={{ 
            width: '15%', 
            transform: 'translateX(-50%)',
            top: 'calc(50% - 1px)',
          }}
        ></div>
      )}

      {/* PDF Document */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pageNumber}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: settings.scrollAnimationDuration / 1000 }}
          className="flex justify-center"
          style={getPeripheralDarknessCss()}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-center py-10">Loading PDF...</div>}
            error={<div className="text-center py-10 text-red-500">Failed to load PDF</div>}
            className="pdf-document"
          >
            <Page
              pageNumber={pageNumber}
              width={viewerRef.current?.clientWidth || 600}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
            />
          </Document>
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between bg-opacity-50 bg-gray-900">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Previous
        </button>
        <div className="text-center">
          Page {pageNumber} of {numPages}
        </div>
        <button
          onClick={goToNextPage}
          disabled={pageNumber >= (numPages || 0)}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;
