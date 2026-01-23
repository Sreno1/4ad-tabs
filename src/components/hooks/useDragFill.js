import { useState, useRef, useCallback } from 'react';
import { normalizeRect, forEachCellInRect, isInBounds } from '../DungeonGridCanvas.geometry.js';

/**
 * useDragFill - Hook for managing drag-to-fill and rectangle fill functionality
 *
 * Supports:
 * - Single click toggle (empty <-> room)
 * - Drag painting (fill cells while dragging)
 * - Cmd/Ctrl+drag rectangle fill
 *
 * @param {object} options - Configuration options
 * @param {function} options.onCellSet - Callback to set cell value (x, y, value)
 * @param {function} options.onCellClick - Callback for single cell click (x, y)
 * @param {function} options.onEditComplete - Callback when editing completes
 * @param {number} options.cols - Number of columns
 * @param {number} options.rows - Number of rows
 * @returns {object} Drag fill state and handlers
 */
export function useDragFill({ onCellSet, onCellClick, onEditComplete, cols, rows }) {
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragFillValue, setDragFillValue] = useState(null); // 0, 1, or 2

  // Rectangle preview state
  const [rectPreview, setRectPreview] = useState(null); // {x1, y1, x2, y2, value}

  // Refs for tracking drag state
  const draggedCellsRef = useRef(new Set()); // Cells already filled in this drag
  const rectStartRef = useRef(null); // Start position for rectangle fill
  const pendingStartRef = useRef(null); // Pending start cell (for click vs drag detection)
  const hasMovedRef = useRef(false); // Whether mouse has moved during drag

  /**
   * Get next fill value based on current cell value
   * Toggles between empty (0) and room (1)
   */
  const getNextFillValue = useCallback((currentValue) => {
    return currentValue === 0 ? 1 : 0;
  }, []);

  /**
   * Start a drag operation
   *
   * @param {object} cell - Cell coordinates { x, y }
   * @param {number} cellValue - Current value of the cell
   * @param {object} options - Options { isMetaKey, isCtrlKey }
   * @returns {boolean} True if drag started (prevents other actions)
   */
  const startDrag = useCallback((cell, cellValue, { isMetaKey, isCtrlKey } = {}) => {
    if (!cell) return false;

    const nextValue = getNextFillValue(cellValue);

    // Rectangle fill mode (Meta/Ctrl held)
    if (isMetaKey || isCtrlKey) {
      rectStartRef.current = { x: cell.x, y: cell.y, value: nextValue };
      setRectPreview({
        x1: cell.x,
        y1: cell.y,
        x2: cell.x,
        y2: cell.y,
        value: nextValue,
      });
      setIsDragging(true);
      pendingStartRef.current = { x: cell.x, y: cell.y };
      hasMovedRef.current = false;
      return true;
    }

    // Normal drag fill mode
    setDragFillValue(nextValue);
    setIsDragging(true);
    pendingStartRef.current = { x: cell.x, y: cell.y };
    draggedCellsRef.current.clear();
    hasMovedRef.current = false;

    return true;
  }, [getNextFillValue]);

  /**
   * Update drag during mouse move
   *
   * @param {object} cell - Current cell coordinates { x, y }
   * @returns {boolean} True if cell was filled
   */
  const updateDrag = useCallback((cell) => {
    if (!isDragging || !cell) return false;

    // Rectangle fill mode
    if (rectStartRef.current) {
      const sx = rectStartRef.current.x;
      const sy = rectStartRef.current.y;
      const rect = normalizeRect(sx, sy, cell.x, cell.y);
      setRectPreview({ ...rect, value: rectStartRef.current.value });
      hasMovedRef.current = true;
      return true;
    }

    // Normal drag fill mode
    if (dragFillValue === null || !onCellSet) return false;

    const cellKey = `${cell.x},${cell.y}`;

    // Apply pending start cell on first move
    if (pendingStartRef.current && !hasMovedRef.current) {
      const ps = pendingStartRef.current;
      if (cell.x !== ps.x || cell.y !== ps.y) {
        const pKey = `${ps.x},${ps.y}`;
        if (!draggedCellsRef.current.has(pKey)) {
          draggedCellsRef.current.add(pKey);
          try {
            onCellSet(ps.x, ps.y, dragFillValue);
          } catch (e) {
            // ignore
          }
        }
        hasMovedRef.current = true;
      }
    }

    // Fill current cell if not already filled
    if (!draggedCellsRef.current.has(cellKey)) {
      draggedCellsRef.current.add(cellKey);
      try {
        onCellSet(cell.x, cell.y, dragFillValue);
      } catch (e) {
        // ignore
      }
      return true;
    }

    return false;
  }, [isDragging, dragFillValue, onCellSet]);

  /**
   * End drag operation and apply rectangle fill if active
   */
  const endDrag = useCallback(() => {
    // Apply rectangle fill
    if (rectStartRef.current && rectPreview && onCellSet) {
      const { x1, y1, x2, y2, value } = rectPreview;
      forEachCellInRect({ x1, y1, x2, y2 }, (x, y) => {
        if (!isInBounds(x, y, cols, rows)) return;
        try {
          onCellSet(x, y, value);
        } catch (e) {
          // ignore individual failures
        }
      });
    }

    // Handle single click (no movement)
    if (!hasMovedRef.current && pendingStartRef.current && onCellClick) {
      const ps = pendingStartRef.current;
      try {
        onCellClick(ps.x, ps.y);
      } catch (e) {
        // ignore
      }
    }

    // Reset all state
    setIsDragging(false);
    setDragFillValue(null);
    rectStartRef.current = null;
    setRectPreview(null);
    pendingStartRef.current = null;
    draggedCellsRef.current.clear();
    hasMovedRef.current = false;

    // Notify edit complete
    try {
      if (onEditComplete) onEditComplete();
    } catch (e) {
      // ignore
    }
  }, [rectPreview, onCellSet, onCellClick, onEditComplete, cols, rows]);

  /**
   * Cancel drag without applying changes
   */
  const cancelDrag = useCallback(() => {
    setIsDragging(false);
    setDragFillValue(null);
    rectStartRef.current = null;
    setRectPreview(null);
    pendingStartRef.current = null;
    draggedCellsRef.current.clear();
    hasMovedRef.current = false;
  }, []);

  /**
   * Check if we should skip click handling (dragged multiple cells)
   */
  const shouldSkipClick = useCallback(() => {
    if (draggedCellsRef.current.size > 1) {
      draggedCellsRef.current.clear();
      return true;
    }
    draggedCellsRef.current.clear();
    return false;
  }, []);

  return {
    // State
    isDragging,
    dragFillValue,
    rectPreview,

    // Refs (for external checks)
    draggedCellsRef,
    rectStartRef,

    // Handlers
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    shouldSkipClick,
    getNextFillValue,
  };
}

export default useDragFill;
