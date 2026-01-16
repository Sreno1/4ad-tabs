import React, { useRef, useEffect, useCallback, memo, useState } from 'react';

import MARKER_STYLES from '../constants/markerStyles.js';

/**
 * High-performance canvas-based dungeon grid
 * Renders at 60 FPS with instant hover response
 */
const DungeonGridCanvas = memo(function DungeonGridCanvas({
  grid,
  doors,
  roomMarkers,
  showMarkers,
  cellSize,
  shouldRotate,
  onCellClick,
  onCellSet,
  onCellRightClick,
  onDoorToggle,
  partyPos,
  onPartyMove,
  partySelected,
  onPartySelect
}) {
  const canvasRef = useRef(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredDoor, setHoveredDoor] = useState(null);
  const [showDoorMode, setShowDoorMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFillValue, setDragFillValue] = useState(null); // 0, 1, or 2
  const [isPawnDragging, setIsPawnDragging] = useState(false);
  const draggedCellsRef = useRef(new Set()); // Track which cells we've already filled during this drag

  const cols = grid[0]?.length || 0;
  const rows = grid.length;
  const width = cols * cellSize;
  const height = rows * cellSize;
  const canvasWidth = shouldRotate ? height : width;
  const canvasHeight = shouldRotate ? width : height;

  // Draw the entire grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw cells
    if (shouldRotate) {
      // Rotate the drawing so the logical grid is displayed rotated 90deg clockwise
      ctx.save();
      ctx.translate(canvasWidth, 0);
      ctx.rotate(Math.PI / 2);
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = grid[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        // Cell color
        if (cell === 1) {
          ctx.fillStyle = '#b45309'; // amber-700
        } else if (cell === 2) {
          ctx.fillStyle = '#1d4ed8'; // blue-700
        } else {
          ctx.fillStyle = '#0f172a'; // slate-900
        }
        ctx.fillRect(px, py, cellSize, cellSize);

        // Hover highlight
        if (hoveredCell?.x === x && hoveredCell?.y === y) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(px, py, cellSize, cellSize);
        }

        // Cell border
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);

        // Markers
        if (showMarkers && roomMarkers[`${x},${y}`]) {
          const marker = roomMarkers[`${x},${y}`];
          const style = MARKER_STYLES[marker.type];
          if (style) {
            // Marker background
            ctx.fillStyle = style.color;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.globalAlpha = 1.0;

            // Marker character
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.max(8, cellSize * 0.6)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(style.char, px + cellSize / 2, py + cellSize / 2);
          }
        }
      }
    }

  // Draw doors
    const doorThickness = Math.max(2, Math.floor(cellSize * 0.15));
    ctx.fillStyle = '#f59e0b'; // amber-500

    doors.forEach(door => {
      const px = door.x * cellSize;
      const py = door.y * cellSize;

      if (door.edge === 'N') {
        ctx.fillRect(px, py - 1, cellSize, 3);
      } else if (door.edge === 'S') {
        ctx.fillRect(px, py + cellSize - 2, cellSize, 3);
      } else if (door.edge === 'E') {
        ctx.fillRect(px + cellSize - 2, py, 3, cellSize);
      } else if (door.edge === 'W') {
        ctx.fillRect(px - 1, py, 3, cellSize);
      }
    });

  // Draw door placement guides - always show on room cells (but not while dragging)
    if (hoveredCell && !isDragging) {
      const cell = grid[hoveredCell.y]?.[hoveredCell.x];
      if (cell > 0) {
        const px = hoveredCell.x * cellSize;
        const py = hoveredCell.y * cellSize;

        const edges = [
          { edge: 'N', x1: px, y1: py, x2: px + cellSize, y2: py },
          { edge: 'S', x1: px, y1: py + cellSize, x2: px + cellSize, y2: py + cellSize },
          { edge: 'E', x1: px + cellSize, y1: py, x2: px + cellSize, y2: py + cellSize },
          { edge: 'W', x1: px, y1: py, x2: px, y2: py + cellSize }
        ];

        edges.forEach(({ edge, x1, y1, x2, y2 }) => {
          const hasDoor = doors.some(d => d.x === hoveredCell.x && d.y === hoveredCell.y && d.edge === edge);
          const isHoveredDoor = hoveredDoor?.edge === edge;

          // Always show edges on hover, bright when edge is hovered
          ctx.strokeStyle = isHoveredDoor ? '#fbbf24' : '#64748b'; // amber-400 or slate-500
          ctx.lineWidth = isHoveredDoor ? 3 : 2;
          ctx.globalAlpha = isHoveredDoor ? 1.0 : 0.5;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        ctx.globalAlpha = 1.0;
      }
    }

    // Draw party pawn on top (inside same rotated context so it aligns)
    if (partyPos && typeof partyPos.x === 'number' && typeof partyPos.y === 'number') {
      const px = partyPos.x * cellSize;
      const py = partyPos.y * cellSize;
      const cx = px + cellSize / 2;
      const cy = py + cellSize / 2;
      const radius = Math.max(4, cellSize * 0.32);

      // Outer ring (selected -> brighter)
      ctx.beginPath();
      ctx.fillStyle = partySelected ? '#fbbf24' : '#f59e0b';
      ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner pawn body
      ctx.beginPath();
      ctx.fillStyle = '#0f172a';
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Letter P
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.45))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', cx, cy + 1);
    }

        if (shouldRotate) {
          ctx.restore();
        }

  }, [grid, doors, roomMarkers, showMarkers, cellSize, hoveredCell, hoveredDoor, showDoorMode, rows, cols, width, height, partyPos, partySelected]);

  // Redraw when dependencies change
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map mouse coordinates to logical canvas coordinates.
    // When drawing rotated (we set canvas width/height swapped and applied
    // ctx.translate(canvasWidth,0); ctx.rotate(+90deg)), the forward mapping is:
    // sx = -ly + canvasWidth, sy = lx  (where lx,ly are logical pixel coords)
    // Inverse mapping therefore is:
    // lx = sy, ly = canvasWidth - sx
    let logicalX = mouseX;
    let logicalY = mouseY;
    if (shouldRotate) {
      logicalX = mouseY;
      logicalY = canvasWidth - mouseX;
    }

    const x = Math.floor(logicalX / cellSize);
    const y = Math.floor(logicalY / cellSize);

    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      // Check if we changed cells
      if (!hoveredCell || hoveredCell.x !== x || hoveredCell.y !== y) {
        setHoveredCell({ x, y });

        // If pawn is being dragged, move it to this cell
        if (isPawnDragging && onPartyMove) {
          onPartyMove(x, y);
        }

        // If we're dragging to paint, fill this cell
        if (isDragging && dragFillValue !== null && onCellSet) {
          const cellKey = `${x},${y}`;
          // Only fill if we haven't already filled this cell in this drag session
          if (!draggedCellsRef.current.has(cellKey)) {
            draggedCellsRef.current.add(cellKey);
            onCellSet(x, y, dragFillValue);
          }
        }
      }

      // Check which door edge we're hovering (always detect for room cells)
      const cell = grid[y]?.[x];
      if (cell > 0) {
        // Use logical (unrotated) cell-local coordinates
  const cellX = ((logicalX % cellSize) + cellSize) % cellSize;
  const cellY = ((logicalY % cellSize) + cellSize) % cellSize;
        const threshold = cellSize * 0.35; // Larger threshold = easier to click

        let edge = null;
        // Prioritize corners by checking them first
        if (cellY < threshold && cellX < threshold) {
          edge = cellY < cellX ? 'N' : 'W';
        } else if (cellY < threshold && cellX > cellSize - threshold) {
          edge = cellY < (cellSize - cellX) ? 'N' : 'E';
        } else if (cellY > cellSize - threshold && cellX < threshold) {
          edge = (cellSize - cellY) < cellX ? 'S' : 'W';
        } else if (cellY > cellSize - threshold && cellX > cellSize - threshold) {
          edge = (cellSize - cellY) < (cellSize - cellX) ? 'S' : 'E';
        } else {
          // Check straight edges
          if (cellY < threshold) edge = 'N';
          else if (cellY > cellSize - threshold) edge = 'S';
          else if (cellX > cellSize - threshold) edge = 'E';
          else if (cellX < threshold) edge = 'W';
        }

        if (edge && (!hoveredDoor || hoveredDoor.edge !== edge)) {
          setHoveredDoor({ edge });
        } else if (!edge && hoveredDoor) {
          setHoveredDoor(null);
        }
      } else if (hoveredDoor) {
        setHoveredDoor(null);
      }
    } else {
      if (hoveredCell) setHoveredCell(null);
      if (hoveredDoor) setHoveredDoor(null);
    }
  }, [cellSize, cols, rows, grid, hoveredCell, hoveredDoor, showDoorMode, isDragging, dragFillValue, onCellSet, isPawnDragging, onPartyMove]);
  

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setHoveredDoor(null);
    // Don't reset isDragging or didDragRef here - let mouseUp handle it
    // This prevents doors from being placed when dragging ends outside the canvas
  }, []);

  const handleMouseDown = useCallback((e) => {
    // Don't start drag on right click
    if (e.button !== 0) return;
  if (!hoveredCell) return;

  // If Shift is held, don't start normal mousedown-driven actions (painting or pawn-drag).
  // Shift+Click is handled in the click handler for placing/removing the pawn.
  if (e.shiftKey) return;

    const cell = grid[hoveredCell.y]?.[hoveredCell.x];

    // Don't drag when placing doors
    if (hoveredDoor && cell > 0) {
      return;
    }

    // If user clicked the pawn, start pawn-drag instead of grid-drag
    if (partyPos && hoveredCell.x === partyPos.x && hoveredCell.y === partyPos.y) {
      setIsPawnDragging(true);
      if (onPartySelect) onPartySelect(true);
      if (onPartyMove) onPartyMove(hoveredCell.x, hoveredCell.y);
      return;
    }

    // Start dragging - determine what value to fill
    // Cycle: 0 -> 1 -> 2 -> 0
    const nextValue = cell === 0 ? 1 : cell === 1 ? 2 : 0;
    setDragFillValue(nextValue);
    setIsDragging(true);
    draggedCellsRef.current.clear();

    // Add the starting cell
    const cellKey = `${hoveredCell.x},${hoveredCell.y}`;
    draggedCellsRef.current.add(cellKey);

    // Use onCellSet if available for consistent drag behavior, otherwise toggle
    if (onCellSet) {
      onCellSet(hoveredCell.x, hoveredCell.y, nextValue);
    } else {
      onCellClick(hoveredCell.x, hoveredCell.y);
    }
  }, [hoveredCell, hoveredDoor, grid, onCellClick, onCellSet, partyPos, onPartyMove, onPartySelect]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragFillValue(null);
    setIsPawnDragging(false);
    // Don't clear draggedCellsRef yet - we need it for the click check
    // It will be cleared in the next mousedown or mouseup via ref reset
  }, []);

  const handleClick = useCallback((e) => {
    // Don't process click if we dragged across multiple cells
    if (draggedCellsRef.current.size > 1) {
      draggedCellsRef.current.clear();
      return;
    }
    draggedCellsRef.current.clear();

    if (!hoveredCell) return;
    const cell = grid[hoveredCell.y]?.[hoveredCell.x];

    // Shift+Click: place pawn here
    if (e.shiftKey) {
      // If there is a pawn on this cell, remove it (signal with onPartyMove null)
      if (partyPos && hoveredCell.x === partyPos.x && hoveredCell.y === partyPos.y) {
        if (onPartyMove) onPartyMove(null, null);
        if (onPartySelect) onPartySelect(false);
        return;
      }
      // Otherwise place pawn here
      if (onPartyMove) onPartyMove(hoveredCell.x, hoveredCell.y);
      if (onPartySelect) onPartySelect(true);
      return;
    }

    // If clicking the pawn, toggle selection
    if (partyPos && hoveredCell.x === partyPos.x && hoveredCell.y === partyPos.y) {
      if (onPartySelect) onPartySelect(!partySelected);
      return;
    }

    // If hovering a door edge on a room cell, toggle door (always, no shift needed!)
    if (hoveredDoor && cell > 0) {
      onDoorToggle(hoveredCell.x, hoveredCell.y, hoveredDoor.edge);
    } else {
      // Regular cell click (now handled by mousedown/mouseup for drag support)
    }
  }, [hoveredCell, hoveredDoor, grid, onDoorToggle, onPartyMove, onPartySelect, partyPos, partySelected]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (!hoveredCell) return;
    onCellRightClick(hoveredCell.x, hoveredCell.y, e);
  }, [hoveredCell, onCellRightClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'd' || e.key === 'D') {
      setShowDoorMode(true);
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'd' || e.key === 'D') {
      setShowDoorMode(false);
    }
  }, []);

  // Add keyboard listeners
  useEffect(() => {
    const handleGridKeyDown = (e) => {
      if (!hoveredCell) return;
      let edge = null;
      if (e.key === 'w' || e.key === 'W') edge = 'N';
      if (e.key === 's' || e.key === 'S') edge = 'S';
      if (e.key === 'a' || e.key === 'A') edge = 'W';
      if (e.key === 'd' || e.key === 'D') edge = 'E';
      if (edge) {
        e.preventDefault();
        onDoorToggle(hoveredCell.x, hoveredCell.y, edge);
      }
    };
    const handleArrow = (e) => {
      if (!partySelected || !partyPos) return;
      let dx = 0; let dy = 0;
      if (e.key === 'ArrowUp') dy = -1;
      if (e.key === 'ArrowDown') dy = 1;
      if (e.key === 'ArrowLeft') dx = -1;
      if (e.key === 'ArrowRight') dx = 1;
      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        const nx = Math.min(Math.max(0, partyPos.x + dx), cols - 1);
        const ny = Math.min(Math.max(0, partyPos.y + dy), rows - 1);
        if (onPartyMove) onPartyMove(nx, ny);
      }
    };

    window.addEventListener('keydown', handleGridKeyDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleArrow);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGridKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleArrow);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, hoveredCell, onDoorToggle]);

  // Add global mouseup listener to handle drag ending outside canvas
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  return (
    <div
      style={{
        position: 'relative',
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          imageRendering: 'pixelated',
          cursor: isDragging ? 'grabbing' : hoveredDoor ? 'crosshair' : 'pointer',
          display: 'block'
        }}
      />
      {hoveredDoor && (
        <div className="absolute top-2 left-2 bg-amber-900/90 text-amber-100 px-2 py-1 rounded text-xs font-bold border border-amber-500">
          Click to place door on {hoveredDoor.edge} edge
        </div>
      )}
      {!partyPos && (
        <div
          className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-xs font-semibold"
          style={{ zIndex: 9999, pointerEvents: 'none' }}
        >
          Shift+Click to add the party pawn
        </div>
      )}
    </div>
  );
});

export default DungeonGridCanvas;
