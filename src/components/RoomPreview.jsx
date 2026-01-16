import React, { useMemo } from 'react';

/**
 * RoomPreview - Renders a compact thumbnail of a room template
 * Shows grid layout with rooms (filled), corridors (lines), and doors
 */
export default function RoomPreview({ grid, doors, cellSize = 20 }) {
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
      {/* Mini grid preview */}
      <div
        className="bg-slate-900 border border-slate-600 rounded"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gap: '1px',
          padding: '2px'
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
                borderRight:
                  doors.some(
                    (d) => d.x === x && d.y === y && d.edge === 'E'
                  ) && x < width - 1
                    ? '1px solid amber'
                    : 'none',
                borderBottom:
                  doors.some(
                    (d) => d.x === x && d.y === y && d.edge === 'S'
                  ) && y < height - 1
                    ? '1px solid amber'
                    : 'none'
              }}
              title={`(${x},${y}) ${['Empty', 'Room', 'Corridor'][cell]}`}
            />
          ))
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-slate-400 grid grid-cols-3 gap-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded" />
          <span>{stats.rooms}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-slate-600 rounded" />
          <span>{stats.corridors}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-400">🚪</span>
          <span>{doors.length}</span>
        </div>
      </div>
    </div>
  );
}
