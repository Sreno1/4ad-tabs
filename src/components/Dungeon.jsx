import React, { useState, useCallback } from 'react';
import { AlertTriangle, DoorOpen, Puzzle, Coins, HelpCircle } from 'lucide-react';
import {
  TRAP_TABLE, TRAP_TYPES,
  PUZZLE_TABLE, PUZZLE_TYPES
} from '../data/rooms.js';
import { performSearch, rollWanderingMonster } from "../utils/gameActions/index.js";
import { Tooltip, TOOLTIPS } from './RulesReference.jsx';
import DungeonGridCanvas from './DungeonGridCanvas.jsx';
import { getEquipment, hasEquipment } from '../data/equipment.js';
import RadialMenu from './RadialMenu.jsx';

export default function Dungeon({ state, dispatch, tileResult: externalTileResult, generateTile: externalGenerateTile, clearTile: externalClearTile, bossCheckResult: externalBossCheck, roomDetails: externalRoomDetails, sidebarCollapsed = false, placementTemplate = null, onCommitPlacement = null, autoPlacedRoom = null, setAutoPlacedRoom = null, onShowRoomDesigner = null, onToggleShowLog = null, showLogMiddle = false }) {
  const [showMarkers, setShowMarkers] = useState(true); // Toggle markers visibility
  const [roomMarkers, setRoomMarkers] = useState({}); // {cellKey: {type, label, tooltip}}  const [hoveredCell, setHoveredCell] = useState(null); // For showing tooltip
  const [radialMenu, setRadialMenu] = useState(null); // {xPx,yPx,cellX,cellY}
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
  return (
  <section id="dungeon_section" className="space-y-2 h-full flex flex-col">
      {/* Dungeon Grid - No extra outline/container, never scrolls */}
      <div className="flex-1 flex flex-col overflow-hidden" data-dungeon-section="true">
        <div id="dungeon_controls" className="flex items-center justify-end gap-2 p-1">
          <div id="dungeon_view_display" className="text-xs text-slate-300 mr-2">
            {showLogMiddle ? 'Viewing: Log' : 'Viewing: Map'}
          </div>
          <div id="dungeon_header_buttons" className="flex items-center gap-2">
            <button
              id="dungeon_toggle_log_button"
              onClick={() => onToggleShowLog && onToggleShowLog()}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
              title={showLogMiddle ? 'Show dungeon' : 'Show full log in middle pane'}
            >
              {showLogMiddle ? 'Map' : 'Log'}
            </button>
            <button
              id="dungeon_room_designer_button"
              onClick={() => onShowRoomDesigner && onShowRoomDesigner()}
              className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
              title="Open Room Designer"
            >
              Designer
            </button>
          </div>
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
            roomMarkers={roomMarkers}
            showMarkers={showMarkers}
            cellSize={cellSize}
            shouldRotate={shouldRotate}
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
