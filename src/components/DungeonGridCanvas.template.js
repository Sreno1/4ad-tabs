/**
 * DungeonGridCanvas Template Transform Utilities
 *
 * Pure functions for rotating and mirroring placement templates.
 * Templates contain: grid (2D array), doors, walls, and cellStyles.
 */

import {
  EDGE_ROTATE_CW,
  DIAG_ROTATE_CW,
  ROUND_ROTATE_CW,
  EDGE_MIRROR_H,
  DIAG_MIRROR_H,
  ROUND_MIRROR_H,
} from './DungeonGridCanvas.constants.js';

// =============================================================================
// EDGE MAPPING HELPERS
// =============================================================================

/**
 * Get the rotated edge after clockwise rotation
 */
function rotateEdgeCW(edge) {
  // Check all mappings
  if (EDGE_ROTATE_CW[edge]) return EDGE_ROTATE_CW[edge];
  if (DIAG_ROTATE_CW[edge]) return DIAG_ROTATE_CW[edge];
  if (ROUND_ROTATE_CW[edge]) return ROUND_ROTATE_CW[edge];
  return edge;
}

/**
 * Get the mirrored edge after horizontal mirror
 */
function mirrorEdgeH(edge) {
  if (EDGE_MIRROR_H[edge]) return EDGE_MIRROR_H[edge];
  if (DIAG_MIRROR_H[edge]) return DIAG_MIRROR_H[edge];
  if (ROUND_MIRROR_H[edge]) return ROUND_MIRROR_H[edge];
  return edge;
}

// =============================================================================
// TEMPLATE CLONING
// =============================================================================

/**
 * Deep clone a placement template
 * Creates independent copies of grid, doors, walls, and cellStyles
 *
 * @param {object} tpl - Template with grid, doors, walls, cellStyles
 * @returns {object|null} Cloned template or null if invalid
 */
export function cloneTemplate(tpl) {
  if (!tpl) return null;

  // Handle both wrapped templates and raw grids
  const grid = tpl.grid
    ? tpl.grid.map(row => row.slice())
    : (Array.isArray(tpl) ? tpl.map(row => row.slice()) : null);

  const doors = (tpl.doors || []).map(d => ({ ...d }));
  const walls = (tpl.walls || []).map(w => ({ ...w }));
  const cellStyles = { ...(tpl.cellStyles || {}) };

  return { grid, doors, walls, cellStyles };
}

// =============================================================================
// CLOCKWISE ROTATION
// =============================================================================

/**
 * Rotate a template 90 degrees clockwise
 *
 * Grid rotation: newGrid[r][c] = oldGrid[H-1-c][r]
 * Coordinate mapping: (x, y) -> (H-1-y, x)
 *
 * @param {object} tpl - Template to rotate
 * @returns {object} Rotated template
 */
export function rotateCW(tpl) {
  if (!tpl || !tpl.grid) return tpl;

  const grid = tpl.grid;
  const H = grid.length;
  const W = grid[0]?.length || 0;

  // Create rotated grid
  const newGrid = Array.from({ length: W }, () => Array(H).fill(0));
  for (let r = 0; r < W; r++) {
    for (let c = 0; c < H; c++) {
      newGrid[r][c] = grid[H - 1 - c][r];
    }
  }

  // Rotate cell styles
  const newCellStyles = {};
  Object.keys(tpl.cellStyles || {}).forEach(key => {
    const parts = key.split(',').map(Number);
    if (parts.length !== 2) return;

    const [ox, oy] = parts;
    const nx = (H - 1) - oy;
    const ny = ox;
    const style = tpl.cellStyles[key];

    newCellStyles[`${nx},${ny}`] = rotateEdgeCW(style);
  });

  // Rotate doors: (x, y) -> (H-1-y, x)
  const newDoors = (tpl.doors || []).map(d => ({
    ...d,
    x: (H - 1) - d.y,
    y: d.x,
    edge: rotateEdgeCW(d.edge),
  }));

  // Rotate walls: (x, y) -> (H-1-y, x)
  const newWalls = (tpl.walls || []).map(w => ({
    ...w,
    x: (H - 1) - w.y,
    y: w.x,
    edge: rotateEdgeCW(w.edge),
  }));

  // Preserve other metadata (id, name, etc.)
  return {
    ...tpl,
    grid: newGrid,
    doors: newDoors,
    walls: newWalls,
    cellStyles: newCellStyles,
  };
}

// =============================================================================
// COUNTER-CLOCKWISE ROTATION
// =============================================================================

/**
 * Rotate a template 90 degrees counter-clockwise
 * Implemented as 3 clockwise rotations for simplicity
 *
 * @param {object} tpl - Template to rotate
 * @returns {object} Rotated template
 */
export function rotateCCW(tpl) {
  // Rotate CCW = rotate CW three times
  let result = cloneTemplate(tpl) || tpl;
  result = rotateCW(result);
  result = rotateCW(result);
  result = rotateCW(result);
  return result;
}

// =============================================================================
// HORIZONTAL MIRROR
// =============================================================================

/**
 * Mirror a template horizontally (flip left-right)
 *
 * Grid mirror: reverse each row
 * Coordinate mapping: (x, y) -> (W-1-x, y)
 *
 * @param {object} tpl - Template to mirror
 * @returns {object} Mirrored template
 */
export function mirrorHorizontal(tpl) {
  if (!tpl || !tpl.grid) return tpl;

  const grid = tpl.grid;
  const H = grid.length;
  const W = grid[0]?.length || 0;

  // Mirror grid (reverse each row)
  const newGrid = grid.map(row => row.slice().reverse());

  // Mirror cell styles
  const newCellStyles = {};
  Object.keys(tpl.cellStyles || {}).forEach(key => {
    const parts = key.split(',').map(Number);
    if (parts.length !== 2) return;

    const [ox, oy] = parts;
    const nx = (W - 1) - ox;
    const ny = oy;
    const style = tpl.cellStyles[key];

    newCellStyles[`${nx},${ny}`] = mirrorEdgeH(style);
  });

  // Mirror doors: (x, y) -> (W-1-x, y)
  const newDoors = (tpl.doors || []).map(d => ({
    ...d,
    x: (W - 1) - d.x,
    y: d.y,
    edge: mirrorEdgeH(d.edge),
  }));

  // Mirror walls: (x, y) -> (W-1-x, y)
  const newWalls = (tpl.walls || []).map(w => ({
    ...w,
    x: (W - 1) - w.x,
    y: w.y,
    edge: mirrorEdgeH(w.edge),
  }));

  // Preserve other metadata
  return {
    ...tpl,
    grid: newGrid,
    doors: newDoors,
    walls: newWalls,
    cellStyles: newCellStyles,
  };
}

// =============================================================================
// TEMPLATE BOUNDS
// =============================================================================

/**
 * Get the bounding box of a template
 *
 * @param {object} tpl - Template with grid
 * @returns {object} { width, height } or { width: 0, height: 0 } if invalid
 */
export function getTemplateBounds(tpl) {
  if (!tpl?.grid) return { width: 0, height: 0 };
  const height = tpl.grid.length;
  const width = tpl.grid[0]?.length || 0;
  return { width, height };
}

/**
 * Check if a template has any filled cells
 *
 * @param {object} tpl - Template with grid
 * @returns {boolean} True if any cell has value > 0
 */
export function isTemplateEmpty(tpl) {
  if (!tpl?.grid) return true;
  return !tpl.grid.some(row => row.some(cell => cell > 0));
}
