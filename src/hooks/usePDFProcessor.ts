import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { PDFDocument, ReaderStats } from '@/types';

// Ensure PDF.js worker is set
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface UsePDFProcessorProps {
  document: PDFDocument | null;
  onStatsUpdate?: (stats: ReaderStats) => void;
}

interface UsePDFProcessorResult {
  loading: boolean;
  error: Error | null;
  documentInfo: {
    pageCount: number;
    title: string;
    author: string;
  } | null;
  processFile: (file: File) => Promise<PDFDocument>;
}

export const usePDFProcessor = ({ 
  document, 
  onStatsUpdate 
}: UsePDFProcessorProps): UsePDFProcessorResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{
    pageCount: number;
    title: string;
    author: string;
  } | null>(null);
  
  // Process PDF when document changes
  useEffect(() => {
    if (!document) return;
    
    const processDocument = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fileUrl = typeof document.file === 'string' 
          ? document.file 
          : URL.createObjectURL(document.file);
        
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        
        // Get document metadata
        const metadata = await pdf.getMetadata();
        
        // Update document info
        const info = {
          pageCount: pdf.numPages,
          title: metadata.info?.Title || document.title,
          author: metadata.info?.Author || document.author || 'Unknown',
        };
        
        setDocumentInfo(info);
        
        // Calculate reading stats
        if (onStatsUpdate) {
          // This is a simplified calculation - in a real app, you would track actual reading time
          const avgWordsPerPage = 250; // assumption
          const totalWords = avgWordsPerPage * pdf.numPages;
          const avgReadingSpeed = 200; // words per minute
          const estimatedReadingTime = totalWords / avgReadingSpeed * 60; // in seconds
          
          onStatsUpdate({
            wordsPerMinute: avgReadingSpeed,
            readingTime: document.currentPage * (estimatedReadingTime / pdf.numPages),
            completionPercentage: (document.currentPage / pdf.numPages) * 100,
            pagesRead: document.currentPage,
          });
        }
      } catch (err) {
        console.error('Error processing PDF:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    processDocument();
  }, [document, onStatsUpdate]);
  
  // Process a new PDF file
  const processFile = async (file: File): Promise<PDFDocument> => {
    setLoading(true);
    setError(null);
    
    try {
      const fileUrl = URL.createObjectURL(file);
      const loadingTask = pdfjs.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      
      // Get document metadata
      const metadata = await pdf.getMetadata();
      
      // Create new PDFDocument
      const newDocument: PDFDocument = {
        id: crypto.randomUUID(),
        title: metadata.info?.Title || file.name.replace('.pdf', ''),
        author: metadata.info?.Author || 'Unknown',
        pageCount: pdf.numPages,
        currentPage: 1,
        file: file,
        lastOpened: new Date(),
      };
      
      return newDocument;
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    loading,
    error,
    documentInfo,
    processFile,
  };
};
