import { useState, useRef } from 'react';
import { PDFDocument } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  onFileUpload: (document: PDFDocument) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };
  
  const handleFileSelection = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Extract document info (in a real app, you'd use PDF.js to get more details)
      const newDocument: PDFDocument = {
        id: uuidv4(),
        title: file.name.replace('.pdf', ''),
        pageCount: 0, // This would be set after processing
        currentPage: 1,
        file: file,
        lastOpened: new Date()
      };
      
      onFileUpload(newDocument);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing your PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="application/pdf"
        className="hidden"
      />
      
      {isProcessing ? (
        <div className="py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your PDF...</p>
        </div>
      ) : (
        <>
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            suppressHydrationWarning={true}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              suppressHydrationWarning={true}
            ></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Drag & drop your PDF here
          </p>
          <p className="mt-2 text-sm text-gray-500">
            or click to browse your files
          </p>
        </>
      )}
    </div>
  );
};

export default FileUpload;
