import React, { useState, useCallback } from 'react';
import { AlertTriangle, DoorOpen, Puzzle, Coins, HelpCircle } from 'lucide-react';
import {
  TRAP_TABLE, TRAP_TYPES,
  PUZZLE_TABLE, PUZZLE_TYPES
} from '../data/rooms.js';
import { performSearch, rollWanderingMonster } from "../utils/gameActions/index.js";
import { addMonster, logMessage } from '../state/actionCreators.js';
import { TILE_SHAPE_TABLE } from '../data/rooms.js';
import { Tooltip, TOOLTIPS } from './RulesReference.jsx';
import DungeonHeaderButtons from './DungeonHeaderButtons.jsx';
import DungeonGridCanvas from './DungeonGridCanvas.jsx';
import { buildWallOffPerimeter } from '../utils/wallUtils.js';
import ContextMenu from './ContextMenu.jsx';
import { getEquipment, hasEquipment } from '../data/equipment.js';
import RadialMenu from './RadialMenu.jsx';

export default function Dungeon({ state, dispatch, tileResult: externalTileResult, generateTile: externalGenerateTile, clearTile: externalClearTile, bossCheckResult: externalBossCheck, roomDetails: externalRoomDetails, sidebarCollapsed = false, placementTemplate = null, onCommitPlacement = null, autoPlacedRoom = null, setAutoPlacedRoom = null, onShowRoomDesigner = null, onToggleShowLog = null, showLogMiddle = false }) {
  const [showMarkers, setShowMarkers] = useState(true); // Toggle markers visibility
  const [roomMarkers, setRoomMarkers] = useState({}); // {cellKey: {type, label, tooltip}}  const [hoveredCell, setHoveredCell] = useState(null); // For showing tooltip
  // Load persisted markers (notes) from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('roomMarkers');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setRoomMarkers(parsed);
      }
    } catch (e) {}
  }, []);

  // Listen for external updates to roomMarkers (written by other code paths)
  React.useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem('roomMarkers');
        if (!raw) { setRoomMarkers({}); return; }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') setRoomMarkers(parsed);
      } catch (e) { /* ignore */ }
    };
    window.addEventListener('roomMarkersUpdated', handler);
    return () => window.removeEventListener('roomMarkersUpdated', handler);
  }, []);
  const [radialMenu, setRadialMenu] = useState(null); // {xPx,yPx,cellX,cellY}
  const [contextMenu, setContextMenu] = useState(null); // {xPx,yPx,cellX,cellY}
  const [contextSelectedTile, setContextSelectedTile] = useState(null); // {x,y}
  const [cellSize, setCellSize] = useState(20); // Dynamic cell size
  const [shouldRotate, setShouldRotate] = useState(false); // Whether to rotate based on aspect ratio
  const [partyPos, setPartyPos] = useState(() => {
    try {
      const raw = localStorage.getItem('partyPos');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
        // Invalid stored value - remove it
        try { localStorage.removeItem('partyPos'); } catch (e) {}
      }
    } catch (e) {}
    return null;
  });
  const [partySelected, setPartySelected] = useState(false);
  const gridContainerRef = React.useRef(null);
  const isCalculatingRef = React.useRef(false); // Persistent flag across renders
  const lastCalculatedSizeRef = React.useRef({ width: 0, height: 0 }); // Track container size to prevent loops

  // Use external state from props
  const effectiveTileResult = externalTileResult;
  const effectiveBossCheck = externalBossCheck;
  const effectiveRoomDetails = externalRoomDetails;

  // Add marker to a cell
  const addMarker = useCallback((x, y, type, label, tooltip) => {
    const key = `${x},${y}`;
    setRoomMarkers(prev => {
      const next = { ...prev, [key]: { type, label, tooltip } };
      try { localStorage.setItem('roomMarkers', JSON.stringify(next)); } catch (e) {}
      return next;
    });
  }, []);

  // Remove marker from a cell
  const removeMarker = useCallback((x, y) => {
    const key = `${x},${y}`;
    setRoomMarkers(prev => {
      const newMarkers = { ...prev };
      delete newMarkers[key];
      try { localStorage.setItem('roomMarkers', JSON.stringify(newMarkers)); } catch (e) {}
      return newMarkers;
    });
  }, []);

  // Get marker for a cell
  const getMarker = useCallback((x, y) => {
    const key = `${x},${y}`;
    return roomMarkers[key];
  }, [roomMarkers]);

  const handleCellClick = useCallback((x, y) => {
    const cell = state.grid[y] && state.grid[y][x];
    if (cell === 1) {
      dispatch({ type: 'CYCLE_CELL_STYLE', x, y });
    } else {
  // When clicking to set a cell, ensure it's initialized with a 'full' visual style
  dispatch({ type: 'SET_CELL', x, y, value: 1, style: 'full' });
    }
  }, [dispatch, state.grid]);

  const handleCellSet = useCallback((x, y, value) => {
  // Ensure programmatic sets (drag/rectangle/placement) explicitly set a
  // fresh 'full' visual style for newly-filled cells so they don't inherit
  // any lingering diagonal/rounded variants from prior state.
  if (value === 1) dispatch({ type: 'SET_CELL', x, y, value, style: 'full' });
  else dispatch({ type: 'SET_CELL', x, y, value });
  }, [dispatch]);

  // Right-click opens context menu for actions
  const handleCellRightClick = useCallback((x, y, e, edge = null) => {
    e.preventDefault();
    // If our in-app context menu is already open, a right-click should close it and clear the highlight
    if (contextMenu) {
      setContextMenu(null);
      setContextSelectedTile(null);
      return;
    }
    const xPx = e.clientX;
    const yPx = e.clientY;
    // Compute menu position so it doesn't cover the tile: offset by 16px in the direction away from the tile center
    const rect = gridContainerRef.current?.getBoundingClientRect();
    const canvas = rect && gridContainerRef.current.querySelector('canvas');
    let menuX = xPx;
    let menuY = yPx;
    try {
      if (canvas) {
        const crect = canvas.getBoundingClientRect();
        const cellPxX = crect.left + x * cellSize + cellSize / 2;
        const cellPxY = crect.top + y * cellSize + cellSize / 2;
        // If menu would overlap the cell, nudge it to the nearest side
        const dx = xPx - cellPxX;
        const dy = yPx - cellPxY;
        const minDist = Math.max(8, cellSize / 2 + 8);
        if (Math.abs(dx) < minDist && Math.abs(dy) < minDist) {
          // push menu away along the larger axis
          if (Math.abs(dx) > Math.abs(dy)) {
            menuX = cellPxX + (dx > 0 ? minDist : -minDist);
          } else {
            menuY = cellPxY + (dy > 0 ? minDist : -minDist);
          }
        }
      }
    } catch (e) {}
    // detect if this right-click targeted a door edge and capture its index
    let doorEdge = null;
    let doorIdx = -1;
    try {
      if (edge) {
        const idx = (state.doors || []).findIndex(d => d.x === x && d.y === y && d.edge === edge);
        if (idx >= 0) { doorEdge = edge; doorIdx = idx; }
      } else {
        // try to detect any door on this cell (for fallback)
        const idx = (state.doors || []).findIndex(d => d.x === x && d.y === y);
        if (idx >= 0) { doorEdge = state.doors[idx].edge; doorIdx = idx; }
      }
    } catch (e) { /* ignore */ }

    setContextSelectedTile({ x, y });
    setContextMenu({ xPx: menuX, yPx: menuY, cellX: x, cellY: y, doorEdge, doorIdx });
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

  const closeContext = useCallback(() => { setContextMenu(null); setContextSelectedTile(null); }, []);

  // Party pawn handlers
  const movePartyTo = useCallback((x, y) => {
    if (x == null && y == null) {
      try { localStorage.removeItem('partyPos'); } catch (e) {}
      setPartyPos(null);
      return;
    }
    const next = { x, y };
    try { localStorage.setItem('partyPos', JSON.stringify(next)); } catch (e) {}
    setPartyPos(next);
  }, []);

  const selectParty = useCallback((sel) => {
    setPartySelected(Boolean(sel));
  }, []);

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

  // Intercept right-clicks inside the dungeon grid container to cancel the browser menu
  React.useEffect(() => {
    const container = gridContainerRef.current;
    if (!container) return;

  const handler = (e) => {
      try {
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        const cols = state.grid[0]?.length || 0;
        const rows = state.grid.length || 0;
        const width = cols * cellSize;
        const height = rows * cellSize;
        const canvasWidth = shouldRotate ? height : width;

        // Inverse mapping for rotated canvas (match DungeonGridCanvas logic)
        let logicalX = mouseX;
        let logicalY = mouseY;
        if (shouldRotate) {
          logicalX = mouseY;
          logicalY = canvasWidth - mouseX;
        }

        const x = Math.floor(logicalX / cellSize);
        const y = Math.floor(logicalY / cellSize);

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          // Prevent the browser context menu and open our menu; also highlight the tile
          e.preventDefault();
          e.stopPropagation();
          // Determine which edge (if any) was targeted so we can offer door actions
          let doorEdge = null;
          let doorIdx = -1;
          try {
            const logicalX = shouldRotate ? mouseY : mouseX;
            const logicalY = shouldRotate ? (canvasWidth - mouseX) : mouseY;
            const cellLocalX = ((logicalX % cellSize) + cellSize) % cellSize;
            const cellLocalY = ((logicalY % cellSize) + cellSize) % cellSize;
            const threshold = cellSize * 0.2;
            let edge = null;
            if (cellLocalY < threshold && cellLocalX < threshold) {
              edge = cellLocalY < cellLocalX ? 'N' : 'W';
            } else if (cellLocalY < threshold && cellLocalX > cellSize - threshold) {
              edge = cellLocalY < (cellSize - cellLocalX) ? 'N' : 'E';
            } else if (cellLocalY > cellSize - threshold && cellLocalX < threshold) {
              edge = (cellSize - cellLocalY) < cellLocalX ? 'S' : 'W';
            } else if (cellLocalY > cellSize - threshold && cellLocalX > cellSize - threshold) {
              edge = (cellSize - cellLocalY) < (cellSize - cellLocalX) ? 'S' : 'E';
            } else {
              if (cellLocalY < threshold) edge = 'N';
              else if (cellLocalY > cellSize - threshold) edge = 'S';
              else if (cellLocalX > cellSize - threshold) edge = 'E';
              else if (cellLocalX < threshold) edge = 'W';
            }
            if (edge) {
              const idx = (state.doors || []).findIndex(d => d.x === x && d.y === y && d.edge === edge);
              if (idx >= 0) { doorEdge = edge; doorIdx = idx; }
            }
          } catch (err) { /* ignore */ }

          setContextSelectedTile({ x, y });
          setContextMenu({ xPx: e.clientX, yPx: e.clientY, cellX: x, cellY: y, doorEdge, doorIdx });
        }
      } catch (err) {
        // ignore
      }
    };

    container.addEventListener('contextmenu', handler);
    return () => container.removeEventListener('contextmenu', handler);
  }, [cellSize, shouldRotate, state.grid]);
  return (
  <section id="dungeon_section" className="space-y-2 h-full flex flex-col">
      {/* Dungeon Grid - No extra outline/container, never scrolls */}
      <div className="flex-1 flex flex-col overflow-hidden" data-dungeon-section="true">
        <div id="dungeon_controls" className="flex items-center justify-end gap-2 p-1">
          <DungeonHeaderButtons
            showLogMiddle={showLogMiddle}
            onToggleShowLog={() => onToggleShowLog && onToggleShowLog()}
            onShowRoomDesigner={() => onShowRoomDesigner && onShowRoomDesigner()}
            onGenerateTile={() => typeof externalGenerateTile === 'function' ? externalGenerateTile() : null}
            onWandering={() => { try { rollWanderingMonster(dispatch, { state }); } catch (e) {} }}
            onCustomTile={() => {
              try {
                const rawD66 = prompt('Enter d66 (e.g. 11, 12, 21, 66):', '11');
                if (!rawD66) return;
                const shapeRoll = parseInt(rawD66, 10);
                if (Number.isNaN(shapeRoll) || !Object.keys(TILE_SHAPE_TABLE).includes(String(shapeRoll))) {
                  alert('Invalid d66 value');
                  return;
                }
                const raw2d6 = prompt('Enter 2d6 result (2-12):', '8');
                if (!raw2d6) return;
                const contentsRoll = parseInt(raw2d6, 10);
                if (Number.isNaN(contentsRoll) || contentsRoll < 2 || contentsRoll > 12) {
                  alert('Invalid 2d6 value');
                  return;
                }
                if (typeof externalGenerateTile === 'function') externalGenerateTile({ shapeRoll, contentsRoll });
              } catch (e) { console.error(e); }
            }}
            onCustomMonster={() => {
              try {
                const name = prompt('Monster Name?', 'Custom Monster') || 'Custom Monster';
                const level = parseInt(prompt('Monster Level (1-5)?', '2')) || 2;
                const isMajor = confirm('Is this a Major Foe (single creature with HP)? Cancel for Minor Foe (group with count).');
                let monster;
                if (isMajor) {
                  const hp = parseInt(prompt('HP?', '6')) || 6;
                  monster = { id: Date.now(), name, level, hp, maxHp: hp, type: 'custom', isMinorFoe: false };
                  dispatch(addMonster(monster));
                  dispatch(logMessage(`⚔️ ${name} L${level} (${hp}HP) Major Foe added`));
                } else {
                  const count = parseInt(prompt('How many?', '6')) || 6;
                  monster = { id: Date.now(), name, level, hp: 1, maxHp: 1, count, initialCount: count, type: 'custom', isMinorFoe: true };
                  dispatch(addMonster(monster));
                  dispatch(logMessage(`👥 ${count}x ${name} L${level} Minor Foes added`));
                }
              } catch (e) { console.error(e); }
            }}
            onClearMap={() => {
              try { dispatch({ type: 'CLEAR_GRID' }); } catch (e) {}
              try { if (typeof externalClearTile === 'function') externalClearTile(); } catch (e) {}
              try { localStorage.removeItem('roomMarkers'); try { window.dispatchEvent(new CustomEvent('roomMarkersUpdated')); } catch (e) {} } catch (e) {}
            }}
          />
        </div>
  <div
          id="dungeon_grid"
          ref={gridContainerRef}
          className="flex-1 w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden"
          data-dungeon-grid="true"
          style={{ padding: 0, minHeight: 0, minWidth: 0, position: 'relative' }}
        >
          {/* Helper text moved into DungeonGridCanvas to ensure it renders inside the grid stacking context */}

          {/* Grid container - only this rotates */}
          <div
            className="inline-block"
            style={{
              width: 'fit-content',
              height: 'fit-content',
            }}
          >
          <DungeonGridCanvas
            id="dungeon_grid_canvas"
            grid={state.grid}
            doors={state.doors}
            walls={state.walls || []}
            roomMarkers={roomMarkers}
            cellStyles={state.cellStyles || {}}
            showMarkers={showMarkers}
            cellSize={cellSize}
            shouldRotate={shouldRotate}
            contextMenuOpen={!!contextMenu}
            onContextDismiss={() => { setContextMenu(null); setContextSelectedTile(null); }}
            onCellClick={handleCellClick}
            onCellSet={handleCellSet}
            onCellRightClick={handleCellRightClick}
            onDoorToggle={handleDoorToggle}
            partyPos={partyPos}
            onPartyMove={movePartyTo}
            partySelected={partySelected}
            onPartySelect={selectParty}
            partyHasLight={(state.hasLightSource) || ((state.party || []).some(h => (h?.hp > 0) && (hasEquipment(h, 'lantern') || (Array.isArray(h?.equipment) && h.equipment.some(k => getEquipment(k)?.lightSource)))))}
            partyMembers={state.party}
            placementTemplate={placementTemplate}
            autoPlacedRoom={autoPlacedRoom}
            setAutoPlacedRoom={setAutoPlacedRoom}
            onCommitPlacement={onCommitPlacement}
            selectedTile={contextSelectedTile}
            onEditComplete={() => {
              try {
                const data = {
                  adventureId: state?.adventure?.adventureId || null,
                  roomEvents: [],
                  tileResult: (externalTileResult) ? externalTileResult : null,
                  roomDetails: (externalRoomDetails) ? externalRoomDetails : null,
                  bossCheckResult: effectiveBossCheck || null,
                  autoPlacedRoom: autoPlacedRoom || null
                };
                if ((data.roomEvents && data.roomEvents.length > 0) || data.tileResult || data.roomDetails || data.autoPlacedRoom) {
                  localStorage.setItem('lastTileData', JSON.stringify(data));
                } else {
                  localStorage.removeItem('lastTileData');
                }
              } catch (e) { /* ignore */ }
            }}
          />
          {contextMenu && (
            <ContextMenu
              x={contextMenu.xPx}
              y={contextMenu.yPx}
              onClose={closeContext}
              items={[
                { key: 'marker', label: 'Place marker', submenu: markerOptions.map(m => ({
                  key: m.key,
                  label: m.label || (m.key === 'clear' ? 'Clear' : (m.key.charAt(0).toUpperCase() + m.key.slice(1))),
                  onClick: () => {
                    const existing = getMarker(contextMenu.cellX, contextMenu.cellY);
                    if (m.key === 'clear') {
                      if (existing) removeMarker(contextMenu.cellX, contextMenu.cellY);
                    } else if (!existing) {
                      addMarker(contextMenu.cellX, contextMenu.cellY, m.key, m.key.charAt(0).toUpperCase() + m.key.slice(1), `${m.key} marker`);
                    } else if (existing && existing.type === m.key) {
                      removeMarker(contextMenu.cellX, contextMenu.cellY);
                    } else {
                      addMarker(contextMenu.cellX, contextMenu.cellY, m.key, m.key.charAt(0).toUpperCase() + m.key.slice(1), `${m.key} marker`);
                    }
                  }
                })), },
                { key: 'door', label: 'Door...', submenu: [
                  { key: 'N', label: 'North', onClick: () => dispatch({ type: 'TOGGLE_DOOR', x: contextMenu.cellX, y: contextMenu.cellY, edge: 'N' }) },
                  { key: 'S', label: 'South', onClick: () => dispatch({ type: 'TOGGLE_DOOR', x: contextMenu.cellX, y: contextMenu.cellY, edge: 'S' }) },
                  { key: 'E', label: 'East', onClick: () => dispatch({ type: 'TOGGLE_DOOR', x: contextMenu.cellX, y: contextMenu.cellY, edge: 'E' }) },
                  { key: 'W', label: 'West', onClick: () => dispatch({ type: 'TOGGLE_DOOR', x: contextMenu.cellX, y: contextMenu.cellY, edge: 'W' }) }
                ] },
                // If a door was clicked, offer Lock/Unlock toggle
                ...(contextMenu && typeof contextMenu.doorIdx === 'number' && contextMenu.doorIdx >= 0 ? [{ key: 'lock', label: (state.doors[contextMenu.doorIdx]?.locked ? 'Unlock door' : 'Lock door'), onClick: () => {
                    try {
                      const di = contextMenu.doorIdx;
                      // Toggle locked flag on the door
                      const newDoors = (state.doors || []).map((d, i) => i === di ? { ...d, locked: !d.locked } : d);
                      dispatch({ type: 'SET_DOORS', doors: newDoors });
                    } catch (e) {}
                  } }] : []),
                ...(contextMenu && typeof contextMenu.doorIdx === 'number' && contextMenu.doorIdx >= 0 ? [{ key: 'type', label: 'Door Type...', submenu: [
                  { key: 'normal', label: 'Normal', onClick: () => dispatch({ type: 'SET_DOOR_TYPE', doorIdx: contextMenu.doorIdx, doorType: 'normal' }) },
                  { key: 'magically_sealed', label: 'Magically sealed', onClick: () => dispatch({ type: 'SET_DOOR_TYPE', doorIdx: contextMenu.doorIdx, doorType: 'magically_sealed' }) },
                  { key: 'iron', label: 'Iron door', onClick: () => dispatch({ type: 'SET_DOOR_TYPE', doorIdx: contextMenu.doorIdx, doorType: 'iron' }) },
                  { key: 'illusionary', label: 'Illusionary', onClick: () => dispatch({ type: 'SET_DOOR_TYPE', doorIdx: contextMenu.doorIdx, doorType: 'illusionary' }) },
                  { key: 'trapped', label: 'Trap', onClick: () => dispatch({ type: 'SET_DOOR_TYPE', doorIdx: contextMenu.doorIdx, doorType: 'trapped' }) }
                ] }] : []),
                { key: 'wall', label: 'Wall off room', onClick: () => {
                    try {
                      const gridEl = state.grid;
                      const cols = gridEl[0]?.length || 0;
                      const rows = gridEl.length;
                      const sx = contextMenu.cellX; const sy = contextMenu.cellY;
                      if (!(sy >= 0 && sy < rows && sx >= 0 && sx < cols)) return;
                      if (gridEl[sy][sx] !== 1) return;
                      const styles = state.cellStyles || {};
                      const { region, perimeter } = buildWallOffPerimeter(gridEl, styles, sx, sy, { allowFallback: true });
                      try {
                        const existingWalls = state.walls || [];

                        // debug info to help diagnose missing walls
                        try {
                          console.debug('wall-off: regionSize=', region.size, 'perimeterCount=', perimeter.length, 'sample=', perimeter.slice(0,6));
                        } catch (e) {}

                        const allExist = perimeter.every(pe => existingWalls.some(w => w.x === pe.x && w.y === pe.y && w.edge === pe.edge));
                        if (allExist) {
                          // remove perimeter edges from existing walls
                          const newWalls = existingWalls.filter(w => !perimeter.some(pe => pe.x === w.x && pe.y === w.y && pe.edge === w.edge));
                          dispatch({ type: 'SET_WALLS', walls: newWalls });
                        } else {
                          // Remove any conflicting doors on these edges
                          (state.doors || []).forEach(d => {
                            if (perimeter.some(pe => pe.x === d.x && pe.y === d.y && pe.edge === d.edge)) {
                              dispatch({ type: 'TOGGLE_DOOR', x: d.x, y: d.y, edge: d.edge });
                            }
                          });

                          // Merge perimeter edges into existing walls without duplicating
                          const union = [...existingWalls];
                          perimeter.forEach(pe => {
                            if (!union.some(u => u.x === pe.x && u.y === pe.y && u.edge === pe.edge)) union.push(pe);
                          });
                          dispatch({ type: 'SET_WALLS', walls: union });
                        }
                        } catch (err) { console.error('wall-off error', err); }
                    } catch (e) { /* ignore */ }
                } },
                { key: 'note', label: 'Add Note', onClick: () => {
                    const txt = window.prompt('Enter note for this tile:');
                    if (txt && txt.trim()) {
                      // If a marker already exists on this tile, preserve its type/label
                      // and merge the note into its tooltip instead of replacing the marker.
                      const existing = getMarker(contextMenu.cellX, contextMenu.cellY);
                      if (existing) {
                        const mergedTooltip = existing.tooltip && existing.tooltip.length > 0
                          ? `${existing.tooltip} — Note: ${txt.trim()}`
                          : txt.trim();
                        addMarker(contextMenu.cellX, contextMenu.cellY, existing.type, existing.label, mergedTooltip);
                      } else {
                        // add as a note marker
                        addMarker(contextMenu.cellX, contextMenu.cellY, 'note', 'Note', txt.trim());
                      }
                    }
                  }
                }
              ]}
            />
          )}
          {radialMenu && (
            <div id="dungeon_radial_menu">
              <RadialMenu
                x={radialMenu.xPx}
                y={radialMenu.yPx}
                items={markerOptions}
                onSelect={handleRadialSelect}
                onClose={closeRadial}
              />
            </div>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
