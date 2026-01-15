import React from 'react';
import { Archive } from 'lucide-react';

export default function Log({ state, dispatch, isBottomPanel = false }) {
  const handleArchive = () => {
    if (state.log.length > 0) {
      dispatch({ type: 'ARCHIVE_LOG' });
    }
  };
    // Bottom panel layout (desktop)
  if (isBottomPanel) {
    return (
      <div className="h-full flex flex-col bg-slate-900">
        {/* Log content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-3 py-2 border-b border-slate-700 bg-slate-800">
            <button 
              onClick={handleArchive}
              disabled={state.log.length === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1"
              title="Archive log and clear"
            >
              <Archive size={12} /> Archive
            </button>
            {state.logArchive && state.logArchive.length > 0 && (
              <div className="text-xs text-slate-500">
                📚 {state.logArchive.length} archived log(s)
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 text-xs space-y-1">
            {state.log.map((entry, index) => (
              <div key={index} className="text-slate-400 border-b border-slate-800 pb-1 font-mono">
                {entry}
              </div>
            ))}
            {state.log.length === 0 && (
              <div className="text-slate-500">Adventure awaits...</div>
            )}
          </div>
        </div>
      </div>
    );
  }
    // Mobile/tablet layout (original)
  return (
    <div className="space-y-3">
      {/* Log Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-amber-400">
            Log ({state.log.length})
          </span>
          <button 
            onClick={handleArchive}
            disabled={state.log.length === 0}
            className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1"
            title="Archive log and clear"
          >
            <Archive size={12} /> Archive
          </button>
        </div>
        
        <div className="bg-slate-800 rounded p-2 max-h-96 md:max-h-[400px] overflow-y-auto text-xs space-y-1">
          {state.log.map((entry, index) => (
            <div key={index} className="text-slate-400 border-b border-slate-700 pb-1">
              {entry}
            </div>
          ))}
          {state.log.length === 0 && (
            <div className="text-slate-500">Adventure awaits...</div>
          )}
        </div>
        
        {/* Archive indicator */}
        {state.logArchive && state.logArchive.length > 0 && (
          <div className="text-xs text-slate-500 text-center">
            📚 {state.logArchive.length} archived log(s) · View in Settings
          </div>
        )}
      </div>
    </div>
  );
}
