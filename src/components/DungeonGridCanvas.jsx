import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { getEquipment } from '../data/equipment.js';
import sfx from '../utils/sfx.js';

import MARKER_STYLES from '../constants/markerStyles.js';

/**
 * High-performance canvas-based dungeon grid
 * Renders at 60 FPS with instant hover response
 */
const DungeonGridCanvas = memo(function DungeonGridCanvas({
  grid,
  doors,
  walls = [],
  roomMarkers,
  showMarkers,
  cellSize,
  shouldRotate,
  selectedTile = null,
  onCellClick,
  onCellSet,
  onCellRightClick,
  suppressContextAction = false,
  onDoorToggle,
  partyPos,
  onPartyMove,
  partySelected,
  onPartySelect,
  partyMembers = [],
  showPawnHint = true,
  placementTemplate = null,
  autoPlacedRoom = null,
  setAutoPlacedRoom = null,
  onCommitPlacement = null,
  onEditComplete = null,
  partyHasLight = false,
  contextMenuOpen = false,
  onContextDismiss = null,
}) {
  const canvasRef = useRef(null);
  const pressedKeysRef = useRef(new Set()); // Track currently pressed arrow keys for continuous movement
  const gameLoopRef = useRef(null); // Track the animation frame ID for pawn movement
  const lightAnimRef = useRef(null); // RAF id for light flicker animation
  const drawGridRef = useRef(null);
  const currentStateRef = useRef(null); // Keep current state accessible
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredDoor, setHoveredDoor] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [tooltipText, setTooltipText] = useState(null);
  const [showDoorMode, setShowDoorMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragFillValue, setDragFillValue] = useState(null); // 0, 1, or 2
  const [isPawnDragging, setIsPawnDragging] = useState(false);
  const draggedCellsRef = useRef(new Set()); // Track which cells we've already filled during this drag
  const rectStartRef = useRef(null); // {x,y} when cmd/meta rectangle drag starts
  const [rectPreview, setRectPreview] = useState(null); // {x1,y1,x2,y2,value}

  // When placing a template from the Room Designer, we keep a local, transformable
  // copy so the player can rotate/mirror it with keyboard shortcuts (Q/E/W).
  const [transformedPlacementTemplate, setTransformedPlacementTemplate] = useState(null);

  const cols = grid[0]?.length || 0;
  const rows = grid.length;

  // If the party composition changes such that no alive member carries an equipped
  // light source, cancel the light animation and force an immediate redraw so the
  // glow disappears without requiring the user to alt-tab. (Effect is added later
  // after drawGrid is available; see below.)

  // Party members array (from parent) - used to detect if an alive member still carries a light
  // ...existing code...

  // Initialize currentStateRef on first render
  if (!currentStateRef.current) {
    currentStateRef.current = { partyPos, onPartyMove, cols, rows };
  }
  const width = cols * cellSize;
  const height = rows * cellSize;
  const canvasWidth = shouldRotate ? height : width;
  const canvasHeight = shouldRotate ? width : height;

  // Update current state ref whenever props change
  useEffect(() => {
    currentStateRef.current = { partyPos, onPartyMove, cols, rows };
  }, [partyPos, onPartyMove, cols, rows]);

  // Update tooltip position when hoveredCell changes and there is a marker tooltip
  useEffect(() => {
    if (!hoveredCell) {
      setTooltipText(null);
      setTooltipPos(null);
      return;
    }
    const key = `${hoveredCell.x},${hoveredCell.y}`;
    const marker = roomMarkers && roomMarkers[key];
    if (!marker || !marker.tooltip) {
      setTooltipText(null);
      setTooltipPos(null);
      return;
    }

    // compute screen-space center for the logical cell
    const canvas = canvasRef.current;
    if (!canvas) return;
    const crect = canvas.getBoundingClientRect();
    const logicalCx = hoveredCell.x * cellSize + cellSize / 2;
    const logicalCy = hoveredCell.y * cellSize + cellSize / 2;
    let screenCx = logicalCx;
    let screenCy = logicalCy;
    if (shouldRotate) {
      screenCx = canvasWidth - logicalCy;
      screenCy = logicalCx;
    }

    const left = crect.left + screenCx;
    const top = crect.top + screenCy;
    setTooltipText(marker.tooltip);
    setTooltipPos({ left, top });
  }, [hoveredCell, roomMarkers, cellSize, shouldRotate, canvasWidth]);

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
    // Collect wall edges to draw after the cell loop so they are rendered on top
    const wallEdges = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = grid[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        // Cell color
        if (cell === 1) {
          // Room cells: render as true black
          ctx.fillStyle = '#000000';
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

        // Collect wall edges for later drawing (avoid being overdrawn by subsequent cells)
        if (walls && walls.length > 0) {
          if (walls.some(w => w.x === x && w.y === y && w.edge === 'N')) wallEdges.push({ x, y, edge: 'N' });
          if (walls.some(w => w.x === x && w.y === y && w.edge === 'S')) wallEdges.push({ x, y, edge: 'S' });
          if (walls.some(w => w.x === x && w.y === y && w.edge === 'E')) wallEdges.push({ x, y, edge: 'E' });
          if (walls.some(w => w.x === x && w.y === y && w.edge === 'W')) wallEdges.push({ x, y, edge: 'W' });
        }

        // Cell border
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);

        // Highlight selected tile (editing)
        if (selectedTile && selectedTile.x === x && selectedTile.y === y) {
          ctx.strokeStyle = '#34d399'; // green-400
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
        }

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

  // Draw walls (collected earlier) on top of cells and doors
    if (wallEdges.length > 0) {
      ctx.fillStyle = '#ffffff';
      const wt = Math.max(1, Math.floor(cellSize * 0.08));
      wallEdges.forEach(w => {
        const px = w.x * cellSize;
        const py = w.y * cellSize;
        if (w.edge === 'N') {
          ctx.fillRect(px, py - Math.floor(wt/2), cellSize, wt);
        } else if (w.edge === 'S') {
          ctx.fillRect(px, py + cellSize - Math.floor(wt/2), cellSize, wt);
        } else if (w.edge === 'E') {
          ctx.fillRect(px + cellSize - Math.floor(wt/2), py, wt, cellSize);
        } else if (w.edge === 'W') {
          ctx.fillRect(px - Math.floor(wt/2), py, wt, cellSize);
        }
      });
    }

  // Draw door placement guides - always show on room cells (but not while dragging)
    if (hoveredCell && !isDragging) {
      const cell = grid[hoveredCell.y]?.[hoveredCell.x];
      if (cell > 0) {
        const px = hoveredCell.x * cellSize;
        const py = hoveredCell.y * cellSize;
        const threshold = cellSize * 0.2; // Match the detection threshold

        const edges = [
          { edge: 'N', x1: px, y1: py, x2: px + cellSize, y2: py },
          { edge: 'S', x1: px, y1: py + cellSize, x2: px + cellSize, y2: py + cellSize },
          { edge: 'E', x1: px + cellSize, y1: py, x2: px + cellSize, y2: py + cellSize },
          { edge: 'W', x1: px, y1: py, x2: px, y2: py + cellSize }
        ];

        // Draw clickable zones behind the guides
        edges.forEach(({ edge }) => {
          const isHoveredDoor = hoveredDoor?.edge === edge;

          if (isHoveredDoor) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.15)'; // amber glow

            // Draw zone rectangle for this edge
            if (edge === 'N') {
              ctx.fillRect(px, py - threshold, cellSize, threshold);
            } else if (edge === 'S') {
              ctx.fillRect(px, py + cellSize, cellSize, threshold);
            } else if (edge === 'E') {
              ctx.fillRect(px + cellSize, py, threshold, cellSize);
            } else if (edge === 'W') {
              ctx.fillRect(px - threshold, py, threshold, cellSize);
            }
          }
        });

        edges.forEach(({ edge, x1, y1, x2, y2 }) => {
          const hasDoor = doors.some(d => d.x === hoveredCell.x && d.y === hoveredCell.y && d.edge === edge);
          const isHoveredDoor = hoveredDoor?.edge === edge;

          // Always show edges on hover, bright when edge is hovered
          ctx.strokeStyle = isHoveredDoor ? '#fbbf24' : '#94a3b8'; // amber-400 or slate-400
          ctx.lineWidth = isHoveredDoor ? 4 : 2;
          ctx.globalAlpha = isHoveredDoor ? 1.0 : 0.6;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        ctx.globalAlpha = 1.0;
      }
    }

  // NOTE: we intentionally do not draw the party pawn here when the canvas
  // context is rotated, because we want the pawn icon and label to remain
  // visually upright for readability. The pawn will be drawn after the
  // rotation is restored (see below).

    // Draw placement preview centered on hoveredCell when placementTemplate or autoPlacedRoom present
    // Prefer the locally transformed placement template (keyboard-rotated/mirrored) when available
    const activeTemplate = transformedPlacementTemplate || placementTemplate || autoPlacedRoom;
    if (activeTemplate && hoveredCell) {
      const tpl = activeTemplate.grid || activeTemplate;
      const tplDoors = activeTemplate.doors || [];
      // Center template at hoveredCell
      const startX = hoveredCell.x - Math.floor(tpl[0].length / 2);
      const startY = hoveredCell.y - Math.floor(tpl.length / 2);

      for (let ry = 0; ry < tpl.length; ry++) {
        for (let rx = 0; rx < tpl[ry].length; rx++) {
          const val = tpl[ry][rx];
          if (!val || val === 0) continue; // do not preview empty cells
          const gx = startX + rx;
          const gy = startY + ry;
          // Draw only if inside canvas bounds
          if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
            const px = gx * cellSize;
            const py = gy * cellSize;
            ctx.fillStyle = val === 1 ? 'rgba(180,83,9,0.6)' : 'rgba(29,78,216,0.6)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
          }
        }
      }

      // Draw doors preview
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.12));
      tplDoors.forEach(d => {
        const gx = startX + (d.x || 0);
        const gy = startY + (d.y || 0);
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          const px = gx * cellSize;
          const py = gy * cellSize;
          if (d.edge === 'N') ctx.fillRect(px, py - 1, cellSize, 3);
          if (d.edge === 'S') ctx.fillRect(px, py + cellSize - 2, cellSize, 3);
          if (d.edge === 'E') ctx.fillRect(px + cellSize - 2, py, 3, cellSize);
          if (d.edge === 'W') ctx.fillRect(px - 1, py, 3, cellSize);
        }
      });
    }

    // Draw rectangle preview when user is holding Meta/Cmd and dragging
    if (rectPreview) {
      const { x1, y1, x2, y2, value } = rectPreview;
      for (let gy = y1; gy <= y2; gy++) {
        for (let gx = x1; gx <= x2; gx++) {
          if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
          const px = gx * cellSize;
          const py = gy * cellSize;
          // Choose preview color based on value
          if (value === 1) ctx.fillStyle = 'rgba(180,83,9,0.45)';
          else if (value === 2) ctx.fillStyle = 'rgba(29,78,216,0.45)';
          else ctx.fillStyle = 'rgba(120,120,120,0.35)';
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

        if (shouldRotate) {
          ctx.restore();
        }

    // Draw the party pawn on top of everything, but outside the rotated
    // drawing context so the icon/text stays upright. Compute screen-space
    // coordinates that correspond to the logical party position.
    if (partyPos && typeof partyPos.x === 'number' && typeof partyPos.y === 'number') {
      // logical center in pixels
      const logicalCx = partyPos.x * cellSize + cellSize / 2;
      const logicalCy = partyPos.y * cellSize + cellSize / 2;

      // convert logical -> screen coordinates depending on rotation
      let screenCx = logicalCx;
      let screenCy = logicalCy;
      if (shouldRotate) {
        // when we rotated the canvas with: translate(canvasWidth,0); rotate(+90deg)
        // the forward mapping was: sx = canvasWidth - ly, sy = lx
        // so here we invert that: sx = canvasWidth - logicalCy, sy = logicalCx
        screenCx = canvasWidth - logicalCy;
        screenCy = logicalCx;
      }

      const radius = Math.max(4, cellSize * 0.32);

          // Draw flickering light glow behind pawn if party has a light source
          if (partyHasLight) {
  // Compute whether pawn is inside a room cell now (used both for clipping and corner bounces)
  const inRoom = partyPos && typeof partyPos.x === 'number' && typeof partyPos.y === 'number' && grid[partyPos.y] && grid[partyPos.y][partyPos.x] === 1;

  // Prepare clipping: when inside a room, clip light to that room rect;
  // when outside, exclude all room rects so light doesn't travel into rooms.
  ctx.save();
  try {
    // helper: convert logical cell rect (rx,ry) to screen-space rect depending on rotation
    const screenRectFor = (rx, ry) => {
      const lx = rx * cellSize;
      const ly = ry * cellSize;
      if (shouldRotate) {
        // mapping: sx = canvasWidth - ly, sy = lx for logical pixel coords. For a rect, compute
        // top-left in screen space as: (canvasWidth - (ly + cellSize), lx)
        return { x: canvasWidth - (ly + cellSize), y: lx };
      }
      return { x: lx, y: ly };
    };

    if (inRoom) {
      // Flood-fill connected room cells (orthogonal) starting at partyPos
      const toVisit = [{ x: partyPos.x, y: partyPos.y }];
      const visited = new Set();
      const cells = [];
      while (toVisit.length) {
        const c = toVisit.pop();
        const key = `${c.x},${c.y}`;
        if (visited.has(key)) continue;
        visited.add(key);
        if (!(c.y >= 0 && c.y < rows && c.x >= 0 && c.x < cols)) continue;
        if (!grid[c.y] || grid[c.y][c.x] !== 1) continue;
        cells.push({ x: c.x, y: c.y });
        // add neighbors
        toVisit.push({ x: c.x + 1, y: c.y });
        toVisit.push({ x: c.x - 1, y: c.y });
        toVisit.push({ x: c.x, y: c.y + 1 });
        toVisit.push({ x: c.x, y: c.y - 1 });
      }

      if (cells.length > 0) {
        // Build path of all connected room rects in screen space and clip to it
        ctx.beginPath();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        cells.forEach(cell => {
          const sr = screenRectFor(cell.x, cell.y);
          ctx.rect(sr.x, sr.y, cellSize, cellSize);
          minX = Math.min(minX, sr.x);
          minY = Math.min(minY, sr.y);
          maxX = Math.max(maxX, sr.x);
          maxY = Math.max(maxY, sr.y);
        });
        ctx.clip();

        // Draw a soft room-wide fill across the clipped region so black rooms show as lit
        try {
          // tighten the room-wide gradient so it doesn't bleed too far outside the room
          const roomGrad = ctx.createRadialGradient(screenCx, screenCy, radius * 0.35, screenCx, screenCy, Math.max(cellSize * 0.9, Math.max(maxX - minX, maxY - minY) * 0.9));
          roomGrad.addColorStop(0, `rgba(255,220,140,${0.22 * inRoomAlpha})`);
          roomGrad.addColorStop(0.6, `rgba(255,180,90,${0.08 * inRoomAlpha})`);
          roomGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = roomGrad;
          // Fill entire canvas; clipping ensures only the room region is affected
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } catch (e) {
          // ignore
        }

        // Use bounding box for corner glints below
        // store bounding values for later use
        var __roomBounds = { minX, minY, maxX: maxX + cellSize, maxY: maxY + cellSize };
      }
    } else {
      // Create an outer rect and add each room rect so clip with 'evenodd' will cut holes
      ctx.beginPath();
      ctx.rect(0, 0, canvasWidth, canvasHeight);
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          if (grid[ry] && grid[ry][rx] === 1) {
            const sr = screenRectFor(rx, ry);
            ctx.rect(sr.x, sr.y, cellSize, cellSize);
          }
        }
      }
      // Use even-odd rule to exclude room rectangles from the clipping region. If unsupported,
      // fall back to the default clip (which will not exclude rooms) to avoid throwing.
      try { ctx.clip('evenodd'); } catch (e) { ctx.clip(); }
    }
  } catch (e) {
    // If clipping fails for any reason, continue without clipping
  }

  // Use two offset gradients with independent motion to make the glow irregular
  const t = Date.now() / 700; // time base
  const ox1 = Math.sin(t * 0.9) * radius * 0.35 + Math.sin(t * 0.45) * radius * 0.15;
  const oy1 = Math.cos(t * 1.1) * radius * 0.25 + Math.cos(t * 0.35) * radius * 0.1;
  const ox2 = Math.sin(t * 1.5 + 1.7) * radius * 0.45 + Math.cos(t * 0.6) * radius * 0.12;
  const oy2 = Math.cos(t * 1.3 + 0.9) * radius * 0.35 + Math.sin(t * 0.4) * radius * 0.08;
  const flicker = 1.0 + 0.02 * Math.sin(t * 0.7) + 0.01 * Math.sin(t * 1.9);
  // Make lights larger when outside rooms, but tighter when inside
  // slightly increase in-room base so it reads better on black rooms
  // Preset B (amplified): noticeably bigger and brighter
  const baseRadius = inRoom ? (radius * (3.9 + flicker * 0.8)) : (radius * (5.5 + flicker * 1.1));
  // Increase interior alpha so the whole room reads brighter on dark tiles.
  // This intentionally uses >1.0 so room fills are boosted relative to outside.
  const inRoomAlpha = inRoom ? 1.2 : 1.0;

  // Composite two gradients additively for an irregular shape
  const prevComp = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'lighter';

  // If a flood-filled multi-cell room region was computed earlier, we've already
  // drawn a room-wide fill into that clipped region. Only draw the single-cell
  // fallback fill if __roomBounds wasn't created above.
  if (inRoom && typeof __roomBounds === 'undefined') {
    try {
      const roomPx = partyPos.x * cellSize;
      const roomPy = partyPos.y * cellSize;
      const roomGrad = ctx.createRadialGradient(screenCx, screenCy, radius * 0.35, screenCx, screenCy, cellSize * 0.9);
      roomGrad.addColorStop(0, `rgba(255,240,180,${0.45 * inRoomAlpha})`);
      roomGrad.addColorStop(0.6, `rgba(255,200,120,${0.18 * inRoomAlpha})`);
      roomGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = roomGrad;
      ctx.beginPath();
      ctx.rect(roomPx, roomPy, cellSize, cellSize);
      ctx.fill();
    } catch (e) {
      // ignore
    }
  }

  // Adjust inner/out radii depending on whether we're inside a room
  const innerMult1 = inRoom ? 0.22 : 0.28;
  const outerScale1 = inRoom ? 0.7 : 0.85;
  const innerMult2 = inRoom ? 0.38 : 0.45;
  const outerScale2 = inRoom ? 0.95 : 1.1;

  // First soft blob
  const grad1 = ctx.createRadialGradient(screenCx + ox1, screenCy + oy1, radius * innerMult1, screenCx + ox1, screenCy + oy1, baseRadius * outerScale1);
  grad1.addColorStop(0, `rgba(255,240,180,${Math.min(1,0.6 * flicker) * (inRoom ? inRoomAlpha : 1.0)})`);
  grad1.addColorStop(0.5, `rgba(255,200,110,${Math.min(1,0.28 * flicker) * (inRoom ? inRoomAlpha : 1.0)})`);
  grad1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad1;
  ctx.beginPath();
  ctx.arc(screenCx + ox1, screenCy + oy1, baseRadius * outerScale1, 0, Math.PI * 2);
  ctx.fill();

  // Second, slightly larger and offset blob
  const grad2 = ctx.createRadialGradient(screenCx + ox2, screenCy + oy2, radius * innerMult2, screenCx + ox2, screenCy + oy2, baseRadius * outerScale2);
  grad2.addColorStop(0, `rgba(255,215,120,${Math.min(1,0.45 * flicker) * (inRoom ? inRoomAlpha : 1.0)})`);
  grad2.addColorStop(0.6, `rgba(255,165,80,${Math.min(1,0.18 * flicker) * (inRoom ? inRoomAlpha : 1.0)})`);
  grad2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad2;
  ctx.beginPath();
  ctx.arc(screenCx + ox2, screenCy + oy2, baseRadius * outerScale2, 0, Math.PI * 2);
  ctx.fill();

  // Restore blending
  ctx.globalCompositeOperation = prevComp;

  // If pawn is inside a room cell, draw small corner highlights to simulate light bouncing off the walls
  try {
    if (inRoom) {
      const cornerOffset = Math.max(4, cellSize * 0.12);
      const cornerGlareRadius = Math.max(8, cellSize * 1.0);
      // If we computed multi-cell bounds earlier, use them; otherwise fallback to single cell
      const bounds = (typeof __roomBounds !== 'undefined') ? __roomBounds : { minX: partyPos.x * cellSize, minY: partyPos.y * cellSize, maxX: partyPos.x * cellSize + cellSize, maxY: partyPos.y * cellSize + cellSize };
      const corners = [
        { x: bounds.minX + cornerOffset, y: bounds.minY + cornerOffset },
        { x: bounds.maxX - cornerOffset, y: bounds.minY + cornerOffset },
        { x: bounds.minX + cornerOffset, y: bounds.maxY - cornerOffset },
        { x: bounds.maxX - cornerOffset, y: bounds.maxY - cornerOffset }
      ];

      // Use lighter blending so corner glints add to the main glow
      const prev = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = 'lighter';

      // Make corner bounce intensity depend on distance and angle relative to the light center
      corners.forEach((c, idx) => {
        const dx = c.x - screenCx;
        const dy = c.y - screenCy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nd = Math.max(1, dist);
        // intensity falls off with distance, but with a baseline so corners still catch light
        const intensity = Math.max(0.12, 0.7 * (1 - Math.min(1, nd / (Math.max(cellSize, Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY)) * 1.5))));
        const phase = (Date.now() / 1000) + idx;
  const k = intensity * (0.85 + 0.15 * Math.sin(phase)) * (inRoom ? inRoomAlpha : 1.0);

        // Draw a focused radial spot near the corner to simulate a reflected highlight
        const gx = ctx.createRadialGradient(c.x, c.y, 1, c.x, c.y, cornerGlareRadius * 0.6);
        gx.addColorStop(0, `rgba(255,245,200,${0.35 * k})`);
        gx.addColorStop(0.5, `rgba(255,210,130,${0.18 * k})`);
        gx.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gx;
        ctx.beginPath();
        ctx.arc(c.x, c.y, cornerGlareRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = prev;
    }
  } catch (e) {
    // Safety: if any reference is missing, ignore corner glints
  }

  ctx.restore();
          }

      // Draw outer ring
      ctx.beginPath();
      ctx.fillStyle = partySelected ? '#fbbf24' : '#f59e0b';
      ctx.arc(screenCx, screenCy, radius + 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner pawn body
      ctx.beginPath();
      ctx.fillStyle = '#0f172a';
      ctx.arc(screenCx, screenCy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Letter P (drawn upright)
      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.45))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P', screenCx, screenCy + 1);
    }

  }, [grid, doors, walls, roomMarkers, showMarkers, cellSize, hoveredCell, hoveredDoor, showDoorMode, rows, cols, width, height, partyPos, partySelected, shouldRotate, canvasWidth, partyHasLight, transformedPlacementTemplate, placementTemplate, autoPlacedRoom]);

  // Keep a stable ref to the latest drawGrid implementation so other effects
  // can call it without referencing the function before it's initialized.
  useEffect(() => {
    drawGridRef.current = drawGrid;
  }, [drawGrid]);

  // When the party composition changes such that no alive member carries an
  // equipped light source, cancel the light animation and force an immediate
  // redraw so the glow disappears without requiring the user to alt-tab.
  useEffect(() => {
    try {
      const anyAliveEquipped = (partyMembers || []).some(h => h?.hp > 0 && Array.isArray(h?.equipment) && h.equipment.some(k => {
        const it = getEquipment(k);
        return it && it.lightSource;
      }));
      if (!anyAliveEquipped) {
        if (lightAnimRef.current) {
          cancelAnimationFrame(lightAnimRef.current);
          lightAnimRef.current = null;
        }
        try { drawGridRef.current && drawGridRef.current(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }
  }, [partyMembers]);

  // Redraw when dependencies change
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Continuous animation loop for light flicker when party has light
  useEffect(() => {
    if (!partyHasLight) {
      if (lightAnimRef.current) {
        cancelAnimationFrame(lightAnimRef.current);
        lightAnimRef.current = null;
      }
  // Immediately redraw once without the light animation so the glow clears
  try { drawGrid(); } catch (e) { /* ignore drawing errors */ }
  return;
    }

    const loop = () => {
      drawGrid();
      lightAnimRef.current = requestAnimationFrame(loop);
    };

    // Start loop
    if (!lightAnimRef.current) {
      lightAnimRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (lightAnimRef.current) {
        cancelAnimationFrame(lightAnimRef.current);
        lightAnimRef.current = null;
      }
    };
  }, [partyHasLight, drawGrid]);

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
        if (isDragging && dragFillValue !== null && onCellSet && !rectStartRef.current) {
          const cellKey = `${x},${y}`;
          // Only fill if we haven't already filled this cell in this drag session
          if (!draggedCellsRef.current.has(cellKey)) {
            draggedCellsRef.current.add(cellKey);
            onCellSet(x, y, dragFillValue);
          }
        }

        // If we're performing a meta/cmd-rectangle drag, update preview
        if (rectStartRef.current) {
          const sx = rectStartRef.current.x;
          const sy = rectStartRef.current.y;
          const x1 = Math.min(sx, x);
          const y1 = Math.min(sy, y);
          const x2 = Math.max(sx, x);
          const y2 = Math.max(sy, y);
          const value = rectStartRef.current.value;
          setRectPreview({ x1, y1, x2, y2, value });
        }
      }

      // Check which door edge we're hovering (always detect for room cells)
      const cell = grid[y]?.[x];
      if (cell > 0) {
        // Use logical (unrotated) cell-local coordinates
  const cellX = ((logicalX % cellSize) + cellSize) % cellSize;
  const cellY = ((logicalY % cellSize) + cellSize) % cellSize;
        const threshold = cellSize * 0.2; // Reduced from 0.35 for more precise placement

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
    // If the application context menu is open elsewhere, clicks should dismiss it and not act on the map
    if (contextMenuOpen && typeof onContextDismiss === 'function') {
      onContextDismiss();
      return;
    }
    // Handle right-click explicitly (some environments block contextmenu)
    if (e.button === 2) {
  if (suppressContextAction) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      let mouseX = e.clientX - rect.left;
      let mouseY = e.clientY - rect.top;
      let logicalX = mouseX;
      let logicalY = mouseY;
      if (shouldRotate) {
        logicalX = mouseY;
        logicalY = canvasWidth - mouseX;
      }
      const cx = Math.floor(logicalX / cellSize);
      const cy = Math.floor(logicalY / cellSize);
      if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) {
        setHoveredCell({ x: cx, y: cy });
  try { console.debug('mouseDown right-click cell', cx, cy); if (typeof onCellContextMenu === 'function') onCellContextMenu(cx, cy, e); else if (typeof onCellRightClick === 'function') onCellRightClick(cx, cy, e); } catch (err) { console.error(err); }
      }
      return;
    }
    // Don't start drag on other non-left buttons
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

    // If Meta/Cmd or Ctrl is held, start rectangle-fill mode
    if (e.metaKey || e.ctrlKey) {
      const nextValue = cell === 0 ? 1 : cell === 1 ? 2 : 0;
      rectStartRef.current = { x: hoveredCell.x, y: hoveredCell.y, value: nextValue };
      setRectPreview({ x1: hoveredCell.x, y1: hoveredCell.y, x2: hoveredCell.x, y2: hoveredCell.y, value: nextValue });
      // Set dragging state so visual cursor updates behave consistently
      setIsDragging(true);
      return;
    }

    // Start normal dragging - determine what value to fill
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
    // If we were doing a rectangle fill (meta/cmd drag), apply it now
    if (rectStartRef.current && rectPreview && onCellSet) {
      const { x1, y1, x2, y2, value } = rectPreview;
      for (let gy = y1; gy <= y2; gy++) {
        for (let gx = x1; gx <= x2; gx++) {
          if (gx < 0 || gx >= cols || gy < 0 || gy >= rows) continue;
          try { onCellSet(gx, gy, value); } catch (e) { /* ignore individual failures */ }
        }
      }
    }

    setIsDragging(false);
    setDragFillValue(null);
    setIsPawnDragging(false);
    // Clear rectangle state
    rectStartRef.current = null;
    setRectPreview(null);
    // Don't clear draggedCellsRef yet - we need it for the click check
    // It will be cleared in the next mousedown or mouseup via ref reset
    try { if (onEditComplete) onEditComplete(); } catch (e) { /* ignore */ }
  }, [rectPreview, onCellSet, cols, rows, onEditComplete]);

  const handleClick = useCallback((e) => {
    // Don't process click if we dragged across multiple cells
    if (draggedCellsRef.current.size > 1) {
      draggedCellsRef.current.clear();
      return;
    }
    draggedCellsRef.current.clear();

    if (!hoveredCell) return;
    const cell = grid[hoveredCell.y]?.[hoveredCell.x];

    // If placementTemplate or autoPlacedRoom active: commit placement centered on hoveredCell
    if ((placementTemplate || autoPlacedRoom) && onCommitPlacement && hoveredCell) {
      // Prefer transformed template when placing from the designer
      const activeTemplate = transformedPlacementTemplate || placementTemplate || autoPlacedRoom;
      const tpl = activeTemplate.grid || activeTemplate;
      const startX = hoveredCell.x - Math.floor(tpl[0].length / 2);
      const startY = hoveredCell.y - Math.floor(tpl.length / 2);
      onCommitPlacement(startX, startY, activeTemplate);
      if (autoPlacedRoom && setAutoPlacedRoom) {
        setAutoPlacedRoom(null);
      }
      return;
    }

    // Shift+Click: place pawn here
    if (e.shiftKey) {
      // If there is a pawn on this cell, remove it (signal with onPartyMove null)
      if (partyPos && hoveredCell.x === partyPos.x && hoveredCell.y === partyPos.y) {
        if (onPartyMove) onPartyMove(null, null);
        if (onPartySelect) onPartySelect(false);
        try { sfx.play('select', { volume: 0.5 }); } catch (err) {}
        return;
      }
      // Otherwise place pawn here
      if (onPartyMove) onPartyMove(hoveredCell.x, hoveredCell.y);
      try { sfx.play('step', { volume: 0.5 }); } catch (err) {}
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
      try { sfx.play('door', { volume: 0.6 }); } catch (err) {}
    } else {
      // Regular cell click (now handled by mousedown/mouseup for drag support)
    }
  }, [hoveredCell, hoveredDoor, grid, onDoorToggle, onPartyMove, onPartySelect, partyPos, partySelected]);

  const handleContextMenu = useCallback((e) => {
  e.preventDefault();
  try { console.debug('canvas contextmenu event'); } catch (err) {}
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;

    // Inverse mapping for rotated canvas
    let logicalX = mouseX;
    let logicalY = mouseY;
    if (shouldRotate) {
      logicalX = mouseY;
      logicalY = canvasWidth - mouseX;
    }

    const x = Math.floor(logicalX / cellSize);
    const y = Math.floor(logicalY / cellSize);
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      // Update hoveredCell to reflect where the user right-clicked
      setHoveredCell({ x, y });
      try {
        console.debug('computed ctx cell', x, y);
  if (typeof onCellContextMenu === 'function') onCellContextMenu(x, y, e); else if (typeof onCellRightClick === 'function') onCellRightClick(x, y, e);
      } catch (err) { console.error('onCellRightClick error', err); }
    } else {
      try { console.debug('ctx outside grid', x, y); } catch (e) {}
    }
  }, [onCellRightClick, cellSize, cols, rows, shouldRotate, canvasWidth]);

  // Helpers to clone and transform placement templates (grid + doors + walls)
  const cloneTemplate = useCallback((tpl) => {
    if (!tpl) return null;
    const grid = tpl.grid ? tpl.grid.map(r => r.slice()) : (Array.isArray(tpl) ? tpl.map(r => r.slice()) : null);
    const doors = (tpl.doors || []).map(d => ({ ...d }));
    const walls = (tpl.walls || []).map(w => ({ ...w }));
    return { grid, doors, walls };
  }, []);

  const rotateCWOnce = useCallback((tpl) => {
    if (!tpl || !tpl.grid) return tpl;
    const g = tpl.grid;
    const H = g.length;
    const W = g[0]?.length || 0;
    const ng = Array.from({ length: W }, () => Array(H).fill(0));
    for (let r = 0; r < W; r++) {
      for (let c = 0; c < H; c++) {
        ng[r][c] = g[H - 1 - c][r];
      }
    }
    const edgeMap = { N: 'E', E: 'S', S: 'W', W: 'N' };
  // Map original (x,y) -> rotated coordinates: x' = H-1 - y, y' = x
  const ndoors = (tpl.doors || []).map(d => ({ x: (H - 1) - d.y, y: d.x, edge: edgeMap[d.edge] || d.edge }));
  const nwalls = (tpl.walls || []).map(w => ({ x: (H - 1) - w.y, y: w.x, edge: edgeMap[w.edge] || w.edge }));
  // Preserve other metadata (id/name) if present
  return { ...(tpl || {}), grid: ng, doors: ndoors, walls: nwalls };
  }, []);

  const rotateCCW = useCallback((tpl) => {
    // rotate CCW = rotate CW three times
    let cur = cloneTemplate(tpl) || tpl;
    cur = rotateCWOnce(cur);
    cur = rotateCWOnce(cur);
    cur = rotateCWOnce(cur);
  return cur;
  }, [cloneTemplate, rotateCWOnce]);

  const mirrorHorizontal = useCallback((tpl) => {
    if (!tpl || !tpl.grid) return tpl;
    const g = tpl.grid;
    const H = g.length;
    const W = g[0]?.length || 0;
    const ng = g.map(row => row.slice().reverse());
    const ndoors = (tpl.doors || []).map(d => ({ x: (W - 1) - d.x, y: d.y, edge: d.edge === 'E' ? 'W' : d.edge === 'W' ? 'E' : d.edge }));
    const nwalls = (tpl.walls || []).map(w => ({ x: (W - 1) - w.x, y: w.y, edge: w.edge === 'E' ? 'W' : w.edge === 'W' ? 'E' : w.edge }));
    return { ...(tpl || {}), grid: ng, doors: ndoors, walls: nwalls };
  }, []);

  // Ensure the canvas redraws immediately when the transformed template changes
  useEffect(() => {
    try {
      if (drawGridRef.current) drawGridRef.current();
    } catch (e) {
      // ignore
    }
  }, [transformedPlacementTemplate]);

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
    // Placement transform keys: Q = rotate CCW, E = rotate CW, W = mirror
    const handlePlacementKeyDown = (e) => {
      // Active while placing either a designer template or an auto-placed library room
      if (!(placementTemplate || autoPlacedRoom)) return;
      const source = placementTemplate || autoPlacedRoom;
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setTransformedPlacementTemplate(prev => rotateCWOnce(prev || cloneTemplate(source)));
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setTransformedPlacementTemplate(prev => rotateCCW(prev || cloneTemplate(source)));
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setTransformedPlacementTemplate(prev => mirrorHorizontal(prev || cloneTemplate(source)));
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
    };

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
    const handleArrowKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        pressedKeysRef.current.add(e.key);
  // Play step sound on movement start
  try { sfx.play('step', { volume: 0.6 }); } catch (err) {}
      }
    };

    const handleArrowKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        pressedKeysRef.current.delete(e.key);
  try { sfx.play('select', { volume: 0.45 }); } catch (err) {}
      }
    };

    // Game loop for continuous pawn movement
    const updatePawnPosition = () => {
      const { partyPos: pp, onPartyMove: opm, cols: c, rows: r } = currentStateRef.current;

      if (!pp || pressedKeysRef.current.size === 0) {
        gameLoopRef.current = null;
        return;
      }

      let dx = 0;
      let dy = 0;

      if (pressedKeysRef.current.has('ArrowUp')) dy -= 1;
      if (pressedKeysRef.current.has('ArrowDown')) dy += 1;
      if (pressedKeysRef.current.has('ArrowLeft')) dx -= 1;
      if (pressedKeysRef.current.has('ArrowRight')) dx += 1;

      // When the map is rotated, the logical coordinate system is rotated
      // relative to screen arrows. We want the d-pad to always move the pawn
      // visually up/left/down/right on screen. Apply an inverse rotation to
      // the movement delta so the on-screen arrow maps correctly to logical coords.
      let appliedDx = dx;
      let appliedDy = dy;
      if (shouldRotate && (dx !== 0 || dy !== 0)) {
        // For a +90deg rotation (clockwise) applied to the drawing, the
        // mapping from logical -> screen was: sx = canvasWidth - ly, sy = lx
        // To map a screen-space delta (dx,dy) back to logical delta, invert:
        // logical_dx = dy
        // logical_dy = -dx
        appliedDx = dy;
        appliedDy = -dx;
      }

      if (appliedDx !== 0 || appliedDy !== 0) {
        const nx = Math.min(Math.max(0, pp.x + appliedDx), c - 1);
        const ny = Math.min(Math.max(0, pp.y + appliedDy), r - 1);
        if (opm) opm(nx, ny);
      }

      gameLoopRef.current = requestAnimationFrame(updatePawnPosition);
    };

    const startGameLoop = () => {
      const { partyPos: pp } = currentStateRef.current;
      if (!gameLoopRef.current && pp && pressedKeysRef.current.size > 0) {
        gameLoopRef.current = requestAnimationFrame(updatePawnPosition);
      }
    };

    const stopGameLoop = () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };

    const handleArrowDown = (e) => {
      handleArrowKeyDown(e);
      startGameLoop();
    };

    const handleArrowUp = (e) => {
      handleArrowKeyUp(e);
      if (pressedKeysRef.current.size === 0) {
        stopGameLoop();
      }
    };

  // Ensure placement key handler is registered before the grid handler so it
  // can take precedence (preventDefault) when placing templates.
  window.addEventListener('keydown', handlePlacementKeyDown);
  window.addEventListener('keydown', handleGridKeyDown);
  window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleArrowDown);
    window.addEventListener('keyup', handleArrowUp);
    return () => {
      window.removeEventListener('keydown', handleGridKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handlePlacementKeyDown);
      window.removeEventListener('keydown', handleArrowDown);
      window.removeEventListener('keyup', handleArrowUp);
      stopGameLoop();
      pressedKeysRef.current.clear();
    };
  }, [handleKeyDown, handleKeyUp, hoveredCell, onDoorToggle, partyPos, onPartyMove, cols, rows, placementTemplate, autoPlacedRoom, cloneTemplate, rotateCWOnce, rotateCCW, mirrorHorizontal]);

  // Sync transformed placement when the incoming placementTemplate or autoPlacedRoom changes.
  useEffect(() => {
    const source = placementTemplate || autoPlacedRoom;
    if (source) {
      // Initialize transformed copy
      setTransformedPlacementTemplate(cloneTemplate(source));
      // Focus the canvas so keyboard shortcuts work immediately
      try { canvasRef.current && canvasRef.current.focus(); } catch (e) {}
    } else {
      setTransformedPlacementTemplate(null);
    }
  }, [placementTemplate, autoPlacedRoom, cloneTemplate]);

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
  tabIndex={0}
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
  {/* Door placement hint removed */}
      {!partyPos && showPawnHint && (
        <div
          className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded text-xs font-semibold"
          style={{ zIndex: 9999, pointerEvents: 'none' }}
        >
          Shift+Click to add the party pawn
        </div>
      )}
      {/* Placement shortcuts hint */}
      {(placementTemplate || autoPlacedRoom) && (
        <div
          className="absolute top-2 right-2 bg-black/70 text-white px-3 py-2 rounded text-xs font-semibold"
          style={{ zIndex: 9999 }}
        >
          <div className="font-bold text-amber-300">Placement Shortcuts</div>
          <div className="text-slate-200 text-xs mt-1">E: rotate → &nbsp; Q: rotate ← &nbsp; W: mirror</div>
          <div className="text-slate-400 text-xs mt-1">Focus map or click to enable keys</div>
        </div>
      )}
      {tooltipText && tooltipPos && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.left + 12,
            top: tooltipPos.top - 28,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 99999
          }}
        >
          <div className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded shadow">
            {tooltipText}
          </div>
        </div>
      )}
    </div>
  );
});

export default DungeonGridCanvas;
