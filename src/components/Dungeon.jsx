import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { d66 } from '../utils/dice.js';
import { ROOM_TABLE, parseRoomResult } from '../data/rooms.js';
import { spawnMonster, rollTreasure, performSearch, rollWanderingMonster } from '../utils/gameActions.js';

export default function Dungeon({ state, dispatch }) {
  const [lastRoomRoll, setLastRoomRoll] = useState(null);
  
  const handleCellClick = (x, y) => {
    dispatch({ type: 'TOGGLE_CELL', x, y });
  };
  
  const handleDoorClick = (x, y, edge, e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_DOOR', x, y, edge });
  };
  
  const hasDoor = (x, y, edge) => {
    return state.doors.some(d => d.x === x && d.y === y && d.edge === edge);
  };
  
  const generateRoom = () => {
    const roll = d66();
    const result = ROOM_TABLE[roll];
    setLastRoomRoll({ roll, result });
    dispatch({ type: 'LOG', t: `Room d66=${roll}: ${result}` });
    
    // Parse and handle room result
    const parsed = parseRoomResult(result);
    
    switch (parsed.type) {
      case 'monster':
        if (parsed.subtype === 'vermin') {
          spawnMonster(dispatch, 'vermin', 1);
        } else if (parsed.subtype === 'minion') {
          spawnMonster(dispatch, 'minion', 2);
        } else if (parsed.subtype === 'boss') {
          spawnMonster(dispatch, 'boss', state.hcl + 1);
          dispatch({ type: 'BOSS' });
        } else if (parsed.subtype === 'major') {
          spawnMonster(dispatch, 'major', state.hcl);
          dispatch({ type: 'MAJOR' });
        }
        break;
      case 'clue':
        dispatch({ type: 'CLUE', n: 1 });
        break;
      case 'treasure':
        rollTreasure(dispatch);
        break;
      case 'wandering':
        rollWanderingMonster(dispatch);
        break;
      default:
        // Empty, special, deadend - no automatic action
        break;
    }
  };
  
  const handleSearch = () => {
    performSearch(dispatch);
  };
  
  return (
    <div className="space-y-2">
      {/* Room Generation */}
      <div className="bg-slate-800 rounded p-2">
        <div className="text-amber-400 font-bold text-sm mb-2">🎲 Room Generation</div>
        <button 
          onClick={generateRoom} 
          className="w-full bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded text-sm font-bold mb-2"
        >
          Generate Room (d66)
        </button>
        {lastRoomRoll && (
          <div className="p-2 bg-slate-700 rounded text-xs">
            <div className="text-amber-400 font-bold">d66 = {lastRoomRoll.roll}</div>
            <div className="text-slate-300">{lastRoomRoll.result}</div>
          </div>
        )}
      </div>
      
      {/* Dungeon Grid */}
      <div className="bg-slate-800 rounded p-2">
        <div className="text-amber-400 font-bold text-sm mb-2">Draw Dungeon (20×28 Grid)</div>
        <div className="flex gap-2 mb-2">
          <button 
            onClick={() => dispatch({ type: 'CLEAR_GRID' })}
            className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-xs"
          >
            Clear Grid
          </button>
          <button 
            onClick={handleSearch}
            className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs"
          >
            <Sparkles size={12} className="inline" /> Search
          </button>
        </div>
        
        <div className="inline-block bg-slate-900 p-2 overflow-auto max-h-[400px]">
          {state.grid.map((row, y) => (
            <div key={y} className="flex leading-[0]">
              {row.map((cell, x) => {
                const cellColor = cell === 0 ? 'bg-slate-900' : cell === 1 ? 'bg-amber-700' : 'bg-blue-700';
                
                return (
                  <div key={x} className="relative inline-block">
                    <button
                      onClick={() => handleCellClick(x, y)}
                      className={`w-5 h-5 ${cellColor} border border-slate-700 hover:opacity-80 block`}
                    />
                    
                    {/* Door edges - only show for room/corridor cells */}
                    {cell > 0 && ['N', 'S', 'E', 'W'].map(edge => {
                      const posClass = {
                        N: 'absolute -top-1 left-0 right-0 h-2',
                        S: 'absolute -bottom-1 left-0 right-0 h-2',
                        E: 'absolute -right-1 top-0 bottom-0 w-2',
                        W: 'absolute -left-1 top-0 bottom-0 w-2'
                      }[edge];
                      
                      const lineClass = {
                        N: 'absolute top-0 left-0 right-0 h-0.5',
                        S: 'absolute bottom-0 left-0 right-0 h-0.5',
                        E: 'absolute right-0 top-0 bottom-0 w-0.5',
                        W: 'absolute left-0 top-0 bottom-0 w-0.5'
                      }[edge];
                      
                      return (
                        <button
                          key={edge}
                          onClick={(e) => handleDoorClick(x, y, edge, e)}
                          className={`${posClass} z-10 group`}
                        >
                          <div className={`${lineClass} bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
                          {hasDoor(x, y, edge) && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="text-xs text-slate-400 mt-2">
          Click squares to cycle: Empty → Room (amber) → Corridor (blue)<br/>
          Click on room/corridor edges to add doors (green dots)
        </div>
      </div>
    </div>
  );
}
