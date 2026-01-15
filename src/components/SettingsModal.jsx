import React, { useState } from 'react';
import { X, AlertTriangle, Archive, MapPin, Trash2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, state, dispatch }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  
  if (!isOpen) return null;
  
  const handleNewAdventure = () => {
    const name = prompt('Name this dungeon (optional):', 'New Dungeon');
    dispatch({ type: 'NEW_ADVENTURE', name: name || 'New Dungeon' });
    onClose();
  };
  
  const handleArchiveLog = () => {
    dispatch({ type: 'ARCHIVE_LOG' });
  };
  
  const handleResetCampaign = () => {
    if (confirmReset) {
      dispatch({ type: 'RESET_CAMPAIGN' });
      setConfirmReset(false);
      onClose();
    } else {
      setConfirmReset(true);
    }
  };
  
  const archiveCount = state.logArchive?.length || 0;
  const totalArchivedEntries = state.logArchive?.reduce((sum, a) => sum + a.entries.length, 0) || 0;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-amber-400">⚙️ Settings</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Adventure Management */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Adventure Management
            </h3>
            
            <button
              onClick={handleNewAdventure}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
            >
              <MapPin size={16} />
              Start New Dungeon
            </button>
            <p className="text-xs text-slate-500">
              Archives current log, clears the dungeon map and monsters. 
              Party, gold, clues, and levels carry over.
            </p>
          </div>
          
          {/* Log Management */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Log Management
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleArchiveLog}
                disabled={state.log.length === 0}
                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-3 py-2 rounded flex items-center gap-2 justify-center text-sm"
              >
                <Archive size={14} />
                Archive & Clear Log
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Current log: {state.log.length} entries
            </p>
            
            {/* Archive Summary */}
            <div className="bg-slate-900 rounded p-2">
              <button
                onClick={() => setShowArchive(!showArchive)}
                className="w-full flex justify-between items-center text-xs"
              >
                <span className="text-slate-400">
                  📚 Archived: {archiveCount} logs ({totalArchivedEntries} entries)
                </span>
                <span className="text-slate-500">{showArchive ? '▼' : '▶'}</span>
              </button>
              
              {showArchive && state.logArchive && state.logArchive.length > 0 && (
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {state.logArchive.map((archive, idx) => (
                    <div key={archive.id} className="bg-slate-800 rounded p-2 text-xs">
                      <div className="text-amber-400 font-bold">{archive.adventureName}</div>
                      <div className="text-slate-500">
                        {new Date(archive.timestamp).toLocaleDateString()} · {archive.entries.length} entries
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {showArchive && (!state.logArchive || state.logArchive.length === 0) && (
                <div className="mt-2 text-xs text-slate-500 text-center py-2">
                  No archived logs yet
                </div>
              )}
            </div>
          </div>
          
          {/* Campaign Stats */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Campaign Stats
            </h3>
            <div className="bg-slate-900 rounded p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Party Members:</span>
                <span className="text-amber-400">{state.party.length}/4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Gold:</span>
                <span className="text-amber-400">{state.gold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clues Found:</span>
                <span className="text-blue-400">{state.clues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Minor Encounters:</span>
                <span className="text-slate-300">{state.minorEnc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Major Foes Defeated:</span>
                <span className="text-red-400">{state.majorFoes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Boss Defeated:</span>
                <span className={state.finalBoss ? 'text-green-400' : 'text-slate-500'}>
                  {state.finalBoss ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle size={14} />
              Danger Zone
            </h3>
            
            <button
              onClick={handleResetCampaign}
              className={`w-full ${confirmReset ? 'bg-red-600 hover:bg-red-500' : 'bg-red-900 hover:bg-red-800'} text-white px-4 py-2 rounded flex items-center gap-2 justify-center`}
            >
              <Trash2 size={16} />
              {confirmReset ? 'Click Again to Confirm Reset' : 'Reset Entire Campaign'}
            </button>
            <p className="text-xs text-red-400/70">
              ⚠️ This will delete ALL data: party, gold, clues, dungeon, logs, and archive.
              This cannot be undone!
            </p>
            {confirmReset && (
              <button
                onClick={() => setConfirmReset(false)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-1 rounded text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
