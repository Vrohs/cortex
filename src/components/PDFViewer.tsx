import { useRef, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';
import { vibratePageTurn } from '@/utils/hapticFeedback';
import { configurePDFWorker } from '@/lib/pdfWorker';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Ensure PDF worker is configured
configurePDFWorker();

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

  useEffect(() => {
    setScale(settings.magnificationLevel);
  }, [settings.magnificationLevel]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const goToNextPage = () => {
    if (pageNumber < (numPages || 0)) {
      if (settings.isHapticFeedbackEnabled) {
        vibratePageTurn();
      }
      setPageNumber(pageNumber + 1);
      if (onPageChange) onPageChange(pageNumber + 1);
    }
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      if (settings.isHapticFeedbackEnabled) {
        vibratePageTurn();
      }
      setPageNumber(pageNumber - 1);
      if (onPageChange) onPageChange(pageNumber - 1);
    }
  };

  const getTextStylesCSS = () => {
    return {
      letterSpacing: `${settings.letterSpacingPercentage * 0.01}em`,
      lineHeight: `${settings.lineSpacingMultiplier}`,
      color: settings.isDarkMode ? '#E6E6E6' : '#121212',
      backgroundColor: settings.isDarkMode ? '#121212' : '#FFFFFF',
    };
  };

  const getPeripheralDarknessCss = () => {
    if (!settings.isDarknessGradientEnabled) return {};
    
    const windowSizePercent = settings.lineWindowSize * 5;
    
    return {
      position: 'relative' as const,
      WebkitMaskImage: `linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.05),
        rgba(0, 0, 0, 1) 10%,
        rgba(0, 0, 0, 1) ${50 - settings.lineWindowSize * 5}%,
        rgba(0, 0, 0, 1) ${50 + settings.lineWindowSize * 5}%,
        rgba(0, 0, 0, 1) 90%,
        rgba(0, 0, 0, 0.05)
      )`
    };
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages]);

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
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="loader"></div>
        </div>
      )}

      {settings.isStabilizerBarEnabled && (
        <div
          className="absolute left-1/2 h-0.5 bg-blue-500 z-10"
          style={{
            width: '15%', 
            transform: 'translateX(-50%)',
            top: '50%',
            opacity: 0.5,
            backgroundColor: settings.isDarkMode ? '#3B82F6' : '#1D4ED8',
          }}
        ></div>
      )}
      
      {settings.isDarknessGradientEnabled && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(
              to bottom,
              rgba(0, 0, 0, ${settings.peripheralDarknessLevel / 100}) 0%,
              rgba(0, 0, 0, 0) ${50 - settings.lineWindowSize * 5}%,
              rgba(0, 0, 0, 0) ${50 + settings.lineWindowSize * 5}%,
              rgba(0, 0, 0, ${settings.peripheralDarknessLevel / 100}) 100%
            )`,
          }}
        ></div>
      )}

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
          renderTextLayer={true}
          renderAnnotationLayer={true}
        />
      </Document>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between bg-opacity-50 bg-gray-900">
        <button
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Previous
        </button>
        <div className="text-center text-white">
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
