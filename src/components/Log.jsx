import React from 'react';
import { Archive } from 'lucide-react';
import { selectLog, selectLogArchive } from '../state/selectors.js';
import { archiveLog } from '../state/actionCreators.js';

export default function Log({ state, dispatch, isBottomPanel = false }) {
  const log = selectLog(state);
  const logArchive = selectLogArchive(state);
  const handleArchive = () => {
    if (log.length > 0) {
  dispatch(archiveLog());
    }
  };
  // Bottom panel layout (desktop)
  if (isBottomPanel) {
    return (
      <div className="h-full flex flex-col bg-slate-900" data-component="log">
        {/* Log content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-3 py-2 border-b border-slate-700 bg-slate-800">
            <button
              onClick={handleArchive}
              disabled={log.length === 0}
              className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 px-2 py-1 rounded text-xs flex items-center gap-1"
              title="Archive log and clear"
              aria-label="Archive current log and clear"
            >
              <Archive size={12} aria-hidden="true" /> Archive
            </button>
            {logArchive && logArchive.length > 0 && (
              <div className="text-xs text-slate-500" aria-live="polite">
                📚 {logArchive.length} archived log(s)
              </div>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto p-3 text-xs space-y-1 log-content"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Adventure log"
          >
            {log.map((entry, index) => (
              <div key={`log-${index}-${entry.substring(0, 20)}`} className="text-slate-400 border-b border-slate-800 pb-1 font-mono log-entry">
                {entry}
              </div>
            ))}
            {log.length === 0 && (
              <div className="text-slate-500">Adventure awaits...</div>
            )}
          </div>
        </div>
      </div>
    );
  }
    // Mobile/tablet layout (original)
  return (
    <div className="space-y-3" data-component="log">
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
            aria-label="Archive current log and clear"
          >
            <Archive size={12} aria-hidden="true" /> Archive
          </button>
        </div>
          <div
            className="bg-slate-800 rounded p-2 max-h-96 md:max-h-[400px] overflow-y-auto text-xs space-y-1 log-content"
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="Adventure log"
          >
          {state.log.map((entry, index) => (
            <div key={`log-${index}-${entry.substring(0, 20)}`} className="text-slate-400 border-b border-slate-700 pb-1 log-entry">
              {entry}
            </div>
          ))}
          {state.log.length === 0 && (
            <div className="text-slate-500">Adventure awaits...</div>
          )}
        </div>

        {/* Archive indicator */}
        {state.logArchive && state.logArchive.length > 0 && (
          <div className="text-xs text-slate-500 text-center" aria-live="polite">
            📚 {state.logArchive.length} archived log(s) · View in Settings
          </div>
        )}
      </div>
    </div>
  );
}
