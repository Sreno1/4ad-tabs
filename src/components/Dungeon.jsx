import React, { useState } from 'react';
import { Sparkles, AlertTriangle, DoorOpen, Puzzle, Skull, Coins, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { d66, d6, r2d6 } from '../utils/dice.js';
import { 
  TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE, 
  TRAP_TABLE, TRAP_TYPES, 
  SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS, 
  PUZZLE_TABLE, PUZZLE_TYPES,
  checkForBoss, BOSS_RULES
} from '../data/rooms.js';
import { spawnMonster, rollTreasure, performSearch, rollWanderingMonster, spawnMajorFoe } from '../utils/gameActions.js';
import { Tooltip, TOOLTIPS } from './RulesReference.jsx';

export default function Dungeon({ state, dispatch, tileResult: externalTileResult, generateTile: externalGenerateTile, clearTile: externalClearTile, bossCheckResult: externalBossCheck, roomDetails: externalRoomDetails, hideGenerationUI = false }) {
  const [lastShapeRoll, setLastShapeRoll] = useState(null);
  const [lastContentsRoll, setLastContentsRoll] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null); // Additional info for special rooms
  const [bossCheckResult, setBossCheckResult] = useState(null); // Boss check result
  const [showMarkers, setShowMarkers] = useState(true); // Toggle markers visibility
  const [roomMarkers, setRoomMarkers] = useState({}); // {cellKey: {type, label, tooltip}}
  const [hoveredCell, setHoveredCell] = useState(null); // For showing tooltip
  
  // Use external state if provided, otherwise use internal state
  const effectiveTileResult = externalTileResult || (lastShapeRoll && lastContentsRoll ? { shape: lastShapeRoll, contents: lastContentsRoll } : null);
  const effectiveBossCheck = externalBossCheck || bossCheckResult;
  const effectiveRoomDetails = externalRoomDetails || roomDetails;
  
  // Add marker to a cell
  const addMarker = (x, y, type, label, tooltip) => {
    const key = `${x},${y}`;
    setRoomMarkers(prev => ({
      ...prev,
      [key]: { type, label, tooltip }
    }));
  };
  
  // Remove marker from a cell
  const removeMarker = (x, y) => {
    const key = `${x},${y}`;
    setRoomMarkers(prev => {
      const newMarkers = { ...prev };
      delete newMarkers[key];
      return newMarkers;
    });
  };
  
  // Get marker for a cell
  const getMarker = (x, y) => {
    const key = `${x},${y}`;
    return roomMarkers[key];
  };
  
  // Marker type icons and colors
  const MARKER_STYLES = {
    monster: { icon: '👹', color: 'bg-red-500', label: 'M' },
    boss: { icon: '👑', color: 'bg-purple-500', label: 'B' },
    treasure: { icon: '💰', color: 'bg-yellow-500', label: 'T' },
    trap: { icon: '⚠️', color: 'bg-orange-500', label: '!' },
    special: { icon: '✨', color: 'bg-blue-500', label: 'S' },
    cleared: { icon: '✓', color: 'bg-green-500', label: '✓' },
    entrance: { icon: '🚪', color: 'bg-cyan-500', label: 'E' },
    exit: { icon: '🏁', color: 'bg-emerald-500', label: 'X' }
  };

  const handleCellClick = (x, y) => {
    dispatch({ type: 'TOGGLE_CELL', x, y });
  };
  
  // Right-click to add/cycle markers
  const handleCellRightClick = (x, y, e) => {
    e.preventDefault();
    const marker = getMarker(x, y);
    const markerTypes = Object.keys(MARKER_STYLES);
    
    if (!marker) {
      // No marker, add monster marker
      addMarker(x, y, 'monster', 'Monster', 'Monster encounter');
    } else {
      const currentIdx = markerTypes.indexOf(marker.type);
      if (currentIdx >= markerTypes.length - 1) {
        // Last type, remove marker
        removeMarker(x, y);
      } else {
        // Cycle to next type
        const nextType = markerTypes[currentIdx + 1];
        const style = MARKER_STYLES[nextType];
        addMarker(x, y, nextType, style.label, `${nextType} marker`);
      }
    }
  };
  
  const handleDoorClick = (x, y, edge, e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_DOOR', x, y, edge });
  };
  
  const hasDoor = (x, y, edge) => {
    return state.doors.some(d => d.x === x && d.y === y && d.edge === edge);
  };
  
  // Step 1: Roll d66 for tile SHAPE (room layout and doors)
  const generateTileShape = () => {
    const roll = d66();
    const result = TILE_SHAPE_TABLE[roll];
    setLastShapeRoll({ roll, result });
    setLastContentsRoll(null); // Reset contents
    setRoomDetails(null);
    setBossCheckResult(null);
    dispatch({ type: 'LOG', t: `📐 Tile Shape d66=${roll}: ${result.description}` });
    dispatch({ type: 'LOG', t: `   Doors: ${result.doors}` });
  };
  
  // Step 2: Roll 2d6 for tile CONTENTS (what's in the room)
  const generateTileContents = () => {
    const roll = r2d6();
    const result = TILE_CONTENTS_TABLE[roll];
    setLastContentsRoll({ roll, result });
    setRoomDetails(null);
    setBossCheckResult(null);
    dispatch({ type: 'LOG', t: `📦 Tile Contents 2d6=${roll}: ${result.description}` });
    
    // Handle contents based on type
    switch (result.type) {
      case 'empty':
        dispatch({ type: 'LOG', t: `The room is empty.` });
        break;
      case 'vermin':
        spawnMonster(dispatch, 'vermin', 1);
        break;
      case 'minions':
        spawnMonster(dispatch, 'minion', 2);
        break;
      case 'treasure':
        rollTreasure(dispatch);
        break;
      case 'special': {
        const specialRoll = d6();
        const specialKey = SPECIAL_FEATURE_TABLE[specialRoll];
        const special = SPECIAL_ROOMS[specialKey];
        setRoomDetails({ type: 'special', specialKey, special, specialRoll });
        dispatch({ type: 'LOG', t: `✨ Special Feature! ${special.name}` });
        dispatch({ type: 'LOG', t: `📜 ${special.description}` });
        break;
      }
      case 'weird_monster':
        dispatch({ type: 'LOG', t: `👾 Weird Monster! Roll on the Weird Monster table.` });
        setRoomDetails({ type: 'weird_monster' });
        break;
      case 'minor_boss':
        spawnMonster(dispatch, 'boss', 3);
        dispatch({ type: 'MINOR' });
        dispatch({ type: 'LOG', t: `⚔️ Minor Boss appears! (Level 3)` });
        break;
      case 'major_foe': {
        // BOSS CHECK: Roll d6 + majorFoes faced, on 6+ it's the BOSS
        const bossRoll = d6();
        const bossResult = checkForBoss(state.majorFoes || 0, bossRoll);
        setBossCheckResult(bossResult);
        dispatch({ type: 'LOG', t: `🎲 Boss Check: ${bossResult.message}` });
        
        if (bossResult.isBoss) {
          // It's the BOSS! +1 Life, +1 Attack, 3x Treasure
          spawnMajorFoe(dispatch, state.hcl, true); // true = isBoss
          dispatch({ type: 'BOSS' });
          dispatch({ type: 'LOG', t: `👑 THE BOSS APPEARS! (+1 Life, +1 Attack, 3x Treasure)` });
        } else {
          // Regular Major Foe
          spawnMajorFoe(dispatch, state.hcl, false);
          dispatch({ type: 'MAJOR' });
          dispatch({ type: 'LOG', t: `⚔️ Major Foe appears! (Level ${state.hcl})` });
        }
        break;
      }
      case 'quest_room':
        dispatch({ type: 'LOG', t: `🏆 Quest Room / Final Room! The dungeon's objective is here.` });
        setRoomDetails({ type: 'quest_room' });
        break;
      default:
        break;
    }
  };
  
  const handleSearch = () => {
    performSearch(dispatch);
  };
  
  return (
    <div className="space-y-2">
      {/* Tile Generation - Two-Roll System (Hidden when hideGenerationUI is true) */}
      {!hideGenerationUI && (
      <div className="bg-slate-800 rounded p-2">
        <div className="text-amber-400 font-bold text-sm mb-2">🎲 Tile Generation</div>
        <div className="text-xs text-slate-400 mb-2">
          Step 1: Roll d66 for tile SHAPE → Step 2: Roll 2d6 for tile CONTENTS
        </div>
        
        <div className="flex gap-2 mb-2">
          <button 
            onClick={generateTileShape} 
            className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm font-bold"
          >
            1. Shape (d66)
          </button>
          <button 
            onClick={generateTileContents}
            disabled={!lastShapeRoll}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-bold ${
              lastShapeRoll 
                ? 'bg-amber-600 hover:bg-amber-500' 
                : 'bg-slate-600 cursor-not-allowed'
            }`}
          >
            2. Contents (2d6)
          </button>
        </div>
        
        {/* Shape Result */}
        {lastShapeRoll && (
          <div className="p-2 bg-slate-700 rounded text-xs mb-2">
            <div className="text-blue-400 font-bold">📐 Shape: d66 = {lastShapeRoll.roll}</div>
            <div className="text-slate-300">{lastShapeRoll.result.description}</div>
            <div className="text-slate-400">Doors: {lastShapeRoll.result.doors}</div>
          </div>
        )}
        
        {/* Contents Result */}
        {lastContentsRoll && (
          <div className="p-2 bg-slate-700 rounded text-xs mb-2">
            <div className="text-amber-400 font-bold">📦 Contents: 2d6 = {lastContentsRoll.roll}</div>
            <div className="text-slate-300">{lastContentsRoll.result.description}</div>
          </div>
        )}
        
        {/* Boss Check Result */}
        {effectiveBossCheck && (
          <div className={`p-2 rounded text-xs mb-2 ${
            effectiveBossCheck.isBoss ? 'bg-red-900/50 border border-red-600' : 'bg-slate-700'
          }`}>
            <div className={`font-bold ${effectiveBossCheck.isBoss ? 'text-red-400' : 'text-amber-400'}`}>
              <Skull size={14} className="inline mr-1" />
              Boss Check: {effectiveBossCheck.message}
            </div>
            {effectiveBossCheck.isBoss && (
              <div className="text-red-300 mt-1">
                👑 +1 Life, +1 Attack, 3× Treasure!
              </div>
            )}
          </div>
        )}
        
        {/* Special Room Details */}
        {effectiveRoomDetails && effectiveRoomDetails.type === 'special' && (
          <div className="mt-2 p-2 bg-purple-900/30 border border-purple-700 rounded text-xs">
            <div className="flex items-center gap-1 text-purple-400 font-bold">
              <Sparkles size={14} /> {effectiveRoomDetails.special.name}
            </div>
            <div className="text-slate-300 mt-1">{effectiveRoomDetails.special.description}</div>
            {effectiveRoomDetails.special.requiresGold && (
              <div className="text-amber-400 mt-1">💰 Requires {effectiveRoomDetails.special.requiresGold} gold</div>
            )}
            <div className="text-amber-400 mt-1 text-xs">→ Use Explore tab to interact</div>
          </div>
        )}
        
        {effectiveRoomDetails && effectiveRoomDetails.type === 'weird_monster' && (
          <div className="mt-2 p-2 bg-purple-900/30 border border-purple-700 rounded text-xs">
            <div className="flex items-center gap-1 text-purple-400 font-bold">
              👾 Weird Monster
            </div>
            <div className="text-slate-300 mt-1">Roll on the Weird Monster table in the rulebook!</div>
          </div>
        )}
        
        {effectiveRoomDetails && effectiveRoomDetails.type === 'quest_room' && (
          <div className="mt-2 p-2 bg-amber-900/30 border border-amber-700 rounded text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              🏆 Quest Room / Final Room
            </div>
            <div className="text-slate-300 mt-1">The dungeon's objective is here! This could be the treasure you seek, a prisoner to rescue, or an artifact to recover.</div>
          </div>
        )}
        
        {/* Major Foes Counter */}
        <div className="text-xs text-slate-400 mt-2 border-t border-slate-700 pt-2">
          Major Foes Faced: <span className="text-amber-400 font-bold">{state.majorFoes || 0}</span>
          <span className="text-slate-500 ml-2">(Boss appears on d6 + this ≥ 6)</span>
        </div>
      </div>
      )}
      
      {/* Dungeon Grid */}
      <div className="bg-slate-800 rounded p-2" data-dungeon-section="true">
        <div className="flex justify-between items-center mb-2">
          <div className="text-amber-400 font-bold text-sm">Draw Dungeon (20×28 Grid)</div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => dispatch({ type: 'CLEAR_GRID' })}
              className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
            >
              Clear
            </button>
            <button 
              onClick={handleSearch}
              className="bg-amber-600 hover:bg-amber-500 px-2 py-1 rounded text-xs"
            >
              <Sparkles size={12} className="inline" /> Search
            </button>
            <button
              onClick={() => setRoomMarkers({})}
              className="bg-slate-600 hover:bg-slate-500 px-2 py-1 rounded text-xs"
            >
              Clear Markers
            </button>
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              className="text-slate-400 hover:text-amber-400 p-1"
              title={showMarkers ? 'Hide Markers' : 'Show Markers'}
            >
              {showMarkers ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        </div>
        
        <div className="w-full bg-slate-900 p-2 overflow-auto" data-dungeon-grid="true">
          <div className="inline-block">
          {state.grid.map((row, y) => (
            <div key={y} className="flex leading-[0]">
              {row.map((cell, x) => {
                const cellColor = cell === 0 ? 'bg-slate-900' : cell === 1 ? 'bg-amber-700' : 'bg-blue-700';
                const marker = getMarker(x, y);
                const markerStyle = marker ? MARKER_STYLES[marker.type] : null;
                const isHovered = hoveredCell && hoveredCell.x === x && hoveredCell.y === y;
                
                return (
                  <div key={x} className="relative inline-block">
                    <button
                      onClick={() => handleCellClick(x, y)}
                      onContextMenu={(e) => handleCellRightClick(x, y, e)}
                      onMouseEnter={() => setHoveredCell({ x, y })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-5 h-5 ${cellColor} border border-slate-700 hover:opacity-80 block relative dungeon-cell`}
                      data-dungeon-cell="true"
                    >
                      {/* Marker indicator */}
                      {showMarkers && marker && (
                        <span 
                          className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white ${markerStyle.color} bg-opacity-80`}
                          title={marker.tooltip}
                        >
                          {markerStyle.label}
                        </span>
                      )}
                    </button>
                    
                    {/* Tooltip on hover */}
                    {isHovered && marker && (
                      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-xs whitespace-nowrap shadow-lg">
                        <span className="mr-1">{markerStyle.icon}</span>
                        {marker.tooltip}
                      </div>
                    )}
                    
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
        </div>
        
        <div className="text-xs text-slate-400 mt-2">
          Click squares to cycle: Empty → Room (amber) → Corridor (blue)<br/>
          Click on room/corridor edges to add doors (green dots)<br/>
          <span className="text-amber-300">Right-click</span> to cycle markers: 👹M → 👑B → 💰T → ⚠️! → ✨S → ✓ → 🚪E → 🏁X
        </div>
        
        {/* Marker Legend */}
        {showMarkers && Object.keys(roomMarkers).length > 0 && (
          <div className="mt-2 p-2 bg-slate-700 rounded text-xs">
            <div className="text-slate-300 font-bold mb-1">Markers:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MARKER_STYLES).map(([type, style]) => {
                const count = Object.values(roomMarkers).filter(m => m.type === type).length;
                if (count === 0) return null;
                return (
                  <span key={type} className="flex items-center gap-1">
                    <span className={`w-4 h-4 ${style.color} text-white text-[8px] flex items-center justify-center rounded`}>
                      {style.label}
                    </span>
                    <span className="text-slate-400">{type}: {count}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
