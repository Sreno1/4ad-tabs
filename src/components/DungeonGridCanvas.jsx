import React, { useRef, useEffect, useCallback, memo, useState } from 'react';
import { getEquipment } from '../data/equipment.js';
import sfx from '../utils/sfx.js';

import MARKER_STYLES from '../constants/markerStyles.js';
import { getEdgeCoverage } from '../utils/tileStyles.js';

// Extracted utilities
import {
  COLORS,
  GLYPHS,
  getDoorMetrics,
  getWallThickness,
  getGlyphSizes,
  getEdgeThreshold,
  getDoorColor,
  getWallColor,
  getRectangleFillColor,
} from './DungeonGridCanvas.constants.js';

import {
  screenToLogicalWithRotation,
  logicalToGrid,
  getCellLocalCoords,
  detectEdge,
  isInBounds,
  getGridDimensions,
  getCanvasDimensions,
  normalizeRect,
  forEachCellInRect,
} from './DungeonGridCanvas.geometry.js';

import { usePanZoom } from './hooks/usePanZoom.js';
import { useTemplateTransform } from './hooks/useTemplateTransform.js';

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
  cellStyles = {},
  shouldRotate,
  selectedTile = null,
  onCellClick,
  onCellSet,
  onCellRightClick,
  suppressContextAction = false,
  onDoorToggle,
  onWallToggle,
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
  const hasMovedRef = useRef(false);
  const pendingStartRef = useRef(null);

  // Template transform hook - manages local transformed copy for Q/E/W shortcuts
  // Pass either placementTemplate or autoPlacedRoom as the source
  const activeTemplateSource = placementTemplate || autoPlacedRoom;
  const {
    transformedTemplate: transformedPlacementTemplate,
    setTransformedTemplate: setTransformedPlacementTemplate,
    rotateClockwise: rotateTemplateCW,
    rotateCounterClockwise: rotateTemplateCCW,
    mirror: mirrorTemplate,
  } = useTemplateTransform(activeTemplateSource);

  // Pan & zoom hook
  const {
    scale,
    pan,
    setPan,
    isPanningRef,
  isTKeyPanningRef,
  isPointerOverRef,
    handlePointerEnter: handlePointerEnterCanvas,
    handlePointerLeave: handlePointerLeaveCanvas,
    handleWheel: handlePanZoomWheel,
    handleMiddleMouseDown: handleMouseDownPan,
    handleMiddleMouseUp: handleMouseUpPan,
    startTKeyPanning,
    stopTKeyPanning,
    handleTKeyPanMove,
  } = usePanZoom();

  const cols = grid[0]?.length || 0;
  const rows = grid.length;

  // Party members array (from parent) - used to detect if an alive member still carries a light

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
  // Reset transform and clear in screen space, then apply pan/zoom transform
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  // apply scale then pan so drawing uses logical coordinates
  ctx.setTransform(scale, 0, 0, scale, pan.x, pan.y);

    // Draw cells
  if (shouldRotate) {
      // Rotate the drawing so the logical grid is displayed rotated 90deg clockwise
      ctx.save();
      ctx.translate(canvasWidth, 0);
      ctx.rotate(Math.PI / 2);
    }
    // Collect wall edges to draw after the cell loop so they are rendered on top
    const wallEdges = [];
    if (walls && walls.length > 0) {
      const seen = new Set();
      walls.forEach(w => {
        if (!w || typeof w.x !== 'number' || typeof w.y !== 'number' || !w.edge) return;
        const key = `${w.x},${w.y},${w.edge}`;
        if (seen.has(key)) return;
        seen.add(key);
        wallEdges.push(w);
      });
    }
    const emptyGlyphSize = Math.max(10, Math.floor(cellSize * 0.9));
    const dotGlyphSize = Math.max(6, Math.floor(cellSize * 0.45));
    const drawFillDot = (cx, cy) => {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#f8fafc';
      ctx.font = `normal ${dotGlyphSize}px "DungeonMode", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2219', cx, cy);
      ctx.restore();
    };
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
    // compute convenient per-cell values
    const px = x * cellSize;
    const py = y * cellSize;
    const cell = (grid[y] && grid[y][x]) || 0;
    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

  // Cell base/background (unused space texture)
  ctx.fillStyle = '#000000';
  ctx.fillRect(px, py, cellSize, cellSize);
  ctx.fillStyle = '#1f1f1f';
  ctx.font = `normal ${emptyGlyphSize}px "DungeonMode", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u2592', px + cellSize / 2, py + cellSize / 2);
    // If logical cell is a room (1), draw fills according to cellStyles
  if (cell === 1) {
          const key = `${x},${y}`;
          const style = (cellStyles && cellStyles[key]) || 'full';
          // Use a distinct color for the hovered tile
          const fillColor = isHovered ? '#38bdf8' : '#000000'; // sky-400 for hover, black otherwise
          let fullRoomFill = false;
          ctx.fillStyle = fillColor;
          if (style === 'full') {
            ctx.fillRect(px, py, cellSize, cellSize);
            fullRoomFill = true;
          } else if (style === 'diag1') {
            // triangle top-left -> bottom-right
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + cellSize, py);
            ctx.lineTo(px, py + cellSize);
            ctx.closePath();
            ctx.fill();
          } else if (style === 'diag2') {
            // triangle bottom-right -> top-left
            ctx.beginPath();
            ctx.moveTo(px + cellSize, py + cellSize);
            ctx.lineTo(px + cellSize, py);
            ctx.lineTo(px, py + cellSize);
            ctx.closePath();
            ctx.fill();
          } else if (style === 'diag3') {
            // triangle top-right -> bottom-left
            ctx.beginPath();
            ctx.moveTo(px + cellSize, py);
            ctx.lineTo(px + cellSize, py + cellSize);
            ctx.lineTo(px, py);
            ctx.closePath();
            ctx.fill();
          } else if (style === 'diag4') {
            // triangle bottom-left -> top-right
            ctx.beginPath();
            ctx.moveTo(px, py + cellSize);
            ctx.lineTo(px, py);
            ctx.lineTo(px + cellSize, py + cellSize);
            ctx.closePath();
            ctx.fill();
          } else if (style === 'round1') {
            // simpler rounded corner: draw a quarter-circle anchored at the top-left corner
            // Clip to the cell rect to guarantee containment and then draw a circle
            ctx.save();
            ctx.beginPath();
            ctx.rect(px, py, cellSize, cellSize);
            ctx.clip();
            ctx.beginPath();
            // center at top-left corner; a full circle clipped to the rect leaves a quarter-circle
            ctx.arc(px, py, cellSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (style === 'round2') {
            // complementary rounded corner: draw a quarter-circle anchored at the bottom-right corner
            ctx.save();
            ctx.beginPath();
            ctx.rect(px, py, cellSize, cellSize);
            ctx.clip();
            ctx.beginPath();
            // center at bottom-right corner
            ctx.arc(px + cellSize, py + cellSize, cellSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (style === 'round3') {
            // rounded corner anchored at top-right corner
            ctx.save();
            ctx.beginPath();
            ctx.rect(px, py, cellSize, cellSize);
            ctx.clip();
            ctx.beginPath();
            // center at top-right corner
            ctx.arc(px + cellSize, py, cellSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (style === 'round4') {
            // rounded corner anchored at bottom-left corner
            ctx.save();
            ctx.beginPath();
            ctx.rect(px, py, cellSize, cellSize);
            ctx.clip();
            ctx.beginPath();
            // center at bottom-left corner
            ctx.arc(px, py + cellSize, cellSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else {
            ctx.fillRect(px, py, cellSize, cellSize);
            fullRoomFill = true;
          }
          if (fullRoomFill) {
            drawFillDot(px + cellSize / 2, py + cellSize / 2);
          }
        } else if (cell === 2) {
          ctx.fillStyle = '#1d4ed8'; // corridor blue
          ctx.fillRect(px, py, cellSize, cellSize);
          drawFillDot(px + cellSize / 2, py + cellSize / 2);
        }

        // Hover highlight - draw a semi-transparent overlay and a faint outline so cycling visuals remain visible
        if (isHovered) {
          // Overlay: amber/yellow, semi-transparent
          ctx.save();
          ctx.globalAlpha = 0.25;
          ctx.fillStyle = 'rgba(245, 158, 11, 1)'; // amber-400
          ctx.fillRect(px, py, cellSize, cellSize);
          ctx.globalAlpha = 1.0;
          // Outline
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.16)';
          ctx.lineWidth = Math.max(1, Math.floor(cellSize * 0.06));
          ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
          ctx.restore();
        }

        // Cell border
        if (cell === 0) {
          ctx.strokeStyle = '#334155'; // slate-700
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
        }

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

            // Marker icon: image or char
            ctx.save();
            const markerCenterX = px + cellSize / 2;
            const markerCenterY = py + cellSize / 2;
            ctx.translate(markerCenterX, markerCenterY);
            if (shouldRotate) {
              ctx.rotate(-Math.PI / 2); // counteract grid rotation
            }
            if (style.image) {
              // Draw image centered in cell
              const img = new window.Image();
              img.src = style.image;
              const iconSize = Math.floor(cellSize * 0.7);
              // If image is not loaded, draw after it loads
              if (!img.complete) {
                img.onload = () => {
                  const ctx2 = canvasRef.current?.getContext('2d');
                  if (ctx2) {
                    ctx2.save();
                    ctx2.translate(markerCenterX, markerCenterY);
                    if (shouldRotate) ctx2.rotate(-Math.PI / 2);
                    ctx2.drawImage(img, -iconSize/2, -iconSize/2, iconSize, iconSize);
                    ctx2.restore();
                  }
                };
              } else {
                ctx.drawImage(img, -iconSize/2, -iconSize/2, iconSize, iconSize);
              }
            } else if (style.char) {
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.max(8, cellSize * 0.6)}px "DungeonMode", monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(style.char, 0, 0);
            }
            ctx.restore();
          }
        }
      }
    }

  // Draw doors (shorter, centered on each edge) with color by door type/state
  const doorThickness = Math.max(2, Math.floor(cellSize * 0.15)) + 1;

    // doorLength is the fraction of the edge the door occupies (centered)
    const doorLength = Math.max(2, Math.floor(cellSize * 0.66));
    const doorOffset = Math.floor((cellSize - doorLength) / 2);

    const doorColorFor = (d) => {
      try {
        if (d && d.opened) return '#10b981'; // green (open)
        if (d && d.locked) return '#ef4444'; // red (locked)
        const typ = d && (d.doorType || d.type || d.doorType);
        switch (typ) {
          case 'magically_sealed': return '#3b82f6'; // blue
          case 'iron': return '#9ca3af'; // silver-ish
          case 'illusionary': return '#c4b5fd'; // light purple
          case 'trapped': return '#6b21a8'; // deep purple
          case 'normal':
          default:
            return '#f59e0b'; // amber fallback
        }
      } catch (e) { return '#f59e0b'; }
    };

    doors.forEach(door => {
      const px = door.x * cellSize;
      const py = door.y * cellSize;
      ctx.fillStyle = doorColorFor(door);

      if (door.edge === 'N') {
        ctx.fillRect(px + doorOffset, py - Math.floor(doorThickness / 2), doorLength, doorThickness);
      } else if (door.edge === 'S') {
        ctx.fillRect(px + doorOffset, py + cellSize - Math.floor(doorThickness / 2), doorLength, doorThickness);
      } else if (door.edge === 'E') {
        ctx.fillRect(px + cellSize - Math.floor(doorThickness / 2), py + doorOffset, doorThickness, doorLength);
      } else if (door.edge === 'W') {
        ctx.fillRect(px - Math.floor(doorThickness / 2), py + doorOffset, doorThickness, doorLength);
      }
    });

  // Draw walls (collected earlier) on top of cells and doors
    if (wallEdges.length > 0) {
      const wt = Math.max(1, Math.floor(cellSize * 0.08));

  // use getEdgeCoverage from utils

      wallEdges.forEach(w => {
        const px = w.x * cellSize;
        const py = w.y * cellSize;
        const edge = w.edge;
        const isCardinal = edge === 'N' || edge === 'S' || edge === 'E' || edge === 'W';
        const isDiag = typeof edge === 'string' && edge.startsWith('diag');
        const isRound = typeof edge === 'string' && edge.startsWith('round');
        // Decide color by wall source tag (if present) so designer-placed walls
        // keep the template's room/corridor color. Fallback to inspecting the
        // cell value at the wall's origin, then the neighbor across the edge.
        let edgeColor = '#ffffff';
        try {
          if (w.srcTag && typeof w.srcTag === 'string') {
            const t = w.srcTag.toLowerCase();
            if (t === 'room') edgeColor = '#B45309';
            else if (t === 'corridor') edgeColor = '#1D4ED8';
          } else {
            const originVal = (grid[w.y] && grid[w.y][w.x]) || 0;
            let lookup = originVal;
            if (!lookup && isCardinal) {
              if (edge === 'N') lookup = (grid[w.y - 1] && grid[w.y - 1][w.x]) || 0;
              else if (edge === 'S') lookup = (grid[w.y + 1] && grid[w.y + 1][w.x]) || 0;
              else if (edge === 'E') lookup = (grid[w.y] && grid[w.y][w.x + 1]) || 0;
              else if (edge === 'W') lookup = (grid[w.y] && grid[w.y][w.x - 1]) || 0;
            }
            if (lookup === 1) edgeColor = '#B45309';
            else if (lookup === 2) edgeColor = '#1D4ED8';
          }
        } catch (e) {
          edgeColor = '#ffffff';
        }

        if (isCardinal) {
          // Compute coverage from the origin (or fallback to neighbor) and draw only on covered segments
          const keyA = `${w.x},${w.y}`;
          const styleA = (cellStyles && cellStyles[keyA]) || ((grid[w.y] && grid[w.y][w.x]) === 1 ? 'full' : null);

          let nx = w.x, ny = w.y, opposite = null;
          if (edge === 'N') { ny = w.y - 1; opposite = 'S'; }
          else if (edge === 'S') { ny = w.y + 1; opposite = 'N'; }
          else if (edge === 'E') { nx = w.x + 1; opposite = 'W'; }
          else if (edge === 'W') { nx = w.x - 1; opposite = 'E'; }

          const keyB = `${nx},${ny}`;
          const styleB = (cellStyles && cellStyles[keyB]) || ((grid[ny] && grid[ny][nx]) === 1 ? 'full' : null);

          const covA = getEdgeCoverage(styleA, edge);
          const covB = getEdgeCoverage(styleB, opposite);
          const cov = covA[1] > covA[0] ? covA : covB;
          const start = cov[0];
          const end = cov[1];
          if (end <= start) return; // nothing to draw

          ctx.fillStyle = edgeColor;
          if (edge === 'N') {
            const sx = px + start * cellSize;
            const wlen = (end - start) * cellSize;
            ctx.fillRect(sx, py - Math.floor(wt/2), wlen, wt);
          } else if (edge === 'S') {
            const sx = px + start * cellSize;
            const wlen = (end - start) * cellSize;
            ctx.fillRect(sx, py + cellSize - Math.floor(wt/2), wlen, wt);
          } else if (edge === 'E') {
            const sy = py + start * cellSize;
            const hlen = (end - start) * cellSize;
            ctx.fillRect(px + cellSize - Math.floor(wt/2), sy, wt, hlen);
          } else if (edge === 'W') {
            const sy = py + start * cellSize;
            const hlen = (end - start) * cellSize;
            ctx.fillRect(px - Math.floor(wt/2), sy, wt, hlen);
          }
          return;
        }

        ctx.save();
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = wt;
        ctx.lineCap = 'round';
        if (isDiag) {
          ctx.beginPath();
          if (edge === 'diag1' || edge === 'diag2') {
            ctx.moveTo(px + cellSize, py);
            ctx.lineTo(px, py + cellSize);
          } else if (edge === 'diag3' || edge === 'diag4') {
            ctx.moveTo(px, py);
            ctx.lineTo(px + cellSize, py + cellSize);
          } else {
            ctx.restore();
            return;
          }
          ctx.stroke();
          ctx.restore();
          return;
        }

        if (isRound) {
          ctx.beginPath();
          if (edge === 'round1') {
            ctx.arc(px, py, cellSize, 0, Math.PI / 2);
          } else if (edge === 'round2') {
            ctx.arc(px + cellSize, py + cellSize, cellSize, Math.PI, Math.PI * 1.5);
          } else if (edge === 'round3') {
            ctx.arc(px + cellSize, py, cellSize, Math.PI / 2, Math.PI);
          } else if (edge === 'round4') {
            ctx.arc(px, py + cellSize, cellSize, Math.PI * 1.5, Math.PI * 2);
          } else {
            ctx.restore();
            return;
          }
          ctx.stroke();
          ctx.restore();
          return;
        }
        ctx.restore();
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
      const tplWalls = activeTemplate.walls || [];
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
            ctx.strokeStyle = 'rgba(110,231,183,0.95)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
          }
        }
      }

      // Draw a subtle bounding box around the entire template so its outer
      // perimeter is always visible even where no walls are present.
      try {
        const bboxX = startX * cellSize;
        const bboxY = startY * cellSize;
        const bboxW = tpl[0].length * cellSize;
        const bboxH = tpl.length * cellSize;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = Math.max(1, Math.floor(cellSize * 0.04));
        ctx.strokeRect(bboxX + 0.5, bboxY + 0.5, Math.max(0, bboxW - 1), Math.max(0, bboxH - 1));
      } catch (e) { /* ignore */ }

      // Draw faint inner edges (open edges) between adjacent template cells so
      // gaps are visible, and then draw solid wall edges where the template
      // borders empty space. Inner edges are subtle and won't compete with doors.
      const tplInnerEdges = { horiz: [], vert: [] };
      const tplWallEdges = [];
      const useTemplateWalls = tplWalls.length > 0;
      for (let ry = 0; ry < tpl.length; ry++) {
        for (let rx = 0; rx < tpl[ry].length; rx++) {
          const val = tpl[ry][rx];
          if (!val || val === 0) continue;
          const gx = startX + rx;
          const gy = startY + ry;

          // Check neighbors inside tpl coords
          const northExists = (ry - 1) >= 0 && tpl[ry - 1] && tpl[ry - 1][rx];
          const southExists = (ry + 1) < tpl.length && tpl[ry + 1] && tpl[ry + 1][rx];
          const westExists = (rx - 1) >= 0 && tpl[ry][rx - 1];
          const eastExists = (rx + 1) < tpl[ry].length && tpl[ry][rx + 1];

          // If neighbor exists, this is an inner edge between cells; collect it
          // using a canonical direction to avoid duplicates (only add E and S).
          if (eastExists) tplInnerEdges.vert.push({ x: gx, y: gy });
          if (southExists) tplInnerEdges.horiz.push({ x: gx, y: gy });

          // If neighbor does NOT exist, it's a wall edge bordering empty space
          if (!useTemplateWalls) {
            if (!northExists) tplWallEdges.push({ x: gx, y: gy, edge: 'N' });
            if (!southExists) tplWallEdges.push({ x: gx, y: gy, edge: 'S' });
            if (!eastExists) tplWallEdges.push({ x: gx, y: gy, edge: 'E' });
            if (!westExists) tplWallEdges.push({ x: gx, y: gy, edge: 'W' });
          }
        }
      }
      if (useTemplateWalls) {
        tplWalls.forEach(w => {
          const wx = startX + (w.x || 0);
          const wy = startY + (w.y || 0);
          tplWallEdges.push({ x: wx, y: wy, edge: w.edge, srcTag: w.srcTag });
        });
      }

      // Draw inner edges first (subtle lines)
      if (tplInnerEdges.horiz.length > 0 || tplInnerEdges.vert.length > 0) {
        // Make inner (open) edges more visible: dashed amber lines with rounded caps
        ctx.save();
        ctx.lineCap = 'round';
        ctx.setLineDash([Math.max(2, Math.floor(cellSize * 0.08)), Math.max(2, Math.floor(cellSize * 0.04))]);
        ctx.strokeStyle = 'rgba(110,231,183,0.6)'; // mint/light-green, semi-visible
        ctx.lineWidth = Math.max(1, Math.floor(cellSize * 0.06));
        // Horizontal inner edges (bottom edge of the cell)
        tplInnerEdges.horiz.forEach(e => {
          const px = e.x * cellSize;
          const py = e.y * cellSize + cellSize;
          ctx.beginPath();
          ctx.moveTo(px + 0.5, py + 0.5);
          ctx.lineTo(px + cellSize - 0.5, py + 0.5);
          ctx.stroke();
        });
        // Vertical inner edges (right edge of the cell)
        tplInnerEdges.vert.forEach(e => {
          const px = e.x * cellSize + cellSize;
          const py = e.y * cellSize;
          ctx.beginPath();
          ctx.moveTo(px + 0.5, py + 0.5);
          ctx.lineTo(px + 0.5, py + cellSize - 0.5);
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.restore();
      }

  // (tick drawing moved below so it renders on top of walls/doors)

      // Draw wall edges (solid) on top of inner edges
      if (tplWallEdges.length > 0) {
        // Determine template type (Room vs Corridor) by inspecting tpl cells.
        // Use the same palette as the placement cell fills so walls match the tag color.
        try {
          let countRoom = 0; let countCorridor = 0;
          for (let ry = 0; ry < tpl.length; ry++) {
            for (let rx = 0; rx < tpl[ry].length; rx++) {
              const v = tpl[ry][rx];
              if (v === 1) countRoom++;
              if (v === 2) countCorridor++;
            }
          }
          // Default colors follow the placement cell fill mapping:
          // Room (1) -> amber-ish '#B45309' (rgba(180,83,9))
          // Corridor (2) -> blue '#1D4ED8' (rgba(29,78,216))
          const wallColor = countRoom >= countCorridor ? '#B45309' : '#1D4ED8';
          ctx.fillStyle = wallColor;
        } catch (e) {
          ctx.fillStyle = '#ffffff';
        }
        const wt = Math.max(1, Math.floor(cellSize * 0.08));
        tplWallEdges.forEach(w => {
          const px = w.x * cellSize;
          const py = w.y * cellSize;
          const edge = w.edge;
          const isDiag = typeof edge === 'string' && edge.startsWith('diag');
          const isRound = typeof edge === 'string' && edge.startsWith('round');
          if (edge === 'N') ctx.fillRect(px, py - Math.floor(wt/2), cellSize, wt);
          else if (edge === 'S') ctx.fillRect(px, py + cellSize - Math.floor(wt/2), cellSize, wt);
          else if (edge === 'E') ctx.fillRect(px + cellSize - Math.floor(wt/2), py, wt, cellSize);
          else if (edge === 'W') ctx.fillRect(px - Math.floor(wt/2), py, wt, cellSize);
          else if (isDiag) {
            ctx.save();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = wt;
            ctx.lineCap = 'round';
            ctx.beginPath();
            if (edge === 'diag1' || edge === 'diag2') {
              ctx.moveTo(px + cellSize, py);
              ctx.lineTo(px, py + cellSize);
            } else {
              ctx.moveTo(px, py);
              ctx.lineTo(px + cellSize, py + cellSize);
            }
            ctx.stroke();
            ctx.restore();
          } else if (isRound) {
            ctx.save();
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = wt;
            ctx.lineCap = 'round';
            ctx.beginPath();
            if (edge === 'round1') {
              ctx.arc(px, py, cellSize, 0, Math.PI / 2);
            } else if (edge === 'round2') {
              ctx.arc(px + cellSize, py + cellSize, cellSize, Math.PI, Math.PI * 1.5);
            } else if (edge === 'round3') {
              ctx.arc(px + cellSize, py, cellSize, Math.PI / 2, Math.PI);
            } else if (edge === 'round4') {
              ctx.arc(px, py + cellSize, cellSize, Math.PI * 1.5, Math.PI * 2);
            }
            ctx.stroke();
            ctx.restore();
          }
        });
      }

  // Draw doors preview (colored by type/state when available), shortened and centered
      tplDoors.forEach(d => {
        const gx = startX + (d.x || 0);
        const gy = startY + (d.y || 0);
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          const px = gx * cellSize;
          const py = gy * cellSize;
          ctx.fillStyle = doorColorFor(d);
          if (d.edge === 'N') ctx.fillRect(px + doorOffset, py - Math.floor(doorThickness / 2), doorLength, doorThickness);
          if (d.edge === 'S') ctx.fillRect(px + doorOffset, py + cellSize - Math.floor(doorThickness / 2), doorLength, doorThickness);
          if (d.edge === 'E') ctx.fillRect(px + cellSize - Math.floor(doorThickness / 2), py + doorOffset, doorThickness, doorLength);
          if (d.edge === 'W') ctx.fillRect(px - Math.floor(doorThickness / 2), py + doorOffset, doorThickness, doorLength);
        }
      });
      // Draw inner (open) edges on top of doors so gaps are obvious
      if (tplInnerEdges.horiz.length > 0 || tplInnerEdges.vert.length > 0) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(110,231,183,0.95)'; // strong mint/light-green
        ctx.lineWidth = Math.max(1, Math.floor(cellSize * 0.12));
        ctx.setLineDash([]);
        tplInnerEdges.horiz.forEach(e => {
          const px = e.x * cellSize;
          const py = e.y * cellSize + cellSize;
          ctx.beginPath();
          ctx.moveTo(px + 0.5, py + 0.5);
          ctx.lineTo(px + cellSize - 0.5, py + 0.5);
          ctx.stroke();
        });
        tplInnerEdges.vert.forEach(e => {
          const px = e.x * cellSize + cellSize;
          const py = e.y * cellSize;
          ctx.beginPath();
          ctx.moveTo(px + 0.5, py + 0.5);
          ctx.lineTo(px + 0.5, py + cellSize - 0.5);
          ctx.stroke();
        });
        ctx.restore();
      }

      // Draw small 'open edge' ticks on perimeter edges where no wall exists
      // so users can immediately see gaps. Use a bright lime tick for visibility.
      try {
        // Build a set of walls that will exist if the template is placed: include
        // current state walls plus any walls defined on the template (offset).
        const wallSet = new Set();
        try {
          (walls || []).forEach(w => wallSet.add(`${w.x},${w.y},${w.edge}`));
        } catch (e) {}
        try {
          const tplWalls = (activeTemplate && (activeTemplate.walls || [])) || [];
          tplWalls.forEach(w => {
            const wx = (startX || 0) + (w.x || 0);
            const wy = (startY || 0) + (w.y || 0);
            wallSet.add(`${wx},${wy},${w.edge}`);
          });
        } catch (e) {}
        // Build a set of doors that will exist (current doors + any template doors)
        const doorSet = new Set();
        try {
          (doors || []).forEach(d => doorSet.add(`${d.x},${d.y},${d.edge}`));
        } catch (e) {}
        try {
          const tplDoorsLocal = (activeTemplate && (activeTemplate.doors || [])) || [];
          tplDoorsLocal.forEach(d => {
            const dx = (startX || 0) + (d.x || 0);
            const dy = (startY || 0) + (d.y || 0);
            doorSet.add(`${dx},${dy},${d.edge}`);
          });
        } catch (e) {}
        ctx.save();
  // Draw larger hollow lime rings slightly outside the perimeter so
  // open edges are unmistakable and visually distinct from doors.
  ctx.strokeStyle = 'rgba(34,197,94,0.98)'; // lime-500 strong
  ctx.fillStyle = 'transparent';
  const markerSize = Math.max(6, Math.floor(cellSize * 0.34));
  ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.06));
  for (let ry = 0; ry < tpl.length; ry++) {
          for (let rx = 0; rx < tpl[ry].length; rx++) {
            const val = tpl[ry][rx];
            if (!val || val === 0) continue;
            const gx = startX + rx;
            const gy = startY + ry;
            const px = gx * cellSize;
            const py = gy * cellSize;
            const northNeighbor = (ry - 1) >= 0 && tpl[ry - 1] && tpl[ry - 1][rx];
            const southNeighbor = (ry + 1) < tpl.length && tpl[ry + 1] && tpl[ry + 1][rx];
            const westNeighbor = (rx - 1) >= 0 && tpl[ry][rx - 1];
            const eastNeighbor = (rx + 1) < tpl[ry].length && tpl[ry][rx + 1];

            // Draw marker slightly outside the cell edge (half marker outside)
            if (!northNeighbor && !wallSet.has(`${gx},${gy},N`) && !doorSet.has(`${gx},${gy},N`)) {
              const cx = px + cellSize / 2;
              const cy = py - Math.floor(markerSize / 2);
              ctx.beginPath();
              ctx.arc(cx, cy, Math.floor(markerSize / 2), 0, Math.PI * 2);
              ctx.stroke();
            }
            if (!southNeighbor && !wallSet.has(`${gx},${gy},S`) && !doorSet.has(`${gx},${gy},S`)) {
              const cx = px + cellSize / 2;
              const cy = py + cellSize + Math.floor(markerSize / 2);
              ctx.beginPath();
              ctx.arc(cx, cy, Math.floor(markerSize / 2), 0, Math.PI * 2);
              ctx.stroke();
            }
            if (!eastNeighbor && !wallSet.has(`${gx},${gy},E`) && !doorSet.has(`${gx},${gy},E`)) {
              const cx = px + cellSize + Math.floor(markerSize / 2);
              const cy = py + cellSize / 2;
              ctx.beginPath();
              ctx.arc(cx, cy, Math.floor(markerSize / 2), 0, Math.PI * 2);
              ctx.stroke();
            }
            if (!westNeighbor && !wallSet.has(`${gx},${gy},W`) && !doorSet.has(`${gx},${gy},W`)) {
              const cx = px - Math.floor(markerSize / 2);
              const cy = py + cellSize / 2;
              ctx.beginPath();
              ctx.arc(cx, cy, Math.floor(markerSize / 2), 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      } catch (e) { /* ignore */ }
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
        // the forward mapping was: sx = canvasWidth - logicalCy, sy = logicalCx
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

      // DungeonMode pawn glyph (drawn upright)
      ctx.fillStyle = partyHasLight ? '#000000' : (partySelected ? '#fbbf24' : '#f8fafc');
      ctx.font = `normal ${Math.max(10, Math.floor(cellSize * 0.8))}px "DungeonMode", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('@', screenCx, screenCy + 1);
    }

  }, [grid, doors, walls, roomMarkers, showMarkers, cellSize, hoveredCell, hoveredDoor, showDoorMode, rows, cols, width, height, partyPos, partySelected, shouldRotate, canvasWidth, partyHasLight, transformedPlacementTemplate, placementTemplate, autoPlacedRoom, cellStyles, scale, pan.x, pan.y]);

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

    // Update last mouse pos for T-key panning
    const screenX = e.clientX;
    const screenY = e.clientY;
    if (isTKeyPanningRef.current) {
      const last = lastMousePosRef.current;
      if (last) {
        const dx = screenX - last.x;
        const dy = screenY - last.y;
        // apply pan delta directly (screen-space)
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      }
      lastMousePosRef.current = { x: screenX, y: screenY };
      // while panning with T, don't process hover interactions
      return;
    }

    // Map mouse coordinates to logical canvas coordinates.
    // When drawing rotated (we set canvas width/height swapped and applied
    // ctx.translate(canvasWidth,0); ctx.rotate(+90deg)), the forward mapping is:
    // sx = -ly + canvasWidth, sy = lx  (where lx,ly are logical pixel coords)
    // Inverse mapping therefore is:
    // lx = sy, ly = canvasWidth - sx
    // account for pan/zoom transform: convert screen pixel -> transformed coords
    let logicalX = (mouseX - pan.x) / scale;
    let logicalY = (mouseY - pan.y) / scale;
    if (shouldRotate) {
      const lx = logicalX;
      const ly = logicalY;
      logicalX = ly;
      logicalY = canvasWidth - lx;
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

  // If we're dragging to paint, fill this cell (disabled while placing a template)
    if (!(placementTemplate || autoPlacedRoom) && isDragging && dragFillValue !== null && onCellSet && !rectStartRef.current) {
      const cellKey = `${x},${y}`;
      // If this is the first movement in this drag session, apply the pending start cell first
      if (pendingStartRef.current && !hasMovedRef.current) {
        const ps = pendingStartRef.current;
        // Only treat as moved if we've entered a different logical cell; this
        // prevents tiny pointer jitter inside the same cell from starting a paint.
        if (x !== ps.x || y !== ps.y) {
          const pKey = `${ps.x},${ps.y}`;
          if (!draggedCellsRef.current.has(pKey)) {
            draggedCellsRef.current.add(pKey);
            try { onCellSet(ps.x, ps.y, dragFillValue); } catch (e) {}
          }
          hasMovedRef.current = true;
        }
      }
      // Only fill if we haven't already filled this cell in this drag session
      if (!draggedCellsRef.current.has(cellKey)) {
        draggedCellsRef.current.add(cellKey);
        try { onCellSet(x, y, dragFillValue); } catch (e) {}
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

  // Wheel handler: delegate to pan/zoom hook
  const handleWheel = useCallback((e) => {
    handlePanZoomWheel(e, canvasRef.current);
  }, [handlePanZoomWheel]);
  

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
    setHoveredDoor(null);
    // Don't reset isDragging or didDragRef here - let mouseUp handle it
    // This prevents doors from being placed when dragging ends outside the canvas
  }, []);

  const handleMouseDown = useCallback((e) => {
    // Prevent manual painting when a placement template is active
    if (placementTemplate || autoPlacedRoom) return;
    // If the application context menu is open elsewhere, clicks should dismiss it and not act on the map
    if (contextMenuOpen && typeof onContextDismiss === 'function') {
      onContextDismiss();
      return;
    }
    // Handle right-click explicitly (some environments block contextmenu)
    // Also treat Cmd+LeftClick on macOS and Ctrl+LeftClick on non-mac as context-clicks
    const isMac = (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|MacIntel/.test(navigator.platform));
    const isModifierContextClick = (e.button === 0 && ((isMac && e.metaKey) || (!isMac && e.ctrlKey)));
    if (e.button === 2 || isModifierContextClick) {
      if (suppressContextAction) return;
      // Prevent the native browser menu and stop propagation so our app menu can show
      try { e.preventDefault(); } catch (err) {}
      try { e.stopPropagation(); } catch (err) {}

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
        try { console.debug('mouseDown context-click cell', cx, cy); if (typeof onCellContextMenu === 'function') onCellContextMenu(cx, cy, e); else if (typeof onCellRightClick === 'function') onCellRightClick(cx, cy, e, hoveredDoor?.edge); } catch (err) { console.error(err); }
      }
      return;
    }
    // If 'T' panning mode is active (hold T) and left button pressed, start panning
    if ((e.key === 't' || e.key === 'T' || isTKeyPanningRef.current) && e.button === 0) {
      // Start T-key panning
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }
    // Don't start drag on other non-left buttons
    if (e.button !== 0) return;
  if (!hoveredCell) return;

  // When placing a full template (designer or auto-placed), disable manual painting/drags
  // so accidental clicks while positioning don't paint squares. Commit placement still
  // happens in the click handler, so we only block drag/paint behavior here.
  if (placementTemplate || autoPlacedRoom) return;

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
      // Rectangle fill: toggle between empty and room (do not create corridor via click)
      const nextValue = cell === 0 ? 1 : 0;
      rectStartRef.current = { x: hoveredCell.x, y: hoveredCell.y, value: nextValue };
      setRectPreview({ x1: hoveredCell.x, y1: hoveredCell.y, x2: hoveredCell.x, y2: hoveredCell.y, value: nextValue });
      // Set dragging state so visual cursor updates behave consistently
      setIsDragging(true);
  // Track pending start cell for possible rectangle/drag
  pendingStartRef.current = { x: hoveredCell.x, y: hoveredCell.y };
  hasMovedRef.current = false;
  return;
    }

  // Start normal dragging - determine what value to fill
  // New behavior: do not cycle to corridor via dragging; toggle between empty and room
  const nextValue = cell === 0 ? 1 : 0;
  setDragFillValue(nextValue);
  setIsDragging(true);
  // Prepare pending start cell for later application when movement starts
  pendingStartRef.current = { x: hoveredCell.x, y: hoveredCell.y };
  draggedCellsRef.current.clear();
  hasMovedRef.current = false;
  // Do not immediately call onCellSet/onCellClick here; handleClick will call onCellClick for single clicks.
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
    // If we never moved (no paint), treat this as a single click on the pending start cell
    if (!hasMovedRef.current && pendingStartRef.current && onCellClick) {
      const ps = pendingStartRef.current;
      try { onCellClick(ps.x, ps.y); } catch (e) {}
    }
    // Clear pending and dragged cell refs
    pendingStartRef.current = null;
    draggedCellsRef.current.clear();
    hasMovedRef.current = false;
    try { if (onEditComplete) onEditComplete(); } catch (e) { /* ignore */ }
  }, [rectPreview, onCellSet, cols, rows, onEditComplete]);

  const handleClick = useCallback((e) => {
    // If this was a modifier-based context-click (Cmd+Click on Mac or Ctrl+Click on PC), ignore here
    const isMac = (typeof navigator !== 'undefined' && /Mac|iPhone|iPad|MacIntel/.test(navigator.platform));
    if ((isMac && e.metaKey && e.button === 0) || (!isMac && e.ctrlKey && e.button === 0)) {
      return;
    }
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

    // If hovering an edge on a room cell, toggle wall (left-click no longer places doors)
    if (hoveredDoor && cell > 0) {
      if (typeof onWallToggle === 'function') {
        onWallToggle(hoveredCell.x, hoveredCell.y, hoveredDoor.edge);
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
      return;
    }
    // Regular cell click (now handled by mousedown/mouseup for drag support)
  }, [hoveredCell, hoveredDoor, grid, onWallToggle, onPartyMove, onPartySelect, partyPos, partySelected]);

  const handleContextMenu = useCallback((e) => {
  try {
    if (suppressContextAction) {
      try { e.preventDefault(); } catch (err) {}
      try { e.stopPropagation(); } catch (err) {}
      return;
    }
  } catch (err) {}
  try { e.preventDefault(); } catch (err) {}
  try { e.stopPropagation(); } catch (err) {}
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

  // Template transform functions are now provided by useTemplateTransform hook
  // (rotateTemplateCW, rotateTemplateCCW, mirrorTemplate)

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
      if (!activeTemplateSource) return;
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        rotateTemplateCW();
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        rotateTemplateCCW();
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        mirrorTemplate();
        try { sfx.play('select2', { volume: 0.6 }); } catch (err) {}
      }
    };

    const handleGridKeyDown = (e) => {
      // When placing a template (designer or auto-placed), placement keys
      // (Q/E/W) should transform the template and must not be interpreted
      // as grid actions (such as toggling doors). Early return to avoid
      // accidental door toggles while in placement mode.
      if (activeTemplateSource) return;
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
    // Track 'T' key for panning mode
  const handleTDown = (ev) => { if (ev.key === 't' || ev.key === 'T') { isTKeyPanningRef.current = true; } };
  const handleTUp = (ev) => { if (ev.key === 't' || ev.key === 'T') { isTKeyPanningRef.current = false; lastMousePosRef.current = null; } };
  window.addEventListener('keydown', handleTDown);
  window.addEventListener('keyup', handleTUp);
    window.addEventListener('keyup', handleArrowUp);
    return () => {
      window.removeEventListener('keydown', handleGridKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handlePlacementKeyDown);
      window.removeEventListener('keydown', handleArrowDown);
  window.removeEventListener('keydown', handleTDown);
  window.removeEventListener('keyup', handleTUp);
      window.removeEventListener('keyup', handleArrowUp);
      stopGameLoop();
      pressedKeysRef.current.clear();
    };
  }, [handleKeyDown, handleKeyUp, hoveredCell, onDoorToggle, partyPos, onPartyMove, cols, rows, activeTemplateSource, rotateTemplateCW, rotateTemplateCCW, mirrorTemplate, isTKeyPanningRef]);

  // Focus canvas when a template becomes active so keyboard shortcuts work immediately.
  // (Template syncing is handled by useTemplateTransform hook)
  useEffect(() => {
    if (activeTemplateSource) {
      try { canvasRef.current && canvasRef.current.focus(); } catch (e) {}
    }
  }, [activeTemplateSource]);

  // Add global mouseup listener to handle drag ending outside canvas
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  // Global wheel listener (capture) to prevent browser back/forward navigation
  // when the pointer is over the canvas (e.g., macOS two-finger swipe).
  useEffect(() => {
    const onWheelCapture = (ev) => {
      if (!isPointerOverRef.current) return;
      // Prevent browser navigation and default scroll when inside canvas
      ev.preventDefault();
      try { ev.stopImmediatePropagation(); } catch (e) {}
      // Forward to our app handler so in-app pan/zoom still works
      try { handleWheel(ev); } catch (e) {}
    };
    window.addEventListener('wheel', onWheelCapture, { passive: false, capture: true });
    // Attach touch handlers and gesture preventers on the canvas
    const canvas = canvasRef.current;
    let onTouchStart, onTouchMove, prevent;
    if (canvas) {
      onTouchStart = (ev) => {
        if (!isPointerOverRef.current) return;
        if ((ev.touches && ev.touches.length > 1) || (ev.targetTouches && ev.targetTouches.length > 1)) {
          ev.preventDefault();
        }
      };
      onTouchMove = (ev) => {
        if (!isPointerOverRef.current) return;
        if ((ev.touches && ev.touches.length > 1) || (ev.targetTouches && ev.targetTouches.length > 1)) {
          ev.preventDefault();
        }
      };
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      prevent = (ev) => { ev.preventDefault(); };
      canvas.addEventListener('gesturestart', prevent, { passive: false });
      canvas.addEventListener('gesturechange', prevent, { passive: false });
      canvas.addEventListener('gestureend', prevent, { passive: false });
    }
    return () => {
      window.removeEventListener('wheel', onWheelCapture, { capture: true });
      if (canvas) {
        try { canvas.removeEventListener('touchstart', onTouchStart); } catch (e) {}
        try { canvas.removeEventListener('touchmove', onTouchMove); } catch (e) {}
        try { canvas.removeEventListener('gesturestart', prevent); } catch (e) {}
        try { canvas.removeEventListener('gesturechange', prevent); } catch (e) {}
        try { canvas.removeEventListener('gestureend', prevent); } catch (e) {}
      }
    };
  }, [handleWheel]);

  return (
    <div
      style={{
  position: 'relative',
  width: 'fit-content',
  height: 'fit-content',
  // Prevent touch/gesture default behaviors and scroll chaining when interacting with the canvas
  touchAction: 'none',
  overscrollBehavior: 'contain',
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
        onPointerDown={handleMouseDownPan}
        onPointerUp={handleMouseUpPan}
        onPointerMove={(e) => {
          // if middle-button panning, update pan
          if (isPanningRef.current) {
            const nx = e.clientX - panStartRef.current.x;
            const ny = e.clientY - panStartRef.current.y;
            setPan({ x: nx, y: ny });
            return;
          }
        }}
  onMouseLeave={(e) => { handleMouseLeave(e); handlePointerLeaveCanvas(); }}
  onPointerEnter={() => { handlePointerEnterCanvas(); }}
  onPointerLeave={() => { handlePointerLeaveCanvas(); }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
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
