import React from 'react';
import { Sword, Map, Users, Scroll, TrendingUp } from 'lucide-react';

const tabs = [
  { id: 'party', icon: Users, label: 'Party' },
  { id: 'dungeon', icon: Map, label: 'Dungeon' },
  { id: 'combat', icon: Sword, label: 'Combat' },
  { id: 'analytics', icon: TrendingUp, label: 'Stats' },
  { id: 'story', icon: Scroll, label: 'Story' }
];

export default function MobileNavigation({ activeTab, onTabChange }) {
  return (
    <nav
      id="app_nav"
      className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex md:hidden"
      aria-label="Main navigation"
    >
      {tabs.map(t => (
        <button
          key={t.id}
          id={`nav_${t.id}_tab`}
          onClick={() => onTabChange(t.id)}
          className={`flex-1 py-3 flex flex-col items-center gap-1 ${activeTab === t.id ? 'text-amber-400' : 'text-slate-500'}`}
          aria-label={t.label}
          aria-current={activeTab === t.id ? 'page' : undefined}
          data-tab={t.id}
        >
          <t.icon id={`nav_${t.id}_tab_icon`} size={18} aria-hidden="true" />
          <span id={`nav_${t.id}_tab_label`} className="text-xs">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
