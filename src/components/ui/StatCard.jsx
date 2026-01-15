// StatCard.jsx
import React from 'react';

/**
 * StatCard - Reusable stat display card for Party, Combat, Analytics, etc.
 * Variants: default, highlight, danger
 * Usage: <StatCard label="HP" value={12} icon={<HeartIcon />} variant="danger" />
 */
export function StatCard({ label, value, icon, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-800',
    highlight: 'bg-blue-900/30 ring-1 ring-blue-400',
    danger: 'bg-red-900/30 ring-1 ring-red-400',
  };

  return (
    <div className={`${variants[variant]} rounded p-2`} data-card="stat">
      <div className="text-slate-400 text-xs">{label}</div>
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-white font-bold text-lg">{value}</div>
      </div>
    </div>
  );
}

export default StatCard;
