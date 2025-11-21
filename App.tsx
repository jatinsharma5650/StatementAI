import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { SummaryCards } from './components/SummaryCards';
import { ChartSection } from './components/ChartSection';
import { TransactionTable } from './components/TransactionTable';
import { processFilesForGemini } from './utils/pdfUtils';
import { analyzeBankStatement } from './services/geminiService';
import { AnalysisResult, ProcessingStatus } from './types';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    setStatus('converting');
    setError(null);
    setResult(null);

    try {
      // 1. Convert files to Gemini-friendly format (Base64 images)
      const imageParts = await processFilesForGemini(files);
      
      if (imageParts.length === 0) {
        throw new Error("No valid image data could be extracted.");
      }

      setStatus('analyzing');
      
      // 2. Send to Gemini
      const analysisData = await analyzeBankStatement(imageParts);
      
      setResult(analysisData);
      setStatus('complete');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Section */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Financial clarity in seconds
          </h2>
          <p className="mt-2 text-lg text-gray-600 max-w-2xl">
            Upload your PDF bank statements or images. Our AI extracts every transaction, categorizes it, and builds a dashboard instantly.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <FileUploader onUpload={handleUpload} status={status} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {status === 'complete' && result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {result.transactions.length} Transactions Found
                </span>
             </div>
             
             <SummaryCards data={result.summary} />
             <ChartSection transactions={result.transactions} />
             <TransactionTable transactions={result.transactions} />
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} StatementAI. All data is processed in memory and not stored.</p>
        </div>
      </footer>
    </div>
  );
}