import React, { useState } from "react";
import { CLASS_ICONS } from "../data/classIcons.js";
import { CLASSES } from "../data/classes.js";
import { Tooltip } from './RulesReference.jsx';

/**
 * MarchingOrder - 2x2 grid showing party formation
 * Positions are numbered 1-4 clockwise from top-left:
 *   [1] [2]
 *   [4] [3]
 *
 * Click a hero to select them as active hero for dungeon features.
 */
import { setMarchingOrder } from '../state/actionCreators.js';

export default function MarchingOrder({ state, selectedHero, onSelectHero, dispatch }) {
  const [draggingHeroIdx, setDraggingHeroIdx] = useState(null);
  const [dragOverPos, setDragOverPos] = useState(null);
  // visualOrder is used to render tiles shifting while dragging
  const computeVisualOrder = () => {
    const base = Array.isArray(state.marchingOrder) ? [...state.marchingOrder] : [0,1,2,3];
    if (draggingHeroIdx === null) return base;
    const from = base.findIndex(i => i === draggingHeroIdx);
    // remove the dragging hero
    const without = base.filter(i => i !== draggingHeroIdx);
    // if no dragOverPos, keep original order with hero removed
    if (dragOverPos === null) return without;
    // insert hero at dragOverPos
    const to = Math.max(0, Math.min(3, dragOverPos));
    const withInserted = [...without.slice(0, to), draggingHeroIdx, ...without.slice(to)];
    // ensure length 4
    while (withInserted.length < 4) withInserted.push(null);
    return withInserted;
  };
  const visualOrder = computeVisualOrder();
  // Get hero at each position (positions: 0=top-left, 1=top-right, 2=bottom-right, 3=bottom-left)
  const getHeroAtPosition = (position) => {
    const heroIdx = visualOrder?.[position] ?? state.marchingOrder?.[position];
    if (heroIdx === null || heroIdx === undefined) return null;
    return { hero: state.party[heroIdx] || null, heroIdx };
  };

  const renderCell = (position) => {
    const result = getHeroAtPosition(position);


      if (!result?.hero) {
      const isOver = dragOverPos === position;
      return (
        <div
          className={`flex items-center gap-2 p-2 rounded border border-slate-600/30 w-full transform-gpu will-change-transform transition-transform duration-150 ease-in-out ${isOver ? 'ring-2 ring-sky-400 bg-sky-900/20 scale-105' : 'bg-slate-700/50'}`} 
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverPos(position); }}
          onDragEnter={(e) => { e.preventDefault(); setDragOverPos(position); }}
          onDragLeave={() => { setDragOverPos(prev => (prev === position ? null : prev)); }}
          onDrop={(e) => {
            e.preventDefault();
            const heroIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
            setDragOverPos(null);
            setDraggingHeroIdx(null);
            if (!Number.isNaN(heroIdx) && dispatch) dispatch(setMarchingOrder(position, heroIdx));
          }}
        >
          <div className="w-10 h-10 rounded relative flex items-center justify-center bg-slate-600/30">
            <span className="relative z-10 font-bold font-mono text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontSize: 12, lineHeight: 1, whiteSpace: 'nowrap', padding: '0 2px', letterSpacing: '-0.5px' }}>
              —/—
            </span>
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

  const isOver = dragOverPos === position;
  const dragging = draggingHeroIdx !== null;
    return (
  <button
        draggable={isAlive}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(heroIdx));
          setDraggingHeroIdx(heroIdx);
        }}
        onDragEnd={() => { setDraggingHeroIdx(null); setDragOverPos(null); }}
  onDragOver={(e) => { /* allow dropping onto occupied slot to swap */ e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverPos(position); }}
  onDragEnter={(e) => { e.preventDefault(); setDragOverPos(position); }}
  onDragLeave={() => { setDragOverPos(prev => (prev === position ? null : prev)); }}
        onDrop={(e) => {
          e.preventDefault();
          const draggedHeroIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
          setDragOverPos(null);
          setDraggingHeroIdx(null);
          if (!Number.isNaN(draggedHeroIdx) && dispatch) dispatch(setMarchingOrder(position, draggedHeroIdx));
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isAlive && onSelectHero) {
            onSelectHero(heroIdx);
          }
        }}
        disabled={!isAlive}
        className={`flex items-center gap-2 p-2 rounded border-2 transform-gpu will-change-transform transition-transform duration-150 ease-in-out ${
          isSelected
            ? "border-amber-400 bg-amber-900/20"
            : isAlive
              ? "border-slate-600 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-700"
              : "border-red-800/50 bg-slate-800/50 cursor-not-allowed"
  } ${isOver ? 'ring-2 ring-sky-400 bg-sky-900/20 scale-105' : ''}`}
        style={{
          ...(isSelected ? { outline: '3px solid rgba(251,191,36,0.9)', boxShadow: '0 0 8px rgba(251,191,36,0.45)'} : undefined),
          ...(dragging && draggingHeroIdx === heroIdx ? { opacity: 0.5, transform: 'scale(0.98)' } : undefined),
          transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease'
        }}
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
            className={`relative z-10 font-bold font-mono ${
              isAlive ? "text-white" : "text-red-400 line-through"
            }`}
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)", fontSize: 12, lineHeight: 1, whiteSpace: 'nowrap', padding: '0 2px', letterSpacing: '-0.5px' }}
          >
            {`${hero.hp}/${hero.maxHp}`}
          </span>

          {!isAlive && (
            <span className="absolute bottom-0 right-0 text-[8px]"></span>
          )}
          {/* no position badges - show only HP */}
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
  <Tooltip text="Marching Order - Click to select active hero, drag to change order.">
  <div className="grid grid-cols-1 gap-2 w-full">
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
    </Tooltip>
  );
}
