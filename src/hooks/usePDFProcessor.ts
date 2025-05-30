import { useState, useEffect } from 'react';
import { pdfjs } from 'react-pdf';
import { PDFDocument, ReaderStats } from '@/types';

// Configure PDF.js worker - use exact version for compatibility
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  // Use the exact version that react-pdf uses for compatibility
  const pdfVersion = pdfjs.version || '4.8.69';
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfVersion}/pdf.worker.min.js`;
  console.log(`PDF Processor using worker version: ${pdfVersion}`);
}

interface UsePDFProcessorProps {
  pdfUrl: string | null;
  currentPage: number;
}

interface ProcessedPDFContent {
  text: string;
  semanticChunks: { text: string; importance: number }[];
  conceptMap: { concept: string; relatedConcepts: string[] }[];
  estimatedReadingTime: number; // in seconds
}

export const usePDFPageProcessor = ({ pdfUrl, currentPage }: UsePDFProcessorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedContent, setProcessedContent] = useState<ProcessedPDFContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfUrl || currentPage <= 0) return;

    const processPDFPage = async () => {
      setIsProcessing(true);
      setError(null);

      try {
        // Load the PDF document
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        // Get the specified page
        const page = await pdf.getPage(currentPage);
        
        // Extract text content
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        // Process semantic chunks (simple implementation - in production would use NLP)
        const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [];
        const semanticChunks = sentences.map((sentence, index) => {
          // For demonstration - would use proper NLP in production
          // Calculate importance based on sentence length, keyword presence, etc.
          const importance = Math.min(
            100, 
            Math.max(
              20, 
              (sentence.length / 20) * (sentence.includes('the') ? 0.8 : 1.2)
            )
          );
          
          return {
            text: sentence.trim(),
            importance
          };
        });

        // Generate concept map (simplified implementation)
        // In production, would use proper NLP for entity extraction and relationship mapping
        const words = pageText.toLowerCase().split(/\W+/).filter(word => 
          word.length > 4 && !['about', 'these', 'those', 'their', 'there'].includes(word)
        );
        
        const wordFrequency: Record<string, number> = {};
        words.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });

        // Get top concepts
        const concepts = Object.entries(wordFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([word]) => word);

        // Create simple relationships between concepts
        const conceptMap = concepts.map(concept => {
          // Find related concepts (simple co-occurrence within 5 words)
          const relatedConcepts = concepts.filter(c => 
            c !== concept && 
            pageText.toLowerCase().includes(`${concept} ${c}`) || 
            pageText.toLowerCase().includes(`${c} ${concept}`)
          );

          return {
            concept,
            relatedConcepts: relatedConcepts.slice(0, 3) // Limit to 3 related concepts
          };
        });

        // Calculate estimated reading time
        // Average adult reading speed: ~250 words per minute
        const wordCount = pageText.split(/\s+/).length;
        const estimatedReadingTime = Math.ceil(wordCount / 250) * 60; // in seconds

        setProcessedContent({
          text: pageText,
          semanticChunks,
          conceptMap,
          estimatedReadingTime
        });
      } catch (err) {
        console.error('Error processing PDF:', err);
        setError('Failed to process PDF content');
      } finally {
        setIsProcessing(false);
      }
    };

    processPDFPage();
  }, [pdfUrl, currentPage]);

  return {
    isProcessing,
    processedContent,
    error
  };
};

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
          title: (metadata.info as Record<string, any>)?.['Title'] || document.title,
          author: (metadata.info as Record<string, any>)?.['Author'] || document.author || 'Unknown',
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
        title: (metadata.info as Record<string, any>)?.Title || file.name.replace('.pdf', ''),
        author: (metadata.info as Record<string, any>)?.Author || 'Unknown',
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
