import React, { memo } from 'react'

/**
 * DoorEdge component renders a clickable door edge on the dungeon grid
 * Handles both placed and unplaced doors with appropriate styling
 *
 * @param {Object} props
 * @param {number} props.x - Grid X coordinate
 * @param {number} props.y - Grid Y coordinate
 * @param {string} props.edge - Edge direction: 'N', 'S', 'E', 'W'
 * @param {boolean} props.isDoorPlaced - Whether a door is placed on this edge
 * @param {number} props.cellSize - Size of the grid cell in pixels
 * @param {Function} props.onClick - Callback when door edge is clicked
 */
const DoorEdge = memo(function DoorEdge({
  x,
  y,
  edge,
  isDoorPlaced,
  cellSize,
  onClick
}) {
  // Calculate edge button sizes based on cell size
  const edgeThickness = Math.max(2, Math.floor(cellSize * 0.15))
  const lineThickness = Math.max(1, Math.floor(cellSize * 0.08))

  // Position classes for different edges
  const posClass = {
    N: `absolute left-0 right-0`,
    S: `absolute left-0 right-0`,
    E: `absolute top-0 bottom-0`,
    W: `absolute top-0 bottom-0`
  }[edge]

  // Position inline styles
  const posStyle = {
    N: { top: `-${edgeThickness}px`, height: `${edgeThickness * 2}px` },
    S: { bottom: `-${edgeThickness}px`, height: `${edgeThickness * 2}px` },
    E: { right: `-${edgeThickness}px`, width: `${edgeThickness * 2}px` },
    W: { left: `-${edgeThickness}px`, width: `${edgeThickness * 2}px` }
  }[edge]

  // Line classes for the visual indicator
  const lineClass = {
    N: 'absolute top-0 left-0 right-0',
    S: 'absolute bottom-0 left-0 right-0',
    E: 'absolute right-0 top-0 bottom-0',
    W: 'absolute left-0 top-0 bottom-0'
  }[edge]

  // Line inline styles
  const lineStyle = {
    N: { height: `${lineThickness}px` },
    S: { height: `${lineThickness}px` },
    E: { width: `${lineThickness}px` },
    W: { width: `${lineThickness}px` }
  }[edge]

  // ARIA labels for accessibility
  const edgeLabels = {
    N: 'North',
    S: 'South',
    E: 'East',
    W: 'West'
  }
  const ariaLabel = isDoorPlaced
    ? `Remove door on ${edgeLabels[edge]} edge of room at (${x}, ${y})`
    : `Add door on ${edgeLabels[edge]} edge of room at (${x}, ${y})`

  // Opacity classes for unplaced doors (only visible on hover)
  const opacityClass = isDoorPlaced
    ? ''
    : 'opacity-0 group-hover/cell:opacity-100 transition-opacity'

  // Line opacity based on placement state
  const lineOpacity = isDoorPlaced
    ? 'opacity-100'
    : 'opacity-0 hover:opacity-100 transition-opacity'

  return (
    <button
      onClick={onClick}
      className={`${posClass} z-10 ${opacityClass}`}
      style={posStyle}
      aria-label={ariaLabel}
      data-door-edge={edge}
      data-door-placed={isDoorPlaced}
    >
      {/* Door indicator line */}
      <div
        className={`${lineClass} bg-amber-500 ${lineOpacity}`}
        style={lineStyle}
      />
    </button>
  )
});

export default DoorEdge;
