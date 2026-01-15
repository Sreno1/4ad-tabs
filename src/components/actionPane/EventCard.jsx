import React from 'react';
import { EVENT_TYPES } from '../../constants/gameConstants.js';

export default function EventCard({ event, index }) {
  switch (event.type) {
    case EVENT_TYPES.TILE_GENERATED:
      return (
        <div key={index} className="bg-slate-700/50 rounded p-2 text-xs border-l-2 border-blue-400">
          <div className="text-blue-400 font-bold">📐 Tile Generated</div>
          <div className="text-slate-300">{event.data.shape?.description}</div>
          <div className="text-slate-400">Doors: {event.data.shape?.doors}</div>
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
          <div className="text-slate-300">Check the log for details.</div>
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

    case EVENT_TYPES.MONSTER:
      return (
        <div key={index} className={`rounded p-2 text-xs border-l-2 ${
          event.data.isBoss ? 'bg-red-900/30 border-red-400' : 'bg-orange-900/30 border-orange-400'
        }`}>
          <div className={`font-bold ${event.data.isBoss ? 'text-red-400' : 'text-orange-400'}`}>
            {event.data.isBoss ? '👑 BOSS APPEARS!' : `⚔️ ${event.data.monsterType} (L${event.data.level})`}
          </div>
          {event.data.isBoss && (
            <div className="text-red-300">+1 Life, +1 Attack, 3× Treasure!</div>
          )}
        </div>
      );

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
}
