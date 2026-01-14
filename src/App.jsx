import React, { useState, useReducer } from 'react';
import { Sword, Shield, Heart, Scroll, Map, Users, Package, Plus, X, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

// Dice utilities
const roll = (n, sides = 6, mod = 0) => { let t = 0; for (let i = 0; i < n; i++) t += Math.floor(Math.random() * sides) + 1; return t + mod; };
const d6 = () => roll(1);
const d66 = () => d6() * 10 + d6();
const r2d6 = () => d6() + d6();

// Classes
const CLASSES = {
  warrior: { name: 'Warrior', atk: '+L', def: '0', life: 6, sp: 'All weapons/armor' },
  cleric: { name: 'Cleric', atk: '+½L (+L undead)', def: '0', life: 4, sp: 'Heal×3, Bless×3' },
  rogue: { name: 'Rogue', atk: '+L outnumbered', def: '+L', life: 3, sp: 'Traps+L' },
  wizard: { name: 'Wizard', atk: '+L spells', def: '0', life: 2, sp: 'L+2 slots' },
  barbarian: { name: 'Barbarian', atk: '+L', def: '0', life: 7, sp: 'Rage, no magic' },
  halfling: { name: 'Halfling', atk: '+L sling', def: '+L large', life: 3, sp: 'L+1 Luck' },
  dwarf: { name: 'Dwarf', atk: '+L melee', def: '+1 large', life: 5, sp: 'Gold sense' },
  elf: { name: 'Elf', atk: '+L (not 2H)', def: '0', life: 4, sp: 'L spells' }
};

// Tiles - corridors are 11-16, 51-52
const TILES = {
  11:'Cor 4×1',12:'Cor 6×1',13:'Cor L-bend',14:'Cor L-bend',15:'Cor T-junc',16:'Cor 4-way',
  21:'Rm 2×2',22:'Rm 2×2',23:'Rm 2×2+alc',24:'Rm 3×2',25:'Rm 3×3',26:'Rm 3×3+alc',
  31:'Rm 4×2',32:'Rm 4×3',33:'Rm 4×3 L',34:'Rm 4×4',35:'Rm 4×4 pil',36:'Rm 5×4',
  41:'Rm 3×3 rnd',42:'Rm 4×4 rnd',43:'Rm 6×4',44:'Rm 6×4 div',45:'Rm 6×6',46:'Rm 6×6 pil',
  51:'Cor 8×1',52:'Cor stairs',53:'Rm 2×4',54:'Rm 3×5',55:'Rm T-shape',56:'Rm 5×5',
  61:'Rm+cor',62:'Rm 4×3+cor',63:'Rm irreg',64:'Rm+alc',65:'Rm 6×5',66:'Hall 8×6'
};
const isCorridor = (t) => [11,12,13,14,15,16,51,52].includes(t);

// 2d6 Content table
const CONTENT = {
  2:'Treasure→Treasure Tbl',3:'Trap+Treasure→Trap then Treasure Tbl',
  4:'Cor:Empty|Rm:Special Events Tbl',5:'Empty+Special Feature Tbl',
  6:'Vermin→Vermin Tbl',7:'Minions→Minions Tbl',8:'Cor:Empty|Rm:Minions Tbl',
  9:'Empty (2 Clues=Secret Passage)',10:'Cor:Empty|Rm:Weird Monster Tbl',
  11:'Boss→Boss Tbl',12:'Cor:Empty|Rm:Dragon Lair'
};

// State
const init = { party: [], gold: 0, hcl: 1, rooms: [], log: [], minorEnc: 0, majorFoes: 0, finalBoss: false, clues: 0 };

function reducer(s, a) {
  switch (a.type) {
    case 'ADD_HERO': return s.party.length >= 4 ? s : { ...s, party: [...s.party, a.h], hcl: Math.max(s.hcl, a.h.lvl) };
    case 'DEL_HERO': { const p = s.party.filter((_, i) => i !== a.i); return { ...s, party: p, hcl: p.length ? Math.max(...p.map(x => x.lvl)) : 1 }; }
    case 'UPD_HERO': return { ...s, party: s.party.map((h, i) => i === a.i ? { ...h, ...a.u } : h), hcl: Math.max(...s.party.map((h, i) => i === a.i ? (a.u.lvl || h.lvl) : h.lvl)) };
    case 'GOLD': return { ...s, gold: Math.max(0, s.gold + a.n) };
    case 'ROOM': return { ...s, rooms: [...s.rooms, a.r], cur: a.r };
    case 'LOG': return { ...s, log: [a.t, ...s.log].slice(0, 80) };
    case 'MINOR': return { ...s, minorEnc: s.minorEnc + 1 };
    case 'MAJOR': return { ...s, majorFoes: s.majorFoes + 1 };
    case 'BOSS': return { ...s, finalBoss: true };
    case 'CLUE': return { ...s, clues: s.clues + a.n };
    case 'RESET': return init;
    default: return s;
  }
}

// Components
function Dice() {
  const [r, setR] = useState(null);
  return (
    <div className="bg-slate-800 rounded p-2 flex gap-2 items-center">
      {['d6', '2d6', 'd66'].map(t => (
        <button key={t} onClick={() => setR({ v: t === 'd66' ? d66() : t === '2d6' ? r2d6() : d6(), t })} className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-sm font-bold">{t}</button>
      ))}
      {r && <span className="ml-auto text-amber-400 font-bold text-xl">{r.v}<span className="text-xs text-slate-400 ml-1">({r.t})</span></span>}
    </div>
  );
}

function Party({ s, d }) {
  const [show, setShow] = useState(false);
  const add = k => { const c = CLASSES[k]; d({ type: 'ADD_HERO', h: { name: c.name, key: k, lvl: 1, hp: c.life + 1, maxHp: c.life + 1 } }); setShow(false); };
  const lvl = (i, delta) => { const h = s.party[i], nL = Math.max(1, Math.min(5, h.lvl + delta)), nM = CLASSES[h.key].life + nL; d({ type: 'UPD_HERO', i, u: { lvl: nL, maxHp: nM, hp: Math.min(h.hp, nM) } }); };
  
  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-amber-400">Party ({s.party.length}/4) · HCL {s.hcl}</span>
        {s.party.length < 4 && <button onClick={() => setShow(!show)} className="bg-amber-600 px-2 py-1 rounded text-sm"><Plus size={14} /></button>}
      </div>
      
      {show && <div className="grid grid-cols-2 gap-1">{Object.entries(CLASSES).map(([k, c]) => (
        <button key={k} onClick={() => add(k)} className="bg-slate-700 p-1.5 rounded text-left">
          <div className="text-amber-400 text-sm font-bold">{c.name}</div>
          <div className="text-slate-400 text-xs truncate">{c.sp}</div>
        </button>
      ))}</div>}
      
      {s.party.map((h, i) => (
        <div key={i} className="bg-slate-700 rounded p-2 text-sm">
          <div className="flex justify-between">
            <input value={h.name} onChange={e => d({ type: 'UPD_HERO', i, u: { name: e.target.value } })} className="bg-transparent text-amber-400 font-bold w-24 outline-none" />
            <button onClick={() => d({ type: 'DEL_HERO', i })} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
          </div>
          <div className="flex justify-between items-center text-xs mt-1">
            <div className="flex items-center gap-1">
              <button onClick={() => lvl(i, -1)} className="bg-slate-600 px-1 rounded">-</button>
              <span>L{h.lvl} {CLASSES[h.key].name}</span>
              <button onClick={() => lvl(i, 1)} className="bg-slate-600 px-1 rounded">+</button>
            </div>
            <div className="flex items-center gap-1 text-red-400">
              <Heart size={12} />
              <button onClick={() => d({ type: 'UPD_HERO', i, u: { hp: Math.max(0, h.hp - 1) } })} className="bg-slate-600 px-1 rounded">-</button>
              {h.hp}/{h.maxHp}
              <button onClick={() => d({ type: 'UPD_HERO', i, u: { hp: Math.min(h.maxHp, h.hp + 1) } })} className="bg-slate-600 px-1 rounded">+</button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="bg-slate-800 rounded p-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-amber-400">Gold: {s.gold}</span>
          <div className="flex gap-1">
            <button onClick={() => d({ type: 'GOLD', n: -1 })} className="bg-slate-700 px-2 rounded">-</button>
            <button onClick={() => d({ type: 'GOLD', n: 1 })} className="bg-slate-700 px-2 rounded">+</button>
            <button onClick={() => d({ type: 'GOLD', n: d6() })} className="bg-amber-600 px-2 rounded">+d6</button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1 grid grid-cols-2 gap-x-2">
          <span>Minor Enc: {s.minorEnc}/10</span><span>Major Foes: {s.majorFoes}</span>
          <span>Clues: {s.clues}</span><span>Rooms: {s.rooms.length}</span>
        </div>
      </div>
    </div>
  );
}

function Dungeon({ s, d }) {
  const [rolls, setRolls] = useState(null);
  
  const gen = () => {
    const tileR = d66(), contR = r2d6();
    const cor = isCorridor(tileR);
    const tile = TILES[tileR] || `? (${tileR})`;
    let cont = CONTENT[contR];
    if (cor && [4, 8, 10, 12].includes(contR)) cont = 'Empty (corridor)';
    
    const isMajor = [10, 11].includes(contR) || (contR === 12 && !cor);
    let fb = false;
    if (isMajor && !s.finalBoss && s.rooms.length >= 3 && d6() + s.majorFoes >= 6) { fb = true; d({ type: 'BOSS' }); }
    
    setRolls({ tileR, contR, cor, fb });
    d({ type: 'ROOM', r: { id: Date.now(), n: s.rooms.length + 1, tileR, tile, cor, contR, cont, fb } });
    d({ type: 'LOG', t: `#${s.rooms.length + 1}: d66=${tileR} (${tile}) | 2d6=${contR} → ${cont}${fb ? ' ★FINAL BOSS★' : ''}` });
    if (isMajor) d({ type: 'MAJOR' });
    if ([6, 7].includes(contR) || (contR === 8 && !cor)) d({ type: 'MINOR' });
  };
  
  const search = () => {
    const r = d6() + (s.cur?.cor ? -1 : 0);
    const res = r <= 1 ? 'Wandering Monsters!' : r <= 4 ? 'Nothing' : 'Found! (Clue/Door/Treasure/Passage)';
    if (r >= 5) d({ type: 'CLUE', n: 1 });
    d({ type: 'LOG', t: `Search ${r}: ${res}` });
  };
  
  return (
    <div className="p-3 space-y-2">
      <button onClick={gen} className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded font-bold flex justify-center items-center gap-2">
        <ChevronRight size={18} /> New Room
      </button>
      
      {rolls && (
        <div className="bg-slate-800 rounded p-3 text-center">
          <div className="flex justify-center gap-8">
            <div><div className="text-2xl font-bold text-amber-400">{rolls.tileR}</div><div className="text-xs text-slate-500">d66 Tile</div></div>
            <div><div className="text-2xl font-bold text-amber-400">{rolls.contR}</div><div className="text-xs text-slate-500">2d6 Content</div></div>
          </div>
          <div className="text-xs mt-1">
            {rolls.cor && <span className="text-blue-400 mr-2">Corridor</span>}
            {rolls.fb && <span className="text-red-400 font-bold">★ FINAL BOSS ★</span>}
          </div>
        </div>
      )}
      
      {s.cur && (
        <div className="bg-slate-800 rounded p-2">
          <div className="flex justify-between items-center">
            <span className="text-amber-400 font-bold">Room {s.cur.n}</span>
            <button onClick={search} className="bg-slate-700 px-2 py-1 rounded text-xs"><Sparkles size={12} className="inline" /> Search</button>
          </div>
          <div className="text-sm text-slate-300">{s.cur.tile}</div>
          <div className="text-xs text-slate-400 mt-1">{s.cur.cont}</div>
        </div>
      )}
      
      <Dice />
      
      <div className="bg-slate-800 rounded p-2 max-h-32 overflow-y-auto text-xs">
        {s.rooms.slice().reverse().slice(0, 8).map(r => (
          <div key={r.id} className="text-slate-500 py-0.5">#{r.n} [{r.tileR}] {r.cont.slice(0, 25)}</div>
        ))}
      </div>
    </div>
  );
}

function Combat({ s, d }) {
  const [foeL, setFoeL] = useState(4);
  const [log, setLog] = useState([]);
  
  const atk = (i) => {
    const h = s.party[i]; if (!h || h.hp <= 0) return;
    const r = d6();
    let mod = ['warrior','barbarian','elf','dwarf'].includes(h.key) ? h.lvl : h.key === 'cleric' ? Math.floor(h.lvl/2) : 0;
    const tot = r + mod, hits = r === 1 ? 0 : Math.floor(tot / foeL);
    const msg = `${h.name}: ${r}+${mod}=${tot} vs L${foeL} → ${hits > 0 ? hits + ' kill(s)' : 'Miss'}${r === 6 ? ' 💥EXPLODE' : ''}`;
    setLog(p => [msg, ...p].slice(0, 15));
    d({ type: 'LOG', t: msg });
  };
  
  const def = (i) => {
    const h = s.party[i]; if (!h) return;
    const r = d6();
    let mod = h.key === 'rogue' ? h.lvl : 0;
    const tot = r + mod, ok = tot > foeL;
    if (!ok) d({ type: 'UPD_HERO', i, u: { hp: Math.max(0, h.hp - 1) } });
    const msg = `${h.name} DEF: ${r}+${mod}=${tot} vs L${foeL} → ${ok ? 'Block!' : 'HIT -1 Life'}`;
    setLog(p => [msg, ...p].slice(0, 15));
    d({ type: 'LOG', t: msg });
  };
  
  return (
    <div className="p-3 space-y-2">
      <div className="bg-slate-800 rounded p-2">
        <div className="flex justify-between items-center">
          <span className="text-amber-400 font-bold text-sm">Foe Level</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setFoeL(l => Math.max(1, l-1))} className="bg-slate-700 px-2 py-1 rounded">-</button>
            <span className="text-xl font-bold text-amber-400 w-6 text-center">{foeL}</span>
            <button onClick={() => setFoeL(l => l+1)} className="bg-slate-700 px-2 py-1 rounded">+</button>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-1">Attack: {foeL}+ to hit | Defense: {foeL+1}+ to block</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800 rounded p-2">
          <div className="text-orange-400 font-bold text-sm mb-2">⚔️ Attack</div>
          {s.party.map((h, i) => (
            <button key={i} onClick={() => atk(i)} disabled={h.hp <= 0} className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate">{h.name}</button>
          ))}
        </div>
        <div className="bg-slate-800 rounded p-2">
          <div className="text-red-400 font-bold text-sm mb-2">🛡️ Defend</div>
          {s.party.map((h, i) => (
            <button key={i} onClick={() => def(i)} disabled={h.hp <= 0} className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-600 py-1 rounded text-sm mb-1 truncate">{h.name}</button>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-800 rounded p-2 max-h-36 overflow-y-auto">
        <div className="text-xs text-slate-400 mb-1">Combat Log</div>
        {log.map((m, i) => <div key={i} className={`text-xs py-0.5 ${m.includes('Miss') || m.includes('HIT') ? 'text-red-400' : 'text-green-400'}`}>{m}</div>)}
        {!log.length && <div className="text-slate-500 text-xs">No combat yet</div>}
      </div>
      
      <Dice />
    </div>
  );
}

function Log({ s, d }) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-bold text-amber-400">Log</span>
        <button onClick={() => d({ type: 'RESET' })} className="bg-red-600 px-2 py-1 rounded text-xs"><RefreshCw size={12} className="inline" /> Reset</button>
      </div>
      <div className="bg-slate-800 rounded p-2 max-h-96 overflow-y-auto text-xs space-y-1">
        {s.log.map((t, i) => <div key={i} className="text-slate-400 border-b border-slate-700 pb-1">{t}</div>)}
        {!s.log.length && <div className="text-slate-500">Adventure awaits...</div>}
      </div>
    </div>
  );
}

export default function App() {
  const [s, d] = useReducer(reducer, init);
  const [tab, setTab] = useState('party');
  const tabs = [{ id: 'party', icon: Users, label: 'Party' }, { id: 'dungeon', icon: Map, label: 'Dungeon' }, { id: 'combat', icon: Sword, label: 'Combat' }, { id: 'log', icon: Scroll, label: 'Log' }];
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="bg-slate-800 p-3 text-center border-b border-slate-700">
        <h1 className="text-lg font-bold text-amber-400">Four Against Darkness</h1>
      </header>
      <main className="flex-1 overflow-y-auto pb-16">
        {tab === 'party' && <Party s={s} d={d} />}
        {tab === 'dungeon' && <Dungeon s={s} d={d} />}
        {tab === 'combat' && <Combat s={s} d={d} />}
        {tab === 'log' && <Log s={s} d={d} />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-3 flex flex-col items-center gap-1 ${tab === t.id ? 'text-amber-400' : 'text-slate-500'}`}>
            <t.icon size={18} /><span className="text-xs">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}