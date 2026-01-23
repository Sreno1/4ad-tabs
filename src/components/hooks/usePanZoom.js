import { useState, useRef, useCallback } from 'react';
import { ZOOM, PAN } from '../DungeonGridCanvas.constants.js';
import { calculateZoom } from '../DungeonGridCanvas.geometry.js';

/**
 * usePanZoom - Hook for managing canvas pan and zoom state
 *
 * Provides:
 * - scale/pan state
 * - Mouse wheel zoom (Ctrl/Cmd + scroll)
 * - Middle mouse button panning
 * - T-key panning mode
 * - Pointer overscroll lock (prevents browser navigation gestures)
 *
 * @returns {object} Pan/zoom state and handlers
 */
export function usePanZoom() {
  // Core state
  const [scale, setScale] = useState(ZOOM.default);
  const [pan, setPan] = useState(PAN.default);

  // Refs for tracking pan state
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const isTKeyPanningRef = useRef(false);
  const lastMousePosRef = useRef(null);

  // Refs for overscroll lock
  const isPointerOverRef = useRef(false);
  const _prevOverscrollRef = useRef({ html: '', body: '' });
  const _prevTouchActionRef = useRef({ html: '', body: '' });

  // ==========================================================================
  // OVERSCROLL LOCK
  // ==========================================================================

  /**
   * Lock overscroll behavior when pointer enters canvas
   * Prevents browser navigation gestures from interfering
   */
  const handlePointerEnter = useCallback(() => {
    isPointerOverRef.current = true;
    try {
      const html = document.documentElement;
      const body = document.body;

      // Save current values
      _prevOverscrollRef.current.html = html.style.overscrollBehavior || '';
      _prevOverscrollRef.current.body = body.style.overscrollBehavior || '';
      _prevTouchActionRef.current.html = html.style.touchAction || '';
      _prevTouchActionRef.current.body = body.style.touchAction || '';

      // Disable overscroll and touch actions
      html.style.overscrollBehavior = 'none';
      body.style.overscrollBehavior = 'none';
      html.style.touchAction = 'none';
      body.style.touchAction = 'none';
    } catch (e) {
      // ignore
    }
  }, []);

  /**
   * Restore overscroll behavior when pointer leaves canvas
   */
  const handlePointerLeave = useCallback(() => {
    isPointerOverRef.current = false;
    try {
      const html = document.documentElement;
      const body = document.body;

      // Restore saved values
      html.style.overscrollBehavior = _prevOverscrollRef.current.html || '';
      body.style.overscrollBehavior = _prevOverscrollRef.current.body || '';
      html.style.touchAction = _prevTouchActionRef.current.html || '';
      body.style.touchAction = _prevTouchActionRef.current.body || '';
    } catch (e) {
      // ignore
    }
  }, []);

  // ==========================================================================
  // WHEEL ZOOM
  // ==========================================================================

  /**
   * Handle wheel events for zooming
   * Ctrl/Cmd + wheel = zoom around mouse position
   *
   * @param {WheelEvent} e - Wheel event
   * @param {HTMLCanvasElement} canvas - Canvas element for position calculation
   */
  const handleWheel = useCallback((e, canvas) => {
    // Only handle zoom with ctrl/meta key
    if (!(e.ctrlKey || e.metaKey)) return;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new scale and pan
    const result = calculateZoom(scale, e.deltaY, mouseX, mouseY, pan);
    setScale(result.scale);
    setPan(result.pan);
  }, [scale, pan]);

  // ==========================================================================
  // MIDDLE MOUSE BUTTON PANNING
  // ==========================================================================

  /**
   * Start panning on middle mouse button down
   */
  const handleMiddleMouseDown = useCallback((e) => {
    if (e.button !== 1) return false;

    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };

    // Capture pointer to keep receiving events
    try {
      e.target?.setPointerCapture?.(e.pointerId);
    } catch (err) {
      // ignore
    }

    return true;
  }, [pan]);

  /**
   * Stop panning on middle mouse button up
   */
  const handleMiddleMouseUp = useCallback((e) => {
    if (e.button !== 1) return false;

    isPanningRef.current = false;

    try {
      e.target?.releasePointerCapture?.(e.pointerId);
    } catch (err) {
      // ignore
    }

    return true;
  }, []);

  /**
   * Update pan during middle mouse drag
   */
  const handleMiddleMouseMove = useCallback((e) => {
    if (!isPanningRef.current) return false;

    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });

    return true;
  }, []);

  // ==========================================================================
  // T-KEY PANNING
  // ==========================================================================

  /**
   * Start T-key panning mode
   */
  const startTKeyPanning = useCallback((e) => {
    isTKeyPanningRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  /**
   * Stop T-key panning mode
   */
  const stopTKeyPanning = useCallback(() => {
    isTKeyPanningRef.current = false;
    lastMousePosRef.current = null;
  }, []);

  /**
   * Update pan during T-key panning
   * Returns true if currently T-key panning (to skip other interactions)
   */
  const handleTKeyPanMove = useCallback((e) => {
    if (!isTKeyPanningRef.current) return false;

    const last = lastMousePosRef.current;
    if (last) {
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    }
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    return true;
  }, []);

  // ==========================================================================
  // RESET
  // ==========================================================================

  /**
   * Reset pan and zoom to defaults
   */
  const reset = useCallback(() => {
    setScale(ZOOM.default);
    setPan(PAN.default);
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    scale,
    pan,
    setScale,
    setPan,

    // Refs (for external checks)
    isPanningRef,
    isTKeyPanningRef,
    isPointerOverRef,

    // Handlers
    handlePointerEnter,
    handlePointerLeave,
    handleWheel,
    handleMiddleMouseDown,
    handleMiddleMouseUp,
    handleMiddleMouseMove,
    startTKeyPanning,
    stopTKeyPanning,
    handleTKeyPanMove,
    reset,
  };
}

export default usePanZoom;
