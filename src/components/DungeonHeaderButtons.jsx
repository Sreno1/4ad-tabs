import React from 'react';

export default function DungeonHeaderButtons({
  onShowRoomDesigner,
  onGenerateTile,
  onWandering,
  onCustomTile,
  onCustomMonster,
  onClearMap,
}) {
  // Apply a mild brightness boost to overcome the CRT vignette, and add a subtle glow
  // on each button to increase legibility without removing the vignette effect.
  // Slightly stronger brightness and glow to improve legibility
  const wrapperStyle = { filter: 'brightness(1.35) contrast(1.05)' };
  const buttonGlow = { boxShadow: '0 0 14px rgba(255,255,255,0.09), inset 0 0 6px rgba(255,255,255,0.03)' };

  return (
  <div id="dungeon_header_buttons" className="flex items-center gap-2 justify-center w-full" style={wrapperStyle}>
      <button
        id="dungeon_room_designer_button"
        onClick={onShowRoomDesigner}
        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded relative"
        style={buttonGlow}
        title="Open Room Designer"
        aria-label="Open Room Designer"
      >
  <img src="/assets/hammer.png" alt="Designer" className="h-4 w-auto inline" style={{ filter: 'brightness(1.25)' }} />
      </button>
      <button
        id="dungeon_generate_tile_button"
        onClick={onGenerateTile}
        className="text-xs bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-2 py-1 rounded relative"
        style={buttonGlow}
        title="Generate Tile"
      >
  Generate Tile
      </button>
      <button
        id="dungeon_custom_tile_button"
        onClick={onCustomTile}
        className="text-xs bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded relative"
        style={buttonGlow}
        title="Custom Tile"
      >
  Custom Tile
      </button>
  {/* Wandering and Custom Monster buttons moved to ActionPane under marching order */}
      <button
        id="dungeon_clear_map_button"
        onClick={onClearMap}
        className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded relative"
        style={buttonGlow}
        title="Clear the map"
      >
  <img src="/assets/clear.png" alt="Clear map" className="h-4 w-auto inline" style={{ filter: 'brightness(1.25)' }} />
      </button>
    </div>
  );
}
