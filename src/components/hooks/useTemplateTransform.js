import { useState, useCallback, useEffect } from 'react';
import {
  cloneTemplate,
  rotateCW,
  rotateCCW,
  mirrorHorizontal,
} from '../DungeonGridCanvas.template.js';

/**
 * useTemplateTransform - Hook for managing placement template transformations
 *
 * Provides:
 * - Local transformed copy of placement template
 * - Rotation (Q = CCW, E = CW)
 * - Mirror (W = horizontal flip)
 * - Auto-sync when source template changes
 *
 * @param {object} placementTemplate - Source template from props
 * @returns {object} Transformed template state and transform handlers
 */
export function useTemplateTransform(placementTemplate) {
  // Local transformed copy of the template
  const [transformedTemplate, setTransformedTemplate] = useState(null);

  /**
   * Sync transformed template when source changes
   */
  useEffect(() => {
    if (placementTemplate) {
      setTransformedTemplate(cloneTemplate(placementTemplate));
    } else {
      setTransformedTemplate(null);
    }
  }, [placementTemplate]);

  /**
   * Rotate template clockwise (E key)
   */
  const rotateClockwise = useCallback(() => {
    setTransformedTemplate(prev => {
      if (!prev) return prev;
      return rotateCW(prev);
    });
  }, []);

  /**
   * Rotate template counter-clockwise (Q key)
   */
  const rotateCounterClockwise = useCallback(() => {
    setTransformedTemplate(prev => {
      if (!prev) return prev;
      return rotateCCW(prev);
    });
  }, []);

  /**
   * Mirror template horizontally (W key)
   */
  const mirror = useCallback(() => {
    setTransformedTemplate(prev => {
      if (!prev) return prev;
      return mirrorHorizontal(prev);
    });
  }, []);

  /**
   * Reset to original template
   */
  const reset = useCallback(() => {
    if (placementTemplate) {
      setTransformedTemplate(cloneTemplate(placementTemplate));
    }
  }, [placementTemplate]);

  /**
   * Handle keyboard shortcuts for transforms
   *
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {boolean} True if event was handled
   */
  const handleKeyDown = useCallback((e) => {
    // Only handle if we have a template
    if (!transformedTemplate) return false;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'q':
        rotateCounterClockwise();
        return true;
      case 'e':
        rotateClockwise();
        return true;
      case 'w':
        mirror();
        return true;
      default:
        return false;
    }
  }, [transformedTemplate, rotateCounterClockwise, rotateClockwise, mirror]);

  /**
   * Check if template is active
   */
  const hasTemplate = transformedTemplate !== null;

  return {
    // State
    transformedTemplate,
    setTransformedTemplate,
    hasTemplate,

    // Transform handlers
    rotateClockwise,
    rotateCounterClockwise,
    mirror,
    reset,

    // Keyboard handler
    handleKeyDown,
  };
}

export default useTemplateTransform;
