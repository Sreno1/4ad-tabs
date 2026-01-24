import React from 'react';

// Small wrapper for header counters so styling (including border) can be changed in one place.
export default function HeaderCounter({ children, className = '', noBorder = true }) {
  // default classes match previous containers; avoid using the bg-slate-* class here because
  // a global `body.roguelike .bg-slate-*` rule adds a CRT border via !important. Use an
  // inline backgroundColor so that selector no longer matches.
  const base = 'flex items-center gap-1 px-3 py-1 rounded';
  const borderClass = noBorder ? 'border border-transparent ring-0 focus:ring-0 focus:outline-none outline-none shadow-none' : '';
  return (
    <div
      className={`${base} ${borderClass} ${className}`.trim()
      }
      style={{ backgroundColor: '#1e293b' }}
    >
      {children}
    </div>
  );
}
