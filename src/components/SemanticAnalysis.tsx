import { useState, useEffect } from 'react';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';

interface SemanticAnalysisProps {
  pdfUrl: string;
  currentPage: number;
  isVisible: boolean;
}

interface ConceptMapItem {
  concept: string;
  relatedConcepts: string[];
}

interface SemanticChunk {
  text: string;
  importance: number;
}

interface ProcessedContent {
  conceptMap: ConceptMapItem[];
  semanticChunks: SemanticChunk[];
  estimatedReadingTime: number;
}

// Mock data for demonstration purposes
const getMockData = (): ProcessedContent => {
  return {
    conceptMap: [
      { 
        concept: 'neural adaptation',
        relatedConcepts: ['reading', 'cognition', 'performance']
      },
      {
        concept: 'visual processing',
        relatedConcepts: ['perception', 'attention', 'saccades']
      },
      {
        concept: 'academic reading',
        relatedConcepts: ['comprehension', 'retention', 'analysis']
      }
    ],
    semanticChunks: [
      {
        text: "Neural adaptation refers to the brain's ability to adjust to changing sensory inputs over time, leading to enhanced processing efficiency.",
        importance: 90
      },
      {
        text: "Studies show that optimized text presentation can increase reading speed by up to 30% while maintaining comprehension levels.",
        importance: 75
      },
      {
        text: "The dynamic line window feature is based on research about the perceptual span during reading, which is typically 14-15 characters rightward of fixation.",
        importance: 85
      },
      {
        text: "By gradually expanding reading capacity over 2-4 weeks, neural adaptation strengthens dorsal-ventral stream connectivity.",
        importance: 70
      }
    ],
    estimatedReadingTime: 180 // 3 minutes
  };
};

const SemanticAnalysis = ({ pdfUrl, currentPage, isVisible }: SemanticAnalysisProps) => {
  const { settings } = useReaderSettings();
  const [processedContent, setProcessedContent] = useState<ProcessedContent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isVisible) return;
    
    setIsProcessing(true);
    
    // In a real implementation, this would call an API or process the PDF
    setTimeout(() => {
      try {
        const data = getMockData();
        setProcessedContent(data);
        setIsProcessing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error processing document');
        setIsProcessing(false);
      }
    }, 1500);
    
  }, [pdfUrl, currentPage, isVisible]);
  
  // Only show if academic reading mode is enabled
  if (!settings.isAcademicReadingModeEnabled || !isVisible) return null;
  
  return (
    <div 
      className={`semantic-analysis-container ${isProcessing ? 'loading' : ''}`}
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '300px',
        height: '100%',
        backgroundColor: settings.isDarkMode ? '#121212' : '#f5f5f5',
        color: settings.isDarkMode ? '#e6e6e6' : '#121212',
        boxShadow: settings.isDarkMode 
          ? '-4px 0 8px rgba(0, 0, 0, 0.5)' 
          : '-2px 0 5px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
        overflowY: 'auto',
        transition: 'transform 0.3s ease-in-out',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        zIndex: 20
      }}
    >
      <h3 className="text-lg font-semibold mb-4">Semantic Analysis</h3>
      
      {isProcessing && (
        <div className="flex items-center justify-center h-32">
          <div className="loader">Processing page content...</div>
        </div>
      )}
      
      {error && (
        <div className="error-message p-3 rounded bg-red-100 text-red-800">
          {error}
        </div>
      )}
      
      {processedContent && !isProcessing && (
        <div className="space-y-6">
          {/* Key Concepts Section */}
          <div className="concept-map mb-6">
            <h4 className="text-md font-medium mb-2">Key Concepts</h4>
            <div className="concept-network p-3 rounded" 
              style={{ 
                backgroundColor: settings.isDarkMode ? '#1e1e1e' : '#ffffff',
                border: `1px solid ${settings.isDarkMode ? '#333' : '#ddd'}`
              }}
            >
              {processedContent.conceptMap.map((item, index) => (
                <div key={index} className="concept-item mb-3">
                  <div className="font-medium">{item.concept}</div>
                  {item.relatedConcepts.length > 0 && (
                    <div className="ml-4 mt-1 text-sm opacity-80">
                      Related: {item.relatedConcepts.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Semantic Chunks Section */}
          <div className="semantic-chunks">
            <h4 className="text-md font-medium mb-2">Key Passages</h4>
            <div className="chunks-list space-y-3">
              {processedContent.semanticChunks
                .filter(chunk => chunk.importance > 60)
                .map((chunk, index) => (
                  <div 
                    key={index} 
                    className="chunk-item p-2 rounded" 
                    style={{
                      backgroundColor: settings.isDarkMode 
                        ? `rgba(255, 255, 255, ${chunk.importance / 200})` 
                        : `rgba(0, 0, 0, ${chunk.importance / 500})`,
                      borderLeft: `3px solid rgba(66, 135, 245, ${chunk.importance / 100})`
                    }}
                  >
                    {chunk.text}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Reading Time Estimate */}
          <div className="reading-time mt-6 text-sm opacity-80">
            <div>Estimated reading time: {Math.ceil(processedContent.estimatedReadingTime / 60)} minutes</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemanticAnalysis;
