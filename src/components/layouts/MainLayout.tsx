"use client";

import { useState, useEffect } from 'react';
import { useReaderSettings } from '@/contexts/ReaderSettingsContext';
import PDFViewer from '@/components/PDFViewer';
import SettingsPanel from '@/components/SettingsPanel';
import FileUpload from '@/components/FileUpload';
import DocumentLibrary from '@/components/DocumentLibrary';
import { PDFDocument, ReaderStats } from '@/types';

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
  const { settings } = useReaderSettings();
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [documents, setDocuments] = useState<PDFDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<PDFDocument | null>(null);
  const [readerStats, setReaderStats] = useState<ReaderStats>({
    wordsPerMinute: 0,
    readingTime: 0,
    completionPercentage: 0,
    pagesRead: 0,
  });
  
  // Load documents from localStorage on client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDocuments = localStorage.getItem('pdfDocuments');
      if (savedDocuments) {
        setDocuments(JSON.parse(savedDocuments));
      } else {
        // Use sample PDFs for first-time users
        setDocuments(samplePdfs as PDFDocument[]);
      }
    }
  }, []);
  
  // Save documents to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && documents.length > 0) {
      localStorage.setItem('pdfDocuments', JSON.stringify(documents));
    }
  }, [documents]);
  
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
  
  return (
    <div 
      className="min-h-screen flex flex-col"
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            <div className="lg:col-span-3 h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {typeof currentDocument.file === 'string' ? (
                <PDFViewer 
                  pdfUrl={currentDocument.file} 
                  initialPage={currentDocument.currentPage}
                  onPageChange={handlePageChange}
                />
              ) : (
                <PDFViewer 
                  pdfUrl={URL.createObjectURL(currentDocument.file)} 
                  initialPage={currentDocument.currentPage}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Document Info */}
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
              
              {/* Back to Library Button */}
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
      
      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
