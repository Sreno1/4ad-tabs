import React, { useState } from 'react';
import { Sword, Map, Users, Scroll, Settings } from 'lucide-react';

// Components
import Dice from './components/Dice.jsx';
import Party from './components/Party.jsx';
import Dungeon from './components/Dungeon.jsx';
import Combat from './components/Combat.jsx';
import Log from './components/Log.jsx';
import SettingsModal from './components/SettingsModal.jsx';

// Hooks
import { useGameState } from './hooks/useGameState.js';

export default function App() {
  const [state, dispatch] = useGameState();
  const [tab, setTab] = useState('party');
  const [showSettings, setShowSettings] = useState(false);
  
  const tabs = [
    { id: 'party', icon: Users, label: 'Party' }, 
    { id: 'dungeon', icon: Map, label: 'Dungeon' }, 
    { id: 'combat', icon: Sword, label: 'Combat' }, 
    { id: 'log', icon: Scroll, label: 'Log' }
  ];

  if (!state) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 p-3 border-b border-slate-700">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-amber-400">Four Against Darkness</h1>
            <button
              onClick={() => setShowSettings(true)}
              className="text-slate-400 hover:text-amber-400 p-1"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
          
          {/* Stats - hidden on mobile, shown on desktop */}
          <div className="hidden md:flex items-center gap-3 text-xs">
            <span className="text-slate-400">
              Gold: <span className="font-bold text-amber-400">{state.gold}</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Minor: <span className="font-bold text-amber-400">{state.minorEnc}/10</span>
            </span>
            <span className="text-slate-400">
              Major: <span className="font-bold text-red-400">{state.majorFoes}</span>
            </span>
            <span className="text-slate-400">
              Clues: <span className="font-bold text-blue-400">{state.clues}</span>
            </span>
            {state.mode === 'campaign' && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-purple-400 font-bold">Campaign Mode</span>
              </>
            )}
          </div>
          
          <Dice />
        </div>
        
        {/* Mobile stats row */}
        <div className="flex md:hidden justify-center gap-3 text-xs mt-2 text-slate-400">
          <span>Gold: <span className="font-bold text-amber-400">{state.gold}</span></span>
          <span>Minor: <span className="font-bold">{state.minorEnc}/10</span></span>
          <span>Major: <span className="font-bold text-red-400">{state.majorFoes}</span></span>
          <span>Clues: <span className="font-bold text-blue-400">{state.clues}</span></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Mobile: Tabbed interface */}
        <div className="md:hidden">
          <div className="p-3">
            {tab === 'party' && <Party state={state} dispatch={dispatch} />}
            {tab === 'dungeon' && <Dungeon state={state} dispatch={dispatch} />}
            {tab === 'combat' && <Combat state={state} dispatch={dispatch} />}
            {tab === 'log' && <Log state={state} dispatch={dispatch} />}
          </div>
        </div>

        {/* Tablet+: Side-by-side layout */}
        <div className="hidden md:block h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 h-full overflow-hidden">
            {/* Left: Dungeon */}
            <div className="lg:col-span-1 overflow-y-auto">
              <Dungeon state={state} dispatch={dispatch} />
            </div>
            
            {/* Middle: Combat */}
            <div className="lg:col-span-1 overflow-y-auto">
              <Combat state={state} dispatch={dispatch} />
            </div>
            
            {/* Right: Party & Log */}
            <div className="lg:col-span-1 space-y-3 overflow-y-auto">
              <Party state={state} dispatch={dispatch} />
              <Log state={state} dispatch={dispatch} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex md:hidden">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)} 
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-amber-400' : 'text-slate-500'}`}
          >
            <t.icon size={18} />
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
}
