import React, { memo } from 'react';
import { EVENT_TYPES } from '../../constants/gameConstants.js';

const EventCard = memo(function EventCard({ event, index }) {
  switch (event.type) {
    case 'D66_ROLL':
      return (
        <div key={index} className="bg-blue-900/30 rounded p-2 text-xs border-l-2 border-blue-400">
          <div className="text-blue-400 font-bold">d66 {event.data.roll}</div>
        </div>
      );

    case 'LIBRARY_MATCH':
      // Library matches are handled via auto-placed templates; do not render a duplicate event card
      return null;

    case 'CONTENTS_ROLL':
      return (
        <div key={index} className="bg-amber-900/30 rounded p-2 text-xs border-l-2 border-amber-400">
          <div className="text-amber-400 font-bold">2d6 {event.data.roll}</div>
          <div className="text-slate-300">{event.data.description}</div>
        </div>
      );

    case EVENT_TYPES.TILE_GENERATED:
      return (
        <div key={index} className="bg-slate-700/50 rounded p-2 text-xs border-l-2 border-blue-400">
          <div className="text-blue-400 font-bold">Tile Generated</div>
          <div className="text-slate-300">Type: {event.data.type || (event.data.shape && event.data.shape.type) || 'Unknown'}</div>
        </div>
      );

    case EVENT_TYPES.EMPTY:
      return (
        <div key={index} className="bg-slate-700/50 rounded p-2 text-xs border-l-2 border-slate-400">
          <div className="text-slate-400 font-bold">📦 Room Empty</div>
          <div className="text-slate-300">You may search for hidden features.</div>
        </div>
      );

    case EVENT_TYPES.TREASURE:
      return (
        <div key={index} className="bg-amber-900/30 rounded p-2 text-xs border-l-2 border-amber-400">
          <div className="text-amber-400 font-bold">💰 Treasure Found!</div>
        </div>
      );

    case EVENT_TYPES.SPECIAL:
      return (
        <div key={index} className="bg-purple-900/30 rounded p-2 text-xs border-l-2 border-purple-400">
          <div className="text-purple-400 font-bold">✨ {event.data.special?.name}</div>
          <div className="text-slate-300">{event.data.special?.description}</div>
          {event.data.special?.requiresGold && (
            <div className="text-amber-400">💰 Requires {event.data.special.requiresGold} gold</div>
          )}
        </div>
      );

    case EVENT_TYPES.SPECIAL_EVENT:
      return (
        <div key={index} className="bg-purple-900/30 rounded p-2 text-xs border-l-2 border-purple-400">
          <div className="text-purple-400 font-bold">✨ {event.data.event?.name || 'Special Event'}</div>
          <div className="text-slate-300">{event.data.event?.description}</div>
        </div>
      );

    case EVENT_TYPES.MONSTER: {
      // Build suffix text from monster payload when available: " - xLy type"
      let suffix = '';
      const m = event.data.monster;
      if (m) {
        const count = m.count || m.initialCount || null;
        const lvl = m.level || m.lvl || event.data.level || null;
        const typeName = event.data.monsterType || m.type || m.name || '';
        if (m.isMinorFoe && count) {
          suffix = ` - ${count}L${lvl} ${typeName}`;
        } else if (event.data.isBoss || m.isBoss) {
          suffix = lvl ? ` - L${lvl} Boss` : ` - Boss`;
        } else if (lvl) {
          suffix = ` - L${lvl} ${typeName}`;
        }
      } else {
        // Fallback when monster object isn't present
        if (event.data.isBoss && event.data.level) suffix = ` - L${event.data.level} Boss`;
        else if (event.data.level && event.data.monsterType) suffix = ` - L${event.data.level} ${event.data.monsterType}`;
      }

      return (
        <div key={index} className={`rounded p-2 text-xs border-l-2 ${
          event.data.isBoss ? 'bg-red-900/30 border-red-400' : 'bg-orange-900/30 border-orange-400'
        }`}>
          <div className={`font-bold ${event.data.isBoss ? 'text-red-400' : 'text-orange-400'}`}>
            {event.data.isBoss ? '👑 BOSS APPEARS!' : `⚔️ ${event.data.monsterType || (m && m.name) || 'Monster'} (L${event.data.level || (m && (m.level || m.lvl)) || '?'})`}{suffix}
          </div>
          {event.data.isBoss && (
            <div className="text-red-300">+1 Life, +1 Attack, 3× Treasure!</div>
          )}
        </div>
      );
    }

    case EVENT_TYPES.BOSS_CHECK:
      return (
        <div key={index} className={`rounded p-2 text-xs border-l-2 ${
          event.data.isBoss ? 'bg-red-900/50 border-red-500' : 'bg-slate-700/50 border-slate-400'
        }`}>
          <div className={`font-bold ${event.data.isBoss ? 'text-red-400' : 'text-slate-400'}`}>
            🎲 Boss Check: {event.data.message}
          </div>
        </div>
      );

    case EVENT_TYPES.WEIRD:
      return (
        <div key={index} className="bg-purple-900/30 rounded p-2 text-xs border-l-2 border-purple-400">
          <div className="text-purple-400 font-bold">👾 Weird Monster!</div>
          <div className="text-slate-300">Roll on the Weird Monster table in the rulebook.</div>
        </div>
      );

    case EVENT_TYPES.QUEST:
      return (
        <div key={index} className="bg-amber-900/30 rounded p-2 text-xs border-l-2 border-amber-500">
          <div className="text-amber-400 font-bold">🏆 Quest Room!</div>
          <div className="text-slate-300">The dungeon's objective is here!</div>
        </div>
      );

    case EVENT_TYPES.SEARCH:
      return (
        <div key={index} className="bg-cyan-900/30 rounded p-2 text-xs border-l-2 border-cyan-400">
          <div className="text-cyan-400 font-bold">🔍 Searched</div>
          <div className="text-slate-300">{event.data.result || 'Nothing found.'}</div>
        </div>
      );

    case 'REACTION':
      return (
        <div key={index} className={`rounded p-2 text-xs border-l-2 ${
          event.data.reaction?.hostile === true ? 'bg-red-900/30 border-red-400' :
          event.data.reaction?.hostile === false ? 'bg-green-900/30 border-green-400' :
          'bg-yellow-900/30 border-yellow-400'
        }`}>
          <div className={`font-bold ${
            event.data.reaction?.hostile === true ? 'text-red-400' :
            event.data.reaction?.hostile === false ? 'text-green-400' :
            'text-yellow-400'
          }`}>
            🎲 {event.data.monster}: {event.data.reaction?.name}
          </div>
          <div className="text-slate-300 text-xs">{event.data.reaction?.description}</div>
        </div>
      );

    case 'VICTORY':
      return (
        <div key={index} className="bg-green-900/30 rounded p-2 text-xs border-l-2 border-green-400">
          <div className="text-green-400 font-bold">🎉 Victory!</div>
          <div className="text-slate-300">Combat won! Roll for treasure.</div>
        </div>
      );

    default:
      return null;
  }
});

export default EventCard;
