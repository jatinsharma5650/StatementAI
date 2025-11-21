import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ProcessingStatus } from '../types';

interface FileUploaderProps {
  onUpload: (files: File[]) => void;
  status: ProcessingStatus;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, status }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (status !== 'idle' && status !== 'error' && status !== 'complete') return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files);
    }
  }, [onUpload, status]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
    }
  }, [onUpload]);

  const isLoading = status === 'converting' || status === 'analyzing';

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-white'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept=".pdf,image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center space-y-4">
        <div className={`p-4 rounded-full ${isLoading ? 'bg-indigo-100' : 'bg-gray-100'}`}>
          {status === 'converting' ? (
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          ) : status === 'analyzing' ? (
            <div className="relative">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-indigo-600 rounded-full animate-ping" />
              </div>
            </div>
          ) : (
            <UploadCloud className="h-8 w-8 text-gray-600" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {status === 'converting' ? 'Processing PDF Pages...' :
             status === 'analyzing' ? 'Gemini is reading your statement...' :
             'Upload Bank Statement'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {status === 'idle' || status === 'error' || status === 'complete' 
              ? 'Drag & drop PDF or Images, or click to browse' 
              : 'This may take a few moments for multi-page documents'}
          </p>
        </div>

        <div className="flex space-x-4 text-xs text-gray-400">
          <div className="flex items-center">
            <FileText className="h-3 w-3 mr-1" /> PDF Support
          </div>
          <div className="flex items-center">
            <ImageIcon className="h-3 w-3 mr-1" /> JPG / PNG
          </div>
        </div>
      </div>
    </div>
  );
};