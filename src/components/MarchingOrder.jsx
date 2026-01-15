import React from "react";
import { CLASS_ICONS } from "../data/classIcons.js";
import { CLASSES } from "../data/classes.js";

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
          className="flex items-center gap-2 p-2 bg-slate-700/50 rounded border border-slate-600/30"
          title={`Position ${positionNumber} - Empty`}
        >
          <div className="w-10 h-10 rounded flex items-center justify-center text-slate-600 text-xs bg-slate-600/30">
            {positionNumber}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500">Empty</div>
          </div>
        </div>
      );
    }

    const { hero, heroIdx } = result;
    const icon = CLASS_ICONS[hero.key] || CLASS_ICONS.warrior;
    const className = CLASSES[hero.key]?.name || hero.key;
    const isAlive = hero.hp > 0;
    const isSelected = selectedHero === heroIdx;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isAlive && onSelectHero) {
            onSelectHero(heroIdx);
          }
        }}
        disabled={!isAlive}
        className={`flex items-center gap-2 p-2 rounded border-2 transition-all ${
          isSelected
            ? "border-amber-400 bg-amber-900/20"
            : isAlive
              ? "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700"
              : "border-red-800/50 bg-slate-800/50 cursor-not-allowed"
        }`}
        title={`${isSelected ? "★ " : ""}${hero.name} - ${className} - ${hero.hp}/${hero.maxHp} HP${isAlive ? " - Click to select" : " - Dead"}`}
      >
        {/* Class icon */}
        <div
          className="w-10 h-10 rounded flex items-center justify-center relative overflow-hidden flex-shrink-0"
          style={{ backgroundColor: isAlive ? `${icon.color}33` : "#1e1e1e" }}
        >
          <svg
            viewBox="0 0 512 512"
            className="absolute w-7 h-7 opacity-30"
            style={{ color: isAlive ? icon.color : "#666" }}
          >
            <path fill="currentColor" d={icon.path} />
          </svg>

          <span
            className={`relative z-10 font-bold text-sm ${
              isAlive ? "text-white" : "text-red-400 line-through"
            }`}
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
          >
            {hero.name.charAt(0).toUpperCase()}
          </span>

          {!isAlive && (
            <span className="absolute bottom-0 right-0 text-[8px]">💀</span>
          )}
        </div>

        {/* Hero info */}
        <div className="flex-1 min-w-0 text-left">
          <div
            className={`font-semibold text-sm truncate ${
              isAlive ? "text-white" : "text-red-400 line-through"
            }`}
          >
            {hero.name}
          </div>
          <div
            className={`text-xs truncate ${
              isAlive ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {className}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="grid grid-cols-1 gap-2"
      title="Marching Order - Click to select active hero"
    >
      {/* Row 1: Positions 1 & 2 */}
      <div className="grid grid-cols-2 gap-2">
        {renderCell(0)}
        {renderCell(1)}
      </div>

      {/* Row 2: Positions 4 & 3 */}
      <div className="grid grid-cols-2 gap-2">
        {renderCell(3)}
        {renderCell(2)}
      </div>
    </div>
  );
}
