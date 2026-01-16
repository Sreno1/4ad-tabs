import React, { useEffect } from 'react';
import { Tooltip } from './RulesReference.jsx';
import MARKER_STYLES from '../constants/markerStyles.js';

// Full-circle radial layout: distribute items evenly around 360°
const getPosition = (index, total, radius = 96) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2; // start at top (-90°)
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
};

export default function RadialMenu({ x, y, items = [], onSelect, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!items || items.length === 0) return null;

  return (
    <div className="fixed z-50" style={{ left: x, top: y, transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }} onClick={(e) => { e.stopPropagation(); }}>
      <div className="relative w-0 h-0">
        {items.map((it, i) => {
          const pos = getPosition(i, items.length, 88);
          const styleDef = MARKER_STYLES[it.key] || { char: it.label[0], color: '#94a3b8' };
          return (
            <Tooltip key={it.key} text={it.label}>
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(it.key); }}
              className="absolute w-14 h-14 rounded-full bg-slate-700 hover:bg-amber-500 text-amber-400 hover:text-slate-900 font-bold text-sm shadow-lg transition-all duration-200 flex items-center justify-center border-2 border-slate-600 hover:border-amber-400"
              style={{
                transform: `translate(${pos.x - 28}px, ${pos.y - 28}px)`,
                animation: `fadeIn 0.18s ease-out ${i * 0.04}s both`,
                color: styleDef.color
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{styleDef.char}</span>
            </button>
            </Tooltip>
          );
        })}

        <Tooltip text="Close">
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute w-8 h-8 rounded-full bg-slate-700 text-slate-300 border border-slate-600 flex items-center justify-center"
          style={{ transform: `translate(-24px, -24px)` }}
        >×</button>
        </Tooltip>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(0,0) scale(0.5); }
          to { opacity: 1; transform: translate(0,0) scale(1); }
        }
      `}</style>
    </div>
  );
}
