import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE } from '../data/rooms.js';
import { MONSTER_TABLE, MONSTER_CATEGORIES, getAllMonsters } from '../data/monsters.js';

/**
 * CustomTileModal - Styled modal for manual tile generation
 *
 * Allows players rolling physical dice to input their results:
 * - d66 for tile shape
 * - 2d6 for contents
 * - If contents require a monster, which specific monster
 */
export default function CustomTileModal({ isOpen, onClose, onGenerate, currentEnvironment = 'dungeon' }) {
  const [d66Value, setD66Value] = useState('');
  const [twoD6Value, setTwoD6Value] = useState('');
  const [selectedMonster, setSelectedMonster] = useState('');

  // Valid d66 values (from TILE_SHAPE_TABLE)
  const validD66Values = useMemo(() => Object.keys(TILE_SHAPE_TABLE).map(Number).sort((a, b) => a - b), []);

  // Get contents description for the selected 2d6 value
  const contentsInfo = useMemo(() => {
    if (!twoD6Value) return null;
    const roll = parseInt(twoD6Value);
    const contents = TILE_CONTENTS_TABLE[roll];
    if (!contents) return null;

    // Determine if this is corridor or room based on d66
    const shapeRoll = parseInt(d66Value);
    const shape = TILE_SHAPE_TABLE[shapeRoll];
    const isCorridor = shape?.type === 'corridor';

    return {
      ...contents,
      description: isCorridor ? contents.corridorDescription : contents.roomDescription,
      isCorridor,
      // Check if this content type spawns monsters
      needsMonster: ['vermin', 'minions', 'weird_monster', 'major_foe', 'dragon'].includes(contents.type) ||
        (contents.roomType && ['vermin', 'minions', 'weird_monster', 'major_foe', 'dragon'].includes(contents.roomType))
    };
  }, [twoD6Value, d66Value]);

  // Get available monsters based on content type and environment
  const availableMonsters = useMemo(() => {
    if (!contentsInfo?.needsMonster) return [];

    // Map environment to category prefixes
    const envPrefix = currentEnvironment === 'caverns' ? 'caverns' :
                      currentEnvironment === 'fungal_grottoes' ? 'fungal' : 'dungeon';

    // Determine which monster category based on contents type
    let categoryFilter;
    const contentType = contentsInfo.type === 'empty' ? contentsInfo.roomType : contentsInfo.type;

    switch (contentType) {
      case 'vermin':
        categoryFilter = `${envPrefix}Vermin`;
        break;
      case 'minions':
        categoryFilter = `${envPrefix}Minions`;
        break;
      case 'weird_monster':
        categoryFilter = `${envPrefix}Weird`;
        break;
      case 'major_foe':
      case 'dragon':
        categoryFilter = `${envPrefix}Boss`;
        break;
      default:
        return [];
    }

    const monsters = getAllMonsters().filter(m => m.category === categoryFilter);
    return monsters;
  }, [contentsInfo, currentEnvironment]);

  const handleGenerate = () => {
    const shapeRoll = parseInt(d66Value);
    const contentsRoll = parseInt(twoD6Value);

    if (isNaN(shapeRoll) || !TILE_SHAPE_TABLE[shapeRoll]) {
      return;
    }
    if (isNaN(contentsRoll) || contentsRoll < 2 || contentsRoll > 12) {
      return;
    }

    onGenerate({
      shapeRoll,
      contentsRoll,
      monsterKey: selectedMonster || undefined
    });

    // Reset form
    setD66Value('');
    setTwoD6Value('');
    setSelectedMonster('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-md border-2 border-amber-500/50 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-amber-400">Custom Tile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <p className="text-slate-400 text-sm">
            Enter your physical dice rolls to generate a tile.
          </p>

          {/* d66 Input */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              d66 - Tile Shape
            </label>
            <select
              value={d66Value}
              onChange={(e) => setD66Value(e.target.value)}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Select d66 result --</option>
              {validD66Values.map(val => {
                const shape = TILE_SHAPE_TABLE[val];
                return (
                  <option key={val} value={val}>
                    {val} - {shape?.type === 'corridor' ? 'Corridor' : 'Room'}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 2d6 Input */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">
              2d6 - Contents
            </label>
            <select
              value={twoD6Value}
              onChange={(e) => {
                setTwoD6Value(e.target.value);
                setSelectedMonster(''); // Reset monster when contents change
              }}
              className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-amber-500 focus:outline-none"
            >
              <option value="">-- Select 2d6 result --</option>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(val => {
                const contents = TILE_CONTENTS_TABLE[val];
                // Show room description for now; will update based on d66
                const desc = contents?.roomDescription || contents?.description || '';
                return (
                  <option key={val} value={val}>
                    {val} - {desc.substring(0, 50)}{desc.length > 50 ? '...' : ''}
                  </option>
                );
              })}
            </select>
            {contentsInfo && (
              <div className="mt-2 text-sm text-slate-400 bg-slate-700/50 rounded p-2">
                {contentsInfo.description}
              </div>
            )}
          </div>

          {/* Monster Selection (if applicable) */}
          {contentsInfo?.needsMonster && availableMonsters.length > 0 && (
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1">
                Monster (optional - leave blank for random)
              </label>
              <select
                value={selectedMonster}
                onChange={(e) => setSelectedMonster(e.target.value)}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Random from table --</option>
                {availableMonsters.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.name} (T{m.tier}, {m.xp}XP)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!d66Value || !twoD6Value}
            className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 text-white px-4 py-2 rounded font-medium"
          >
            Generate Tile
          </button>
        </div>
      </div>
    </div>
  );
}
