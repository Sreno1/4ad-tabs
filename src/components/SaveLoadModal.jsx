import React, { useState, useRef } from 'react';
import { X, Save, Upload, Download, Trash2, Clock, Users, Coins, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = '4ad-state';
const SAVES_KEY = '4ad-saves';
const MAX_SAVE_SLOTS = 5;

// Get all saved games from localStorage
const getSavedGames = () => {
  try {
    const saves = localStorage.getItem(SAVES_KEY);
    return saves ? JSON.parse(saves) : [];
  } catch (e) {
    console.error('Failed to load saves:', e);
    return [];
  }
};

// Save games to localStorage
const saveSavedGames = (saves) => {
  try {
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
    return true;
  } catch (e) {
    console.error('Failed to save games list:', e);
    return false;
  }
};

export default function SaveLoadModal({ isOpen, onClose, state, dispatch }) {
  const [savedGames, setSavedGames] = useState(getSavedGames);
  const [confirmDelete, setConfirmDelete] = useState(null); // slot index
  const [saveName, setSaveName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  
  if (!isOpen) return null;
  
  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };
  
  // Save current game to a slot
  const handleSaveGame = () => {
    const name = saveName.trim() || `Save ${new Date().toLocaleDateString()}`;
    
    const saveData = {
      id: Date.now(),
      name,
      timestamp: new Date().toISOString(),
      summary: {
        partySize: state.party.length,
        partyNames: state.party.map(h => h.name).join(', '),
        gold: state.gold,
        clues: state.clues,
        dungeonName: state.adventure?.adventureName || 'Unknown'
      },
      state: { ...state }
    };
    
    // Remove UI state from saved data
    delete saveData.state.activeTab;
    
    const newSaves = [saveData, ...savedGames.slice(0, MAX_SAVE_SLOTS - 1)];
    
    if (saveSavedGames(newSaves)) {
      setSavedGames(newSaves);
      setShowSaveForm(false);
      setSaveName('');
      showMessage('Game saved successfully!', 'success');
    } else {
      showMessage('Failed to save game.', 'error');
    }
  };
  
  // Load a saved game
  const handleLoadGame = (saveData) => {
    if (saveData && saveData.state) {
      // Restore state via dispatch
      dispatch({ type: 'LOAD_STATE', state: saveData.state });
      showMessage('Game loaded successfully!', 'success');
      setTimeout(() => onClose(), 1000);
    } else {
      showMessage('Invalid save data.', 'error');
    }
  };
  
  // Delete a saved game
  const handleDeleteSave = (index) => {
    if (confirmDelete === index) {
      const newSaves = savedGames.filter((_, i) => i !== index);
      if (saveSavedGames(newSaves)) {
        setSavedGames(newSaves);
        showMessage('Save deleted.', 'info');
      }
      setConfirmDelete(null);
    } else {
      setConfirmDelete(index);
    }
  };
  
  // Export current state to JSON file
  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Four Against Darkness Companion',
      state: { ...state }
    };
    
    // Remove UI state
    delete exportData.state.activeTab;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4ad-save-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Game exported to file!', 'success');
  };
  
  // Import state from JSON file
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        // Validate import data
        if (!imported.state || !imported.version) {
          showMessage('Invalid save file format.', 'error');
          return;
        }
        
        // Load the state
        dispatch({ type: 'LOAD_STATE', state: imported.state });
        showMessage('Game imported successfully!', 'success');
        setTimeout(() => onClose(), 1000);
      } catch (err) {
        console.error('Import error:', err);
        showMessage('Failed to parse save file.', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Save size={20} />
            Save / Load Game
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Message Toast */}
        {message && (
          <div className={`mx-4 mt-2 p-2 rounded text-sm text-center ${
            message.type === 'success' ? 'bg-green-900/50 text-green-300' :
            message.type === 'error' ? 'bg-red-900/50 text-red-300' :
            'bg-slate-700 text-slate-300'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Save New Game */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Save Current Game
            </h3>
            
            {showSaveForm ? (
              <div className="bg-slate-900 rounded p-3 space-y-2">
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter save name (optional)"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
                  autoFocus
                />                <div className="flex gap-2">
                  <button
                    onClick={handleSaveGame}
                    data-golden="true"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded flex items-center gap-2 justify-center text-sm"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveForm(false); setSaveName(''); }}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveForm(true)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
              >
                <Save size={16} />
                Create New Save
              </button>
            )}
            <p className="text-xs text-slate-500">
              {savedGames.length}/{MAX_SAVE_SLOTS} save slots used
            </p>
          </div>
          
          {/* Saved Games List */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Saved Games
            </h3>
            
            {savedGames.length === 0 ? (
              <div className="bg-slate-900 rounded p-4 text-center text-slate-500 text-sm">
                No saved games yet
              </div>
            ) : (
              <div className="space-y-2">
                {savedGames.map((save, index) => (
                  <div key={save.id} className="bg-slate-900 rounded p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-amber-400">{save.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(save.timestamp)}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadGame(save)}
                          className="bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteSave(index)}
                          className={`${confirmDelete === index ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'} text-white px-2 py-1 rounded text-xs`}
                        >
                          {confirmDelete === index ? 'Confirm?' : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                    
                    {/* Save Summary */}
                    <div className="text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users size={10} />
                          {save.summary?.partySize || 0} heroes
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins size={10} />
                          {save.summary?.gold || 0} gold
                        </span>
                      </div>
                      {save.summary?.partyNames && (
                        <div className="text-slate-500 truncate">
                          {save.summary.partyNames}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Export / Import */}
          <div className="space-y-2 pt-4 border-t border-slate-700">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Export / Import
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 justify-center text-sm"
              >
                <Download size={14} />
                Export to File
              </button>
              <label className="flex-1 bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 justify-center text-sm cursor-pointer">
                <Upload size={14} />
                Import from File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Export your game to share or backup. Import to restore a previous save.
            </p>
          </div>
          
          {/* Warning */}
          <div className="bg-amber-900/30 border border-amber-700/50 rounded p-3 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">
              Loading a save will replace your current game. Make sure to save first!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
