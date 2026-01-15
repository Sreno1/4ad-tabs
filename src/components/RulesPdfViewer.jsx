import React, { useState } from 'react';
import { Book, ExternalLink } from 'lucide-react';

// PDF links (with correct base path for GitHub Pages)
const BASE_PATH = '/4ad-tabs';
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
  
  const pdfUrl = `${BASE_PATH}/${selectedPdf.file}`;
  
  return (
    <div className="flex flex-col h-full">
      {/* PDF Selection */}
      <div className="bg-slate-900 p-3 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-2">
          <Book size={14} />
          Rules PDFs
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {PDF_LINKS.map((pdf) => (
            <button
              key={pdf.file}
              onClick={() => setSelectedPdf(pdf)}
              className={`px-2 py-1.5 text-xs rounded transition-colors ${
                selectedPdf.file === pdf.file
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300'
              }`}
            >
              {pdf.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* PDF Viewer Header */}
      <div className="bg-slate-800 px-3 py-2 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Book size={16} />
          {selectedPdf.name}
        </h3>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-amber-400 text-xs px-2 py-1 border border-slate-600 rounded flex items-center gap-1"
        >
          <ExternalLink size={12} />
          New Tab
        </a>
      </div>
      
      {/* PDF Embed */}
      <div className="flex-1 overflow-hidden bg-slate-900">
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={selectedPdf.name}
        />
      </div>
    </div>
  );
}
