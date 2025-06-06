"use client";

import { useState, useEffect } from 'react';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';
import PDFViewer from '@/components/PDFViewer';
import SettingsPanel from '@/components/SettingsPanel';
import FileUpload from '@/components/FileUpload';
import DocumentLibrary from '@/components/DocumentLibrary';
import SemanticAnalysis from '@/components/SemanticAnalysis';
import CalibrationPanel from '@/components/CalibrationPanel';
import NeuralAdaptationProgress from '@/components/NeuralAdaptationProgress';
import { useNeuralAdaptation } from '@/hooks/useNeuralAdaptation';
import { PDFDocument, ReaderStats, CalibrationResult } from '@/types';
import { configurePDFWorker } from '@/lib/pdfWorker';

// Ensure PDF worker is configured early
configurePDFWorker();

// Sample PDFs for testing
const samplePdfs = [
  {
    id: 'sample-1',
    title: 'Sample PDF Document',
    author: 'PDF Author',
    pageCount: 10,
    currentPage: 1,
    file: 'https://arxiv.org/pdf/2104.13478.pdf',
  },
];

const MainLayout = () => {
  const { settings, updateSettings } = useReaderSettings();
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isCalibrationPanelOpen, setIsCalibrationPanelOpen] = useState(false);
  const [isSemanticAnalysisOpen, setIsSemanticAnalysisOpen] = useState(false);
  const [documents, setDocuments] = useState<PDFDocument[]>(samplePdfs as PDFDocument[]);
  const [currentDocument, setCurrentDocument] = useState<PDFDocument | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [readerStats, setReaderStats] = useState<ReaderStats>({
    wordsPerMinute: 0,
    readingTime: 0,
    completionPercentage: 0,
    pagesRead: 0,
  });
  
  // Neural adaptation tracking
  const { adaptationProgress, daysRemaining } = useNeuralAdaptation({
    settings,
    updateSettings,
  });
  
  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Load documents from localStorage on client-side only after hydration
  useEffect(() => {
    if (isHydrated) {
      const savedDocuments = localStorage.getItem('pdfDocuments');
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments));
      }
    }
  }, [isHydrated]);
  
  // Save documents to localStorage when they change
  useEffect(() => {
    if (isHydrated && documents.length > 0) {
      localStorage.setItem('pdfDocuments', JSON.stringify(documents));
    }
  }, [documents, isHydrated]);
  
  // Handle file upload
  const handleFileUpload = (document: PDFDocument) => {
    const newDocuments = [...documents, document];
    setDocuments(newDocuments);
    setCurrentDocument(document);
  };
  
  // Handle document selection
  const handleDocumentSelect = (document: PDFDocument) => {
    setCurrentDocument(document);
  };
  
  // Handle document deletion
  const handleDocumentDelete = (documentId: string) => {
    const newDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(newDocuments);
    
    if (currentDocument && currentDocument.id === documentId) {
      setCurrentDocument(newDocuments.length > 0 ? newDocuments[0] : null);
    }
  };
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (currentDocument) {
      const updatedDocument = { ...currentDocument, currentPage: pageNumber };
      setCurrentDocument(updatedDocument);
      
      // Update in documents array
      const newDocuments = documents.map(doc => 
        doc.id === currentDocument.id ? updatedDocument : doc
      );
      setDocuments(newDocuments);
      
      // Update stats
      setReaderStats(prev => ({
        ...prev,
        pagesRead: Math.max(prev.pagesRead, pageNumber),
        completionPercentage: (pageNumber / currentDocument.pageCount) * 100,
      }));
    }
  };
  
  function handleCalibrationComplete(result: CalibrationResult): void {
    // Store calibration results in localStorage for future use
    if (isHydrated) {
      localStorage.setItem('calibrationResults', JSON.stringify(result));
    }

    // Apply calibration-specific settings based on results
    // Lower fixation stability might need larger stabilizer bars and slower scrolling
    if (result.fixationStability < 70) {
      updateSettings({
        scrollAnimationDuration: 400, // Slower scrolling
        isStabilizerBarEnabled: true,
      });
    }
    
    // Higher crowding threshold means we need more spacing
    if (result.crowdingThreshold > 50) {
      updateSettings({
        letterSpacingPercentage: Math.max(35, result.crowdingThreshold * 0.7),
        lineSpacingMultiplier: 2.0,
      });
    }
    
    // Preferred saccade amplitude affects line window size
    if (result.preferredSaccadeAmplitude < 3) {
      updateSettings({
        lineWindowSize: 3, // Smaller window for shorter saccades
      });
    } else if (result.preferredSaccadeAmplitude > 5) {
      updateSettings({
        lineWindowSize: 7, // Larger window for longer saccades
      });
    }
    
    setIsCalibrationPanelOpen(false);
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      suppressHydrationWarning={true}
      style={{
        backgroundColor: settings.isDarkMode ? '#121212' : '#FFFFFF',
        color: settings.isDarkMode ? '#E6E6E6' : '#121212',
      }}
    >
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Neurologically Optimized PDF Reader
          </h1>
          <button
            onClick={() => setIsSettingsPanelOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" suppressHydrationWarning>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {!currentDocument ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Upload PDF</h2>
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
            
            <div>
              <DocumentLibrary 
                documents={documents} 
                onDocumentSelect={handleDocumentSelect} 
                onDocumentDelete={handleDocumentDelete}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* PDF Viewer */}
            <div className="lg:col-span-3 h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden relative">
              {currentDocument && typeof currentDocument.file === 'string' ? (
                <PDFViewer 
                  pdfUrl={currentDocument.file} 
                  initialPage={currentDocument.currentPage}
                  onPageChange={handlePageChange}
                />
              ) : currentDocument && currentDocument.file instanceof File ? (
                <PDFViewer 
                  pdfUrl={URL.createObjectURL(currentDocument.file)} 
                  initialPage={currentDocument.currentPage}
                  onPageChange={handlePageChange}
                />
              ) : null}
              
              {/* Semantic Analysis Panel (conditionally rendered if Academic Reading Mode is enabled) */}
              {settings.isAcademicReadingModeEnabled && currentDocument && (
                <SemanticAnalysis 
                  pdfUrl={typeof currentDocument.file === 'string' 
                    ? currentDocument.file 
                    : currentDocument.file instanceof File ? URL.createObjectURL(currentDocument.file) : ''
                  }
                  currentPage={currentDocument.currentPage}
                  isVisible={isSemanticAnalysisOpen}
                />
              )}
              
              {/* Toggle button for Semantic Analysis */}
              {settings.isAcademicReadingModeEnabled && (
                <button
                  onClick={() => setIsSemanticAnalysisOpen(prev => !prev)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="Toggle Semantic Analysis"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" suppressHydrationWarning>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </button>
              )}
            </div>
      
            <div className="space-y-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Document Info</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
                    <p className="font-medium">{currentDocument.title}</p>
                  </div>
                  {currentDocument.author && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
                      <p className="font-medium">{currentDocument.author}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pages</p>
                    <p className="font-medium">{currentDocument.currentPage} of {currentDocument.pageCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(currentDocument.currentPage / currentDocument.pageCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reading Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Reading Stats</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reading Speed</p>
                    <p className="font-medium">{readerStats.wordsPerMinute} WPM</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
                    <p className="font-medium">{Math.floor(readerStats.readingTime / 60)} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
                    <p className="font-medium">{Math.round(readerStats.completionPercentage)}%</p>
                  </div>
                </div>
              </div>
              
              
              {settings.isNeuralAdaptationEnabled && settings.adaptationStartDate && (
                <NeuralAdaptationProgress startDate={settings.adaptationStartDate} />
              )}
              
              
              <button
                onClick={() => setCurrentDocument(null)}
                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Back to Library
              </button>
            </div>
          </div>
        )}
      </main>
      
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        onOpenCalibration={() => setIsCalibrationPanelOpen(true)}
      />
      
      <CalibrationPanel
        isOpen={isCalibrationPanelOpen}
        onClose={() => setIsCalibrationPanelOpen(false)}
        onCalibrationComplete={handleCalibrationComplete}
      />
    </div>
  );
};

export default MainLayout;
