import React from 'react';
import { CLASS_ICONS } from '../data/classIcons.js';

/**
 * MarchingOrder - 2x2 grid showing party formation
 * Positions are numbered 1-4 clockwise from top-left:
 *   [1] [2]
 *   [4] [3]
 * 
 * Click a hero to select them as active hero for dungeon features.
 */
export default function MarchingOrder({ state, selectedHero, onSelectHero }) {
  // Get hero at each position (positions: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left)
  const getHeroAtPosition = (position) => {
    const heroIdx = state.marchingOrder?.[position];
    if (heroIdx === null || heroIdx === undefined) return null;
    return { hero: state.party[heroIdx] || null, heroIdx };
  };

  const renderCell = (position) => {
    const result = getHeroAtPosition(position);
    const positionNumber = position + 1;
    
    if (!result?.hero) {
      return (
        <div 
          className="w-8 h-8 bg-slate-700/50 rounded flex items-center justify-center text-slate-600 text-xs border border-slate-600/30"
          title={`Position ${positionNumber} - Empty`}
        >
          {positionNumber}
        </div>
      );
    }

    const { hero, heroIdx } = result;
    const icon = CLASS_ICONS[hero.key] || CLASS_ICONS.warrior;
    const isAlive = hero.hp > 0;
    const isSelected = selectedHero === heroIdx;
    
    return (
      <button 
        onClick={() => isAlive && onSelectHero && onSelectHero(heroIdx)}
        disabled={!isAlive}
        className={`w-8 h-8 rounded flex items-center justify-center relative overflow-hidden border-2 transition-all ${
          isSelected 
            ? 'border-amber-400 ring-1 ring-amber-400/50' 
            : isAlive 
              ? 'border-slate-500/50 hover:border-slate-400' 
              : 'border-red-800/50 cursor-not-allowed'
        }`}
        style={{ backgroundColor: isAlive ? `${icon.color}33` : '#1e1e1e' }}
        title={`${isSelected ? '★ ' : ''}Position ${positionNumber}: ${hero.name} (${hero.key}) - ${hero.hp}/${hero.maxHp} HP${isAlive ? ' - Click to select' : ' - Dead'}`}
      >
        {/* Background class icon */}
        <svg 
          viewBox="0 0 512 512" 
          className="absolute w-6 h-6 opacity-30"
          style={{ color: isAlive ? icon.color : '#666' }}
        >
          <path fill="currentColor" d={icon.path} />
        </svg>
        
        {/* Hero initial */}
        <span 
          className={`relative z-10 font-bold text-sm ${
            isAlive ? 'text-white' : 'text-red-400 line-through'
          }`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {hero.name.charAt(0).toUpperCase()}
        </span>
        
        {/* Selected indicator */}
        {isSelected && isAlive && (
          <span className="absolute -top-0.5 -right-0.5 text-[8px] text-amber-400">★</span>
        )}
        
        {/* Dead indicator */}
        {!isAlive && (
          <span className="absolute bottom-0 right-0 text-[8px]">💀</span>
        )}
      </button>
    );
  };

  return (
    <div 
      className="grid grid-cols-2 gap-0.5 p-0.5 bg-slate-800 rounded"
      title="Marching Order - Click to select active hero"
    >
      {/* Position 1 (top-left) */}
      {renderCell(0)}
      {/* Position 2 (top-right) */}
      {renderCell(1)}
      {/* Position 4 (bottom-left) - note: clockwise means 4 is here */}
      {renderCell(3)}
      {/* Position 3 (bottom-right) */}
      {renderCell(2)}
    </div>
  );
}
