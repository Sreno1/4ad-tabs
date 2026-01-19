import React, { useState } from 'react';

export default function ContextMenu({ x, y, items = [], onClose }) {
  const [openKey, setOpenKey] = useState(null);
  if (!items || items.length === 0) return null;

  React.useEffect(() => {
    const handle = (e) => {
      if (typeof onClose === 'function') onClose();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('contextmenu', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('contextmenu', handle);
    };
  }, [onClose]);

  return (
    <div className="fixed z-50" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
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
