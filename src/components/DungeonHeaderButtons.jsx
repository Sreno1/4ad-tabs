import React from 'react';

export default function DungeonHeaderButtons({
  onShowRoomDesigner,
  onGenerateTile,
  onWandering,
  onCustomTile,
  onCustomMonster,
  onClearMap,
}) {
  return (
    <div id="dungeon_header_buttons" className="flex items-center gap-2">
      <button
        id="dungeon_room_designer_button"
        onClick={onShowRoomDesigner}
        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
        title="Open Room Designer"
      >
        Designer
      </button>
      <button
        id="dungeon_generate_tile_button"
        onClick={onGenerateTile}
        className="text-xs bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-2 py-1 rounded"
        title="Generate Tile"
      >
        Generate Tile
      </button>
      <button
        id="dungeon_wandering_button"
        onClick={onWandering}
        className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
        title="Roll Wandering Monster"
      >
        Wandering
      </button>
      <button
        id="dungeon_custom_tile_button"
        onClick={onCustomTile}
        className="text-xs bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded"
        title="Custom Tile"
      >
        Custom Tile
      </button>
      <button
        id="dungeon_custom_monster_button"
        onClick={onCustomMonster}
        className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
        title="Spawn Custom Monster"
      >
        Custom Monster
      </button>
      <button
        id="dungeon_clear_map_button"
        onClick={onClearMap}
        className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded"
        title="Clear the map"
      >
        Clear map
      </button>
    </div>
  );
}
