import React from 'react';
import { Scroll } from 'lucide-react';
import Log from '../Log.jsx';
import MarchingOrder from '../MarchingOrder.jsx';

export default function LogBar({ state, dispatch, collapsed, onToggle, selectedHero, onSelectHero }) {
  return (
    <div
      className={`border-t border-slate-700 bg-slate-800 transition-all duration-200 flex-shrink-0 ${
        collapsed ? 'h-8' : 'h-[35vh]'
      }`}
      style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.3)' }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-slate-800 cursor-pointer hover:bg-slate-700 h-8"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Scroll size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs font-semibold text-slate-300 flex-shrink-0">
            Log ({state.log?.length || 0})
          </span>
          {collapsed && state.log && state.log.length > 0 && (
            <span className="text-xs text-slate-400 truncate ml-2">
              {typeof state.log[0] === 'object' ? state.log[0].message : state.log[0]}
              <span className="inline-block w-2 h-3 ml-1 bg-slate-400 animate-pulse" style={{ animation: 'blink 1s step-end infinite' }}></span>
            </span>
          )}
        </div>
        <button className="text-slate-400 hover:text-white flex-shrink-0 ml-2">
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <div className="h-[calc(100%-2rem)] overflow-hidden flex">
          <div className="flex-1 overflow-hidden">
            <Log state={state} dispatch={dispatch} isBottomPanel={true} />
          </div>

          <div className="w-96 border-l border-slate-700 bg-slate-850 p-3 flex-shrink-0">
            <MarchingOrder state={state} selectedHero={selectedHero} onSelectHero={onSelectHero} />
          </div>
        </div>
      )}
    </div>
  );
}
