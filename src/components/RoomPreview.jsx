import React, { useMemo } from 'react';

/**
 * RoomPreview - Renders a compact thumbnail of a room template
 * Shows grid layout with rooms (filled), corridors (lines), and doors
 */
export default function RoomPreview({ grid, doors, walls = [], cellSize = 20 }) {
  const width = grid[0]?.length || 7;
  const height = grid.length || 7;
  const total = width * height;

  // Count rooms and corridors
  const stats = useMemo(() => {
    let rooms = 0;
    let corridors = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === 1) rooms++;
        if (grid[y][x] === 2) corridors++;
      }
    }
    return { rooms, corridors, empty: total - rooms - corridors };
  }, [grid, height, width, total]);

  return (
    <div className="flex flex-col gap-1">
      {/* Mini grid preview with wall overlays */}
      <div
        className="bg-slate-900 border border-slate-600 rounded"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gap: '1px',
          padding: '2px',
          position: 'relative'
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`rounded-sm ${
                cell === 1
                  ? 'bg-blue-600' // Room
                  : cell === 2
                  ? 'bg-slate-600' // Corridor
                  : 'bg-slate-800' // Empty
              }`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                position: 'relative',
                // door markers as small amber borders
                borderRight:
                  doors.some(
                    (d) => d.x === x && d.y === y && d.edge === 'E'
                  ) && x < width - 1
                    ? '1px solid #f59e0b'
                    : 'none',
                borderBottom:
                  doors.some(
                    (d) => d.x === x && d.y === y && d.edge === 'S'
                  ) && y < height - 1
                    ? '1px solid #f59e0b'
                    : 'none'
              }}
              title={`(${x},${y}) ${['Empty', 'Room', 'Corridor'][cell]}`}
            />
          ))
        )}

        {/* Wall overlays: absolutely positioned inside the grid container */}
        {walls.map((w, i) => {
          const px = w.x * cellSize + 2;
          const py = w.y * cellSize + 2;
          if (w.edge === 'N') return <div key={i} style={{ position: 'absolute', left: px, top: py - 1, width: cellSize, height: 2, background: '#ffffff' }} />;
          if (w.edge === 'S') return <div key={i} style={{ position: 'absolute', left: px, top: py + cellSize - 1, width: cellSize, height: 2, background: '#ffffff' }} />;
          if (w.edge === 'E') return <div key={i} style={{ position: 'absolute', left: px + cellSize - 1, top: py, width: 2, height: cellSize, background: '#ffffff' }} />;
          if (w.edge === 'W') return <div key={i} style={{ position: 'absolute', left: px - 1, top: py, width: 2, height: cellSize, background: '#ffffff' }} />;
          return null;
        })}
      </div>
    </div>
  );
}
