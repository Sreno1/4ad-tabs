import React, { useEffect, useRef, useState } from 'react';
import { performStealthSave } from '../utils/gameActions/stealthActions.js';
import { selectParty } from '../state/selectors.js';

// Simple draggable party tracker overlay that can be moved inside a provided container
export default function PartyTracker({ state, dispatch, containerRef }) {
  const elRef = useRef(null);
  const draggingRef = useRef(false);
  const pointerOffsetRef = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState(() => {
    try {
      const raw = localStorage.getItem('partyTrackerPos');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { left: 12, top: 12 };
  });

  // Keep position saved
  useEffect(() => {
    try { localStorage.setItem('partyTrackerPos', JSON.stringify(pos)); } catch (e) {}
  }, [pos]);

  // Clamp helper
  const clampToContainer = (left, top) => {
    const container = containerRef?.current;
    const el = elRef.current;
    if (!container || !el) return { left, top };
    const rect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const maxLeft = Math.max(0, rect.width - elRect.width);
    const maxTop = Math.max(0, rect.height - elRect.height);
    return { left: Math.min(Math.max(0, left), maxLeft), top: Math.min(Math.max(0, top), maxTop) };
  };

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!draggingRef.current) return;
      const container = containerRef?.current;
      const el = elRef.current;
      if (!container || !el) return;
      const rect = container.getBoundingClientRect();
      const left = e.clientX - rect.left - pointerOffsetRef.current.x;
      const top = e.clientY - rect.top - pointerOffsetRef.current.y;
      setPos(prev => {
        const clamped = clampToContainer(left, top);
        // Only update when changed to avoid extra renders
        if (clamped.left === prev.left && clamped.top === prev.top) return prev;
        return clamped;
      });
    };

    const onPointerUp = () => {
      draggingRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    // Cleanup on unmount
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [containerRef]);

  const startDrag = (e) => {
    const el = elRef.current;
    const container = containerRef?.current;
    if (!el || !container) return;
    draggingRef.current = true;
    const rect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    pointerOffsetRef.current = { x: e.clientX - elRect.left, y: e.clientY - elRect.top };

    const onPointerMove = (ev) => {
      if (!draggingRef.current) return;
      const left = ev.clientX - rect.left - pointerOffsetRef.current.x;
      const top = ev.clientY - rect.top - pointerOffsetRef.current.y;
      const clamped = clampToContainer(left, top);
      setPos(prev => (clamped.left === prev.left && clamped.top === prev.top) ? prev : clamped);
    };

    const onPointerUp = () => {
      draggingRef.current = false;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Re-clamp on container resize
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    const ro = new ResizeObserver(() => setPos(prev => clampToContainer(prev.left, prev.top)));
    ro.observe(container);
    return () => ro.disconnect();
  }, [containerRef]);

  if (!state || !state.party) return null;

  const party = state.party || [];

  return (
    <div
      id="party_tracker"
      ref={elRef}
      role="dialog"
      aria-label="Party Tracker"
      style={{ position: 'absolute', left: pos.left, top: pos.top, zIndex: 60 }}
      className="bg-slate-800 border border-slate-700 rounded p-2 text-xs w-40 shadow-lg"
    >
      <div
        id="party_tracker_header"
        onPointerDown={startDrag}
        style={{ cursor: 'grab' }}
        className="flex items-center justify-between mb-1"
      >
        <div id="party_tracker_title" className="font-bold text-amber-400">Party</div>
        <div id="party_tracker_drag_handle" className="text-slate-400">☰</div>
      </div>
      <div id="party_tracker_list" className="space-y-1">
  {party.map((h, i) => (
          <div id={`party_tracker_hero_${i}`} key={h.id || i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div id={`party_tracker_hero_${i}_avatar`} className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-amber-300 font-bold">{(h.name||'H').slice(0,1)}</div>
              <div className="truncate">
                <div id={`party_tracker_hero_${i}_name`} className="text-amber-300 text-xs font-bold">{h.name}</div>
                <div id={`party_tracker_hero_${i}_info`} className="text-slate-400 text-[11px]">L{h.lvl} • {h.key}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div id={`party_tracker_hero_${i}_hp`} className="text-red-400 text-xs">{h.hp}/{h.maxHp}</div>
              <button
                title="Stealth Save"
                onClick={() => {
                  const foeLevelRaw = window.prompt('Enter foe level to Stealth against (e.g., 3):', '1');
                  const foeLevel = parseInt(foeLevelRaw, 10) || 1;
                  performStealthSave(dispatch, h, foeLevel, { environment: 'dungeon', applyTraits: true });
                }}
                className="bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 px-2 py-0.5 rounded"
              >
                🕶️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
