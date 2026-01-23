/**
 * DungeonGridCanvas Geometry Utilities
 *
 * Pure functions for coordinate transformations between screen space,
 * logical canvas space, and grid cell coordinates.
 *
 * Coordinate spaces:
 * - Screen: Raw mouse coordinates relative to canvas element
 * - Logical: Canvas coordinates after pan/zoom but before rotation
 * - Grid: Cell coordinates (x, y integers)
 */

import { ZOOM } from './DungeonGridCanvas.constants.js';

// =============================================================================
// COORDINATE TRANSFORMATIONS
// =============================================================================

/**
 * Transform screen coordinates to logical canvas coordinates
 * Accounts for pan and zoom transforms
 *
 * @param {number} screenX - Screen X coordinate (relative to canvas)
 * @param {number} screenY - Screen Y coordinate (relative to canvas)
 * @param {object} pan - Current pan offset { x, y }
 * @param {number} scale - Current zoom scale
 * @returns {object} { x, y } in logical coordinates
 */
export function screenToLogical(screenX, screenY, pan, scale) {
  return {
    x: (screenX - pan.x) / scale,
    y: (screenY - pan.y) / scale,
  };
}

/**
 * Transform screen coordinates to logical coordinates with rotation handling
 *
 * When canvas is rotated 90° CW:
 * - Forward mapping: sx = -ly + canvasWidth, sy = lx
 * - Inverse mapping: lx = sy, ly = canvasWidth - sx
 *
 * @param {number} screenX - Screen X coordinate (relative to canvas)
 * @param {number} screenY - Screen Y coordinate (relative to canvas)
 * @param {object} pan - Current pan offset { x, y }
 * @param {number} scale - Current zoom scale
 * @param {boolean} shouldRotate - Whether canvas is rotated
 * @param {number} canvasWidth - Logical canvas width (for rotation transform)
 * @returns {object} { x, y } in logical coordinates
 */
export function screenToLogicalWithRotation(screenX, screenY, pan, scale, shouldRotate, canvasWidth) {
  let logicalX = (screenX - pan.x) / scale;
  let logicalY = (screenY - pan.y) / scale;

  if (shouldRotate) {
    const lx = logicalX;
    const ly = logicalY;
    logicalX = ly;
    logicalY = canvasWidth - lx;
  }

  return { x: logicalX, y: logicalY };
}

/**
 * Transform logical coordinates to grid cell coordinates
 *
 * @param {number} logicalX - Logical X coordinate
 * @param {number} logicalY - Logical Y coordinate
 * @param {number} cellSize - Size of each grid cell in pixels
 * @returns {object} { x, y } grid cell coordinates (integers)
 */
export function logicalToGrid(logicalX, logicalY, cellSize) {
  return {
    x: Math.floor(logicalX / cellSize),
    y: Math.floor(logicalY / cellSize),
  };
}

/**
 * Get the local coordinates within a cell (0 to cellSize)
 * Useful for detecting which edge of a cell the pointer is near
 *
 * @param {number} logicalX - Logical X coordinate
 * @param {number} logicalY - Logical Y coordinate
 * @param {number} cellSize - Size of each grid cell in pixels
 * @returns {object} { x, y } coordinates within the cell
 */
export function getCellLocalCoords(logicalX, logicalY, cellSize) {
  return {
    x: ((logicalX % cellSize) + cellSize) % cellSize,
    y: ((logicalY % cellSize) + cellSize) % cellSize,
  };
}

/**
 * Transform grid coordinates to pixel coordinates (top-left corner of cell)
 *
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridY - Grid Y coordinate
 * @param {number} cellSize - Size of each grid cell in pixels
 * @returns {object} { x, y } pixel coordinates
 */
export function gridToPixel(gridX, gridY, cellSize) {
  return {
    x: gridX * cellSize,
    y: gridY * cellSize,
  };
}

/**
 * Get cell center coordinates in pixels
 *
 * @param {number} gridX - Grid X coordinate
 * @param {number} gridY - Grid Y coordinate
 * @param {number} cellSize - Size of each grid cell in pixels
 * @returns {object} { x, y } center pixel coordinates
 */
export function getCellCenter(gridX, gridY, cellSize) {
  return {
    x: gridX * cellSize + cellSize / 2,
    y: gridY * cellSize + cellSize / 2,
  };
}

// =============================================================================
// EDGE DETECTION
// =============================================================================

/**
 * Detect which edge of a cell the pointer is near
 * Used for door/wall placement
 *
 * @param {number} cellLocalX - X coordinate within cell (0 to cellSize)
 * @param {number} cellLocalY - Y coordinate within cell (0 to cellSize)
 * @param {number} cellSize - Size of the cell
 * @param {number} threshold - Distance from edge to count as "near" (default: cellSize * 0.2)
 * @returns {string|null} Edge identifier ('N', 'S', 'E', 'W') or null if not near edge
 */
export function detectEdge(cellLocalX, cellLocalY, cellSize, threshold = null) {
  const t = threshold ?? cellSize * 0.2;

  // Check corners first (prioritize by closest edge)
  if (cellLocalY < t && cellLocalX < t) {
    return cellLocalY < cellLocalX ? 'N' : 'W';
  }
  if (cellLocalY < t && cellLocalX > cellSize - t) {
    return cellLocalY < (cellSize - cellLocalX) ? 'N' : 'E';
  }
  if (cellLocalY > cellSize - t && cellLocalX < t) {
    return (cellSize - cellLocalY) < cellLocalX ? 'S' : 'W';
  }
  if (cellLocalY > cellSize - t && cellLocalX > cellSize - t) {
    return (cellSize - cellLocalY) < (cellSize - cellLocalX) ? 'S' : 'E';
  }

  // Check straight edges
  if (cellLocalY < t) return 'N';
  if (cellLocalY > cellSize - t) return 'S';
  if (cellLocalX > cellSize - t) return 'E';
  if (cellLocalX < t) return 'W';

  return null;
}

// =============================================================================
// BOUNDS CHECKING
// =============================================================================

/**
 * Check if grid coordinates are within bounds
 *
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @returns {boolean} True if coordinates are within bounds
 */
export function isInBounds(x, y, cols, rows) {
  return x >= 0 && x < cols && y >= 0 && y < rows;
}

/**
 * Clamp grid coordinates to bounds
 *
 * @param {number} x - Grid X coordinate
 * @param {number} y - Grid Y coordinate
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @returns {object} { x, y } clamped coordinates
 */
export function clampToBounds(x, y, cols, rows) {
  return {
    x: Math.max(0, Math.min(x, cols - 1)),
    y: Math.max(0, Math.min(y, rows - 1)),
  };
}

// =============================================================================
// ZOOM CALCULATIONS
// =============================================================================

/**
 * Calculate new scale and pan after zooming around a point
 *
 * @param {number} currentScale - Current zoom scale
 * @param {number} deltaY - Scroll delta (negative = zoom in)
 * @param {number} mouseX - Mouse X position (relative to canvas)
 * @param {number} mouseY - Mouse Y position (relative to canvas)
 * @param {object} currentPan - Current pan offset { x, y }
 * @returns {object} { scale, pan } new values
 */
export function calculateZoom(currentScale, deltaY, mouseX, mouseY, currentPan) {
  const delta = -deltaY * ZOOM.sensitivity;
  const newScale = Math.min(ZOOM.max, Math.max(ZOOM.min, currentScale * (1 + delta)));

  // Adjust pan so zoom centers on mouse position
  const wx = (mouseX - currentPan.x) / currentScale;
  const wy = (mouseY - currentPan.y) / currentScale;
  const newPanX = mouseX - wx * newScale;
  const newPanY = mouseY - wy * newScale;

  return {
    scale: newScale,
    pan: { x: newPanX, y: newPanY },
  };
}

/**
 * Calculate pan delta from mouse movement
 *
 * @param {number} currentX - Current mouse X
 * @param {number} currentY - Current mouse Y
 * @param {number} lastX - Previous mouse X
 * @param {number} lastY - Previous mouse Y
 * @returns {object} { dx, dy } pan delta
 */
export function calculatePanDelta(currentX, currentY, lastX, lastY) {
  return {
    dx: currentX - lastX,
    dy: currentY - lastY,
  };
}

// =============================================================================
// RECTANGLE CALCULATIONS
// =============================================================================

/**
 * Normalize a rectangle to ensure x1 <= x2 and y1 <= y2
 *
 * @param {number} x1 - First X coordinate
 * @param {number} y1 - First Y coordinate
 * @param {number} x2 - Second X coordinate
 * @param {number} y2 - Second Y coordinate
 * @returns {object} { x1, y1, x2, y2 } normalized rectangle
 */
export function normalizeRect(x1, y1, x2, y2) {
  return {
    x1: Math.min(x1, x2),
    y1: Math.min(y1, y2),
    x2: Math.max(x1, x2),
    y2: Math.max(y1, y2),
  };
}

/**
 * Iterate over all cells in a rectangle
 *
 * @param {object} rect - Rectangle { x1, y1, x2, y2 }
 * @param {function} callback - Function called with (x, y) for each cell
 */
export function forEachCellInRect(rect, callback) {
  for (let y = rect.y1; y <= rect.y2; y++) {
    for (let x = rect.x1; x <= rect.x2; x++) {
      callback(x, y);
    }
  }
}

// =============================================================================
// GRID DIMENSION CALCULATIONS
// =============================================================================

/**
 * Calculate grid dimensions from grid array
 *
 * @param {Array} grid - 2D grid array
 * @returns {object} { cols, rows }
 */
export function getGridDimensions(grid) {
  const rows = grid?.length || 0;
  const cols = grid?.[0]?.length || 0;
  return { cols, rows };
}

/**
 * Calculate canvas dimensions based on grid and cell size
 *
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 * @param {number} cellSize - Size of each cell in pixels
 * @param {boolean} shouldRotate - Whether canvas should be rotated
 * @returns {object} { width, height, canvasWidth, canvasHeight }
 */
export function getCanvasDimensions(cols, rows, cellSize, shouldRotate) {
  const width = cols * cellSize;
  const height = rows * cellSize;

  // When rotated, swap canvas dimensions
  const canvasWidth = shouldRotate ? height : width;
  const canvasHeight = shouldRotate ? width : height;

  return { width, height, canvasWidth, canvasHeight };
}
