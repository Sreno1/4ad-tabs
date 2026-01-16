import React, { useState } from 'react';
import { Book, ExternalLink, AlertTriangle } from 'lucide-react';

// PDF links - using Vite's automatic base path
const PDF_LINKS = [
  { name: 'Base Rules', file: 'base rules.pdf' },
  { name: 'Characters', file: 'characters.pdf' },
  { name: 'Combat', file: 'combat.pdf' },
  { name: 'Equipment', file: 'equipment.pdf' },
  { name: 'Exploration', file: 'exploration.pdf' },
  { name: 'Magic', file: 'magic.pdf' },
  { name: 'Saves', file: 'saves.pdf' },
  { name: 'Tables', file: 'tables.pdf' },
  { name: 'Full Rules', file: 'rules.pdf' }
];

export default function RulesPdfViewer() {
  const [selectedPdf, setSelectedPdf] = useState(PDF_LINKS[8]); // Default to Full Rules
  const [pdfError, setPdfError] = useState(false);

  // Use Vite's BASE_URL which is automatically set based on environment
  // Development: "/" | Production: "/4ad-tabs/"
  const pdfUrl = `${import.meta.env.BASE_URL}${selectedPdf.file}`;

  const handlePdfError = () => {
    setPdfError(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* PDF Selection */}
      <div className="bg-slate-900 p-3 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Book size={14} aria-hidden="true" />
          Rules PDFs
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {PDF_LINKS.map((pdf) => (
            <button
              key={pdf.file}
              onClick={() => {
                setSelectedPdf(pdf);
                setPdfError(false);
              }}
              className={`px-2 py-1.5 text-xs rounded transition-colors ${
                selectedPdf.file === pdf.file
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300'
              }`}
              aria-label={`View ${pdf.name} PDF`}
            >
              {pdf.name}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Viewer Header */}
      <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Book size={16} aria-hidden="true" />
          {selectedPdf.name}
        </h3>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-amber-400 text-xs px-2 py-1 border border-slate-600 rounded flex items-center gap-1"
          aria-label={`Open ${selectedPdf.name} in new tab`}
        >
          <ExternalLink size={12} aria-hidden="true" />
          New Tab
        </a>
      </div>

      {/* PDF Embed or Error Message */}
      <div className="flex-1 overflow-hidden bg-slate-900">
        {pdfError ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertTriangle className="text-amber-500 mb-4" size={48} />
            <h3 className="text-lg font-bold text-amber-400 mb-2">PDF Failed to Load</h3>
            <p className="text-slate-400 text-sm mb-4">
              The PDF file could not be displayed in the embedded viewer.
            </p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
              aria-label={`Open ${selectedPdf.name} in new tab`}
            >
              <ExternalLink size={16} aria-hidden="true" />
              Open in New Tab
            </a>
            <p className="text-slate-500 text-xs mt-4">
              Some browsers block embedded PDFs. Try opening in a new tab instead.
            </p>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={selectedPdf.name}
            onError={handlePdfError}
          />
        )}
      </div>
    </div>
  );
}
