import React, { useState } from 'react';
import { X, Archive, Palette, Dices } from 'lucide-react';
import { useTheme, THEMES } from '../contexts/ThemeContext.jsx';
import { useDiceTheme, DICE_COLORS, DICE_THEMES } from '../contexts/DiceContext.jsx';

export default function SettingsModal({ isOpen, onClose, state, dispatch }) {
  const [showArchive, setShowArchive] = useState(false);
  const { theme, setTheme } = useTheme();
  const { diceColor, setDiceColor, diceTheme, setDiceTheme } = useDiceTheme();
  
  if (!isOpen) return null;
  
  const handleArchiveLog = () => {
    dispatch({ type: 'ARCHIVE_LOG' });
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
          {/* Theme Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Palette size={14} />
              Theme
            </h3>
              <div className="grid grid-cols-1 gap-2">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded border-2 text-left transition-colors ${
                    theme === t.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <div className={`font-bold text-sm ${theme === t.id ? 'text-amber-400' : 'text-slate-300'}`}>
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {t.description}
                  </div>
                </button>
              ))}            </div>
            <p className="text-xs text-slate-500">
              {theme === 'rpgui' && '🎮 RPGUI theme applies retro 8-bit styling.'}
              {theme === 'doodle' && '✏️ Doodle theme uses hand-drawn borders and playful style.'}
            </p>
          </div>

          {/* Dice Theme Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <Dices size={14} />
              Dice Theme
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(DICE_THEMES).map((dt) => (
                <button
                  key={dt.id}
                  onClick={() => setDiceTheme(dt.id)}
                  className={`p-2 rounded border-2 transition-colors text-center ${
                    diceTheme === dt.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                  title={dt.description}
                >
                  <span className={`text-xs font-medium ${diceTheme === dt.id ? 'text-amber-400' : 'text-slate-400'}`}>
                    {dt.name}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Add more themes from <a href="https://github.com/3d-dice/dice-themes" target="_blank" rel="noopener" className="text-blue-400 hover:underline">3d-dice/dice-themes</a>
            </p>
          </div>

          {/* Dice Color Selection */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
              Dice Color
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(DICE_COLORS).map((dc) => (
                <button
                  key={dc.id}
                  onClick={() => setDiceColor(dc.id)}
                  className={`p-2 rounded border-2 transition-colors flex flex-col items-center ${
                    diceColor === dc.id
                      ? 'border-amber-400 bg-amber-900/30'
                      : 'border-slate-600 bg-slate-900 hover:border-slate-500'
                  }`}
                  title={dc.name}
                >
                  <div
                    className="w-6 h-6 rounded shadow-md mb-1"
                    style={{ backgroundColor: dc.color }}
                  />
                  <span className={`text-xs ${diceColor === dc.id ? 'text-amber-400' : 'text-slate-400'}`}>
                    {dc.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
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
                <span className="text-slate-400">Boss Defeated:</span>                <span className={state.finalBoss ? 'text-green-400' : 'text-slate-500'}>
                  {state.finalBoss ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
