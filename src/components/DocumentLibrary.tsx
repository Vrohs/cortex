import { useState } from 'react';
import { PDFDocument } from '@/types';

interface DocumentLibraryProps {
  documents: PDFDocument[];
  onDocumentSelect: (document: PDFDocument) => void;
  onDocumentDelete: (documentId: string) => void;
}

const DocumentLibrary = ({ 
  documents, 
  onDocumentSelect, 
  onDocumentDelete 
}: DocumentLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Your Documents</h2>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <input 
            type="search" 
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {documents.length === 0 
              ? 'Upload your first PDF to get started!' 
              : 'No documents match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map(doc => (
            <div 
              key={doc.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div 
                className="flex-1"
                onClick={() => onDocumentSelect(doc)}
              >
                <h3 className="font-medium text-gray-900 dark:text-white truncate" title={doc.title}>
                  {doc.title}
                </h3>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{doc.pageCount} pages</span>
                  <span className="mx-2">•</span>
                  <span>Last opened: {formatDate(doc.lastOpened)}</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full" 
                    style={{ width: `${(doc.currentPage / doc.pageCount) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button 
                onClick={() => onDocumentDelete(doc.id)}
                className="ml-2 p-1 text-gray-500 hover:text-red-500 focus:outline-none"
                title="Delete document"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentLibrary;
