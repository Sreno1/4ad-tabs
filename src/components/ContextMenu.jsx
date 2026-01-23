import React, { useState, useRef, useEffect } from 'react';

export default function ContextMenu({ x, y, items = [], onClose }) {
  const [openKey, setOpenKey] = useState(null);
  const menuRef = useRef(null);
  const justOpenedRef = useRef(true);
  if (!items || items.length === 0) return null;

  // Clamp x/y to viewport
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const vw = window.innerWidth || 800;
  const vh = window.innerHeight || 600;
  const menuX = typeof x === 'number' && !isNaN(x) ? clamp(x, 0, vw - 200) : 100;
  const menuY = typeof y === 'number' && !isNaN(y) ? clamp(y, 0, vh - 200) : 100;

  useEffect(() => {
    justOpenedRef.current = true;
    // Reset the flag after a short delay
    const t = setTimeout(() => { justOpenedRef.current = false; }, 50);
    return () => clearTimeout(t);
  }, [x, y, menuX, menuY]);

  useEffect(() => {
    const handleMouseDown = (e) => {
      // Only close if click is outside the menu, left button, and not the first mousedown after open
      if (justOpenedRef.current) return;
      if (e.button !== 0) return; // Only left-click closes
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (typeof onClose === 'function') onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50"
      style={{
        left: menuX,
        top: menuY,
        minWidth: 180,
        background: 'rgba(30,30,30,0.98)',
        color: '#fff',
        pointerEvents: 'auto',
        zIndex: 99999,
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="bg-slate-800 border border-slate-700 rounded shadow-lg text-sm text-slate-200" role="menu">
        {items.map((it) => (
          <div key={it.key} className="">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (it.submenu) {
                  setOpenKey(openKey === it.key ? null : it.key);
                  return;
                }
                try { it.onClick && it.onClick(); } catch (err) {}
                onClose && onClose();
              }}
              className="w-full text-left px-3 py-2 hover:bg-slate-700 border-b border-slate-700 flex items-center justify-between"
            >
              <span>{it.label}</span>
              {it.submenu && <span className="text-slate-400 text-xs">▸</span>}
            </button>
            {it.submenu && openKey === it.key && (
              <div className="bg-slate-800">
                {it.submenu.map(sub => (
                  <button
                    key={sub.key}
                    onClick={(e) => { e.stopPropagation(); try { sub.onClick && sub.onClick(); } catch (err) {} onClose && onClose(); }}
                    className="w-full text-left px-6 py-2 hover:bg-slate-700 border-b border-slate-700 text-xs"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
