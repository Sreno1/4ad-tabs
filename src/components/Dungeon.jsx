import React, { useState, useCallback } from 'react';
import { Sparkles, AlertTriangle, DoorOpen, Puzzle, Skull, Coins, HelpCircle } from 'lucide-react';
import { d66, d6, r2d6 } from '../utils/dice.js';
import {
  TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE,
  TRAP_TABLE, TRAP_TYPES,
  SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS,
  PUZZLE_TABLE, PUZZLE_TYPES,
  checkForBoss, BOSS_RULES
} from '../data/rooms.js';
import { spawnMonster, rollTreasure, performSearch, rollWanderingMonster, spawnMajorFoe } from "../utils/gameActions/index.js";
import { Tooltip, TOOLTIPS } from './RulesReference.jsx';
import DungeonGridCanvas from './DungeonGridCanvas.jsx';
import RadialMenu from './RadialMenu.jsx';

export default function Dungeon({ state, dispatch, tileResult: externalTileResult, generateTile: externalGenerateTile, clearTile: externalClearTile, bossCheckResult: externalBossCheck, roomDetails: externalRoomDetails, hideGenerationUI = false, sidebarCollapsed = false, onToggleShowLog = null, showLogMiddle = false }) {
  const [lastShapeRoll, setLastShapeRoll] = useState(null);
  const [lastContentsRoll, setLastContentsRoll] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null); // Additional info for special rooms
  const [bossCheckResult, setBossCheckResult] = useState(null); // Boss check result
  const [showMarkers, setShowMarkers] = useState(true); // Toggle markers visibility
  const [roomMarkers, setRoomMarkers] = useState({}); // {cellKey: {type, label, tooltip}}  const [hoveredCell, setHoveredCell] = useState(null); // For showing tooltip
  const [radialMenu, setRadialMenu] = useState(null); // {xPx,yPx,cellX,cellY}
  const [cellSize, setCellSize] = useState(20); // Dynamic cell size
  const [shouldRotate, setShouldRotate] = useState(false); // Whether to rotate based on aspect ratio
  const gridContainerRef = React.useRef(null);
  const isCalculatingRef = React.useRef(false); // Persistent flag across renders
  const lastCalculatedSizeRef = React.useRef({ width: 0, height: 0 }); // Track container size to prevent loops

  // Use external state if provided, otherwise use internal state
  const effectiveTileResult = externalTileResult || (lastShapeRoll && lastContentsRoll ? { shape: lastShapeRoll, contents: lastContentsRoll } : null);
  const effectiveBossCheck = externalBossCheck || bossCheckResult;
  const effectiveRoomDetails = externalRoomDetails || roomDetails;

  // Add marker to a cell
  const addMarker = useCallback((x, y, type, label, tooltip) => {
    const key = `${x},${y}`;
    setRoomMarkers(prev => ({
      ...prev,
      [key]: { type, label, tooltip }
    }));
  }, []);

  // Remove marker from a cell
  const removeMarker = useCallback((x, y) => {
    const key = `${x},${y}`;
    setRoomMarkers(prev => {
      const newMarkers = { ...prev };
      delete newMarkers[key];
      return newMarkers;
    });
  }, []);

  // Get marker for a cell
  const getMarker = useCallback((x, y) => {
    const key = `${x},${y}`;
    return roomMarkers[key];
  }, [roomMarkers]);

  const handleCellClick = useCallback((x, y) => {
    dispatch({ type: 'TOGGLE_CELL', x, y });
  }, [dispatch]);

  const handleCellSet = useCallback((x, y, value) => {
    dispatch({ type: 'SET_CELL', x, y, value });
  }, [dispatch]);

  // Right-click opens radial menu for markers
  const handleCellRightClick = useCallback((x, y, e) => {
    e.preventDefault();
    // Compute pixel position for menu from event
    const rect = gridContainerRef.current?.getBoundingClientRect();
    const xPx = e.clientX;
    const yPx = e.clientY;
    setRadialMenu({ xPx, yPx, cellX: x, cellY: y });
  }, []);

  const closeRadial = useCallback(() => setRadialMenu(null), []);

  const markerOptions = [
  { key: 'clear', label: 'Clear' },
    { key: 'monster', label: 'Monster' },
    { key: 'boss', label: 'Boss' },
    { key: 'treasure', label: 'Treasure' },
    { key: 'trap', label: 'Trap' },
    { key: 'special', label: 'Special' },
    { key: 'cleared', label: 'Cleared' },
    { key: 'entrance', label: 'Entrance' },
    { key: 'exit', label: 'Exit' }
  ];

  const handleRadialSelect = useCallback((type) => {
    if (!radialMenu) return;
    const { cellX, cellY } = radialMenu;
    const existing = getMarker(cellX, cellY);
    if (type === 'clear') {
      if (existing) removeMarker(cellX, cellY);
    } else if (!existing && type) {
      addMarker(cellX, cellY, type, type.charAt(0).toUpperCase() + type.slice(1), `${type} marker`);
    } else if (existing && existing.type === type) {
      // same type => remove
      removeMarker(cellX, cellY);
    } else {
      // replace
      addMarker(cellX, cellY, type, type.charAt(0).toUpperCase() + type.slice(1), `${type} marker`);
    }
    setRadialMenu(null);
  }, [radialMenu, getMarker, addMarker, removeMarker]);

  const handleDoorToggle = useCallback((x, y, edge) => {
    dispatch({ type: 'TOGGLE_DOOR', x, y, edge });
  }, [dispatch]);

  // Calculate optimal cell size based on container dimensions
  React.useEffect(() => {
    const calculateCellSize = () => {
      if (!gridContainerRef.current || isCalculatingRef.current) return;

      const container = gridContainerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (containerWidth <= 0 || containerHeight <= 0) {
        return;
      }

      // Check if container size actually changed (with tolerance for rounding)
      const lastSize = lastCalculatedSizeRef.current;
      const widthDiff = Math.abs(containerWidth - lastSize.width);
      const heightDiff = Math.abs(containerHeight - lastSize.height);

      // Only recalculate if the size changed by more than 5px
      if (widthDiff < 5 && heightDiff < 5) {
        return;
      }

      isCalculatingRef.current = true;

      try {
        // Update the last calculated size
        lastCalculatedSizeRef.current = { width: containerWidth, height: containerHeight };

        const gridWidth = state.grid[0]?.length || 30;
        const gridHeight = state.grid.length || 30;

        const containerIsPortrait = containerHeight > containerWidth;
        const gridIsPortrait = gridHeight > gridWidth;

        // Determine if rotation is needed
        const needsRotation = containerIsPortrait !== gridIsPortrait;

        // Calculate cell size based on rotation
        // When rotated 90°, the grid's dimensions swap in the viewport
        const padding = 16;
        let maxCellWidth, maxCellHeight;

        if (needsRotation) {
          // After rotation: grid width (in cells) becomes viewport height, grid height becomes viewport width
          // So: containerWidth must fit gridHeight cells, containerHeight must fit gridWidth cells
          maxCellWidth = Math.floor((containerWidth - padding) / gridHeight);
          maxCellHeight = Math.floor((containerHeight - padding) / gridWidth);
        } else {
          // No rotation: straightforward mapping
          maxCellWidth = Math.floor((containerWidth - padding) / gridWidth);
          maxCellHeight = Math.floor((containerHeight - padding) / gridHeight);
        }

        // Use the smaller dimension to ensure the entire grid fits
        const optimalSize = Math.max(4, Math.min(maxCellWidth, maxCellHeight, 48));

        console.log('Grid calc:', {
          containerWidth, containerHeight,
          gridWidth, gridHeight,
          needsRotation,
          maxCellWidth, maxCellHeight,
          optimalSize,
          gridPixelWidth: gridWidth * optimalSize,
          gridPixelHeight: gridHeight * optimalSize,
          rotatedWidth: needsRotation ? gridHeight * optimalSize : gridWidth * optimalSize,
          rotatedHeight: needsRotation ? gridWidth * optimalSize : gridHeight * optimalSize
        });

        // Update state only if values changed
        setCellSize(prev => prev !== optimalSize ? optimalSize : prev);
        setShouldRotate(prev => prev !== needsRotation ? needsRotation : prev);

      } finally {
        // Reset flag after delay
        setTimeout(() => {
          isCalculatingRef.current = false;
        }, 200);
      }
    };

    // Debounced calculation
    let debounceTimer;
    const debouncedCalculate = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(calculateCellSize, 100);
    };

    // Initial calculation
    debouncedCalculate();

    // Resize listener
    window.addEventListener('resize', debouncedCalculate);

    // Only observe if container exists
    let resizeObserver;
    if (gridContainerRef.current) {
      resizeObserver = new ResizeObserver(debouncedCalculate);
      resizeObserver.observe(gridContainerRef.current);
    }

    return () => {
      clearTimeout(debounceTimer);
      window.removeEventListener('resize', debouncedCalculate);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      isCalculatingRef.current = false;
    };
  }, [state.grid, sidebarCollapsed]);
  // Step 1: Roll d66 for tile SHAPE (room layout and doors)
  const generateTileShape = () => {
    const roll = d66();
    const result = TILE_SHAPE_TABLE[roll];
    setLastShapeRoll({ roll, result });
    setLastContentsRoll(null); // Reset contents
    setRoomDetails(null);
    setBossCheckResult(null);
  dispatch({ type: 'LOG', t: `Tile Shape d66=${roll}: ${result.description}` });
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
    return (
  <div className="space-y-2 h-full flex flex-col">
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
            <div className="text-blue-400 font-bold">Shape: d66 = {lastShapeRoll.roll}</div>
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
      </div>      )}      {/* Dungeon Grid - No extra outline/container, never scrolls */}
      <div className="flex-1 flex flex-col overflow-hidden" data-dungeon-section="true">
        <div className="flex items-center justify-end gap-2 p-1">
          <div className="text-xs text-slate-300 mr-2">
            {showLogMiddle ? 'Viewing: Log' : 'Viewing: Map'}
          </div>
          <button
            onClick={() => onToggleShowLog && onToggleShowLog()}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
            title={showLogMiddle ? 'Show dungeon' : 'Show full log in middle pane'}
          >
            {showLogMiddle ? 'Map' : 'Log'}
          </button>
        </div>
  <div
          ref={gridContainerRef}
          className="flex-1 w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden"
          data-dungeon-grid="true"
          style={{ padding: 0, minHeight: 0, minWidth: 0 }}
        >
          {/* Grid container - only this rotates */}
          <div
            className="inline-block"
            style={{
              width: 'fit-content',
              height: 'fit-content',
            }}
          >
          <DungeonGridCanvas
            grid={state.grid}
            doors={state.doors}
            roomMarkers={roomMarkers}
            showMarkers={showMarkers}
            cellSize={cellSize}
            shouldRotate={shouldRotate}
            onCellClick={handleCellClick}
            onCellSet={handleCellSet}
            onCellRightClick={handleCellRightClick}
            onDoorToggle={handleDoorToggle}
          />
          {radialMenu && (
            <RadialMenu
              x={radialMenu.xPx}
              y={radialMenu.yPx}
              items={markerOptions}
              onSelect={handleRadialSelect}
              onClose={closeRadial}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
