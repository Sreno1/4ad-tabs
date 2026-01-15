import React, { useState, useReducer, useEffect } from 'react';
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

// d6 Entrance table
const ENTRANCE = {
  1:'Empty',2:'Empty',3:'Vermin→Vermin Tbl',
  4:'Minions→Minions Tbl',5:'Special Feature Tbl',6:'Treasure→Treasure Tbl'
};

// Door configuration for each tile type [N, E, S, W]
const DOORS = {
  11:[1,1,0,0],12:[1,1,0,0],13:[1,1,0,0],14:[1,1,0,0],15:[1,1,1,0],16:[1,1,1,1],
  21:[1,1,0,0],22:[1,1,0,0],23:[1,1,0,0],24:[1,1,0,0],25:[1,1,0,0],26:[1,1,0,0],
  31:[1,1,0,0],32:[1,1,0,0],33:[1,1,0,0],34:[1,1,0,0],35:[1,1,0,0],36:[1,1,0,0],
  41:[1,1,0,0],42:[1,1,0,0],43:[1,1,0,0],44:[1,1,0,0],45:[1,1,0,0],46:[1,1,0,0],
  51:[1,1,0,0],52:[1,1,0,0],53:[1,1,0,0],54:[1,1,0,0],55:[1,1,1,0],56:[1,1,0,0],
  61:[1,1,1,0],62:[1,1,1,0],63:[1,1,0,0],64:[1,1,0,0],65:[1,1,0,0],66:[1,1,0,0]
};

// State
const init = { party: [], gold: 0, hcl: 1, rooms: [], log: [], minorEnc: 0, majorFoes: 0, finalBoss: false, clues: 0, selectedDoor: null };

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
    case 'SELECT_DOOR': return { ...s, selectedDoor: a.door };
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
    const isEntrance = s.rooms.length === 0;
    const tileR = d66();
    const contR = isEntrance ? d6() : r2d6();
    const cor = isCorridor(tileR);
    const tile = TILES[tileR] || `? (${tileR})`;
    let cont = isEntrance ? ENTRANCE[contR] : CONTENT[contR];
    if (cor && [4, 8, 10, 12].includes(contR)) cont = 'Empty (corridor)';

    const isMajor = !isEntrance && ([10, 11].includes(contR) || (contR === 12 && !cor));
    let fb = false;
    if (isMajor && !s.finalBoss && s.rooms.length >= 3 && d6() + s.majorFoes >= 6) { fb = true; d({ type: 'BOSS' }); }

    // Position and doors
    const doors = DOORS[tileR] || [1,1,0,0];
    let pos = { x: 0, y: 0 };
    let fromDoor = null;

    if (!isEntrance && s.selectedDoor) {
      const parent = s.rooms.find(r => r.id === s.selectedDoor.roomId);
      if (parent) {
        fromDoor = s.selectedDoor.dir;
        // Place room adjacent to parent based on selected door
        const offset = { N: {x:0,y:-1}, E: {x:1,y:0}, S: {x:0,y:1}, W: {x:-1,y:0} };
        const off = offset[s.selectedDoor.dir];
        pos = { x: parent.pos.x + off.x, y: parent.pos.y + off.y };
      }
    }

    setRolls({ tileR, contR, cor, fb, isEntrance });
    d({ type: 'ROOM', r: { id: Date.now(), n: s.rooms.length + 1, tileR, tile, cor, contR, cont, fb, doors, pos, fromDoor } });
    d({ type: 'LOG', t: `#${s.rooms.length + 1}: d66=${tileR} (${tile}) | ${isEntrance ? 'd6' : '2d6'}=${contR} → ${cont}${fb ? ' ★FINAL BOSS★' : ''}` });
    d({ type: 'SELECT_DOOR', door: null }); // Clear selection
    if (isMajor) d({ type: 'MAJOR' });
    if (!isEntrance && ([6, 7].includes(contR) || (contR === 8 && !cor))) d({ type: 'MINOR' });
  };
  
  const search = () => {
    const r = d6() + (s.cur?.cor ? -1 : 0);
    const res = r <= 1 ? 'Wandering Monsters!' : r <= 4 ? 'Nothing' : 'Found! (Clue/Door/Treasure/Passage)';
    if (r >= 5) d({ type: 'CLUE', n: 1 });
    d({ type: 'LOG', t: `Search ${r}: ${res}` });
  };
  
  const DoorBtn = ({ room, dir, label }) => {
    const [n, e, s, w] = room.doors;
    const hasDoor = (dir === 'N' && n) || (dir === 'E' && e) || (dir === 'S' && s) || (dir === 'W' && w);
    if (!hasDoor) return null;

    const isSelected = s.selectedDoor?.roomId === room.id && s.selectedDoor?.dir === dir;
    const posClass = {
      N: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
      E: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2',
      S: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
      W: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
    }[dir];

    return (
      <button
        onClick={() => d({ type: 'SELECT_DOOR', door: { roomId: room.id, dir } })}
        className={`absolute ${posClass} w-6 h-6 rounded-full border-2 text-xs font-bold ${isSelected ? 'bg-amber-400 border-amber-600 text-black' : 'bg-slate-700 border-slate-500 text-amber-400 hover:bg-slate-600'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="p-3 space-y-2">
      <button
        onClick={gen}
        disabled={s.rooms.length > 0 && !s.selectedDoor}
        className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:text-slate-400 py-3 rounded font-bold flex justify-center items-center gap-2"
      >
        <ChevronRight size={18} /> {s.rooms.length === 0 ? 'Generate Entrance' : s.selectedDoor ? 'Place New Room' : 'Select a Door First'}
      </button>
      
      {rolls && (
        <div className="bg-slate-800 rounded p-3 text-center">
          <div className="flex justify-center gap-8">
            <div><div className="text-2xl font-bold text-amber-400">{rolls.tileR}</div><div className="text-xs text-slate-500">d66 Tile</div></div>
            <div><div className="text-2xl font-bold text-amber-400">{rolls.contR}</div><div className="text-xs text-slate-500">{rolls.isEntrance ? 'd6' : '2d6'} Content</div></div>
          </div>
          <div className="text-xs mt-1">
            {rolls.isEntrance && <span className="text-green-400 mr-2">⭐ Entrance</span>}
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

      {s.rooms.length > 0 && (
        <div className="bg-slate-800 rounded p-3">
          <div className="text-amber-400 font-bold text-sm mb-2">Dungeon Map</div>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {(() => {
                const minX = Math.min(...s.rooms.map(r => r.pos.x));
                const maxX = Math.max(...s.rooms.map(r => r.pos.x));
                const minY = Math.min(...s.rooms.map(r => r.pos.y));
                const maxY = Math.max(...s.rooms.map(r => r.pos.y));
                const grid = [];
                for (let y = minY; y <= maxY; y++) {
                  const row = [];
                  for (let x = minX; x <= maxX; x++) {
                    const room = s.rooms.find(r => r.pos.x === x && r.pos.y === y);
                    row.push(room);
                  }
                  grid.push(row);
                }
                return grid.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((room, x) => (
                      <div key={x} className="w-20 h-20 p-1">
                        {room ? (
                          <div className={`relative w-full h-full rounded border-2 ${room.fb ? 'border-red-500 bg-red-900/30' : room.cor ? 'border-blue-500 bg-blue-900/30' : 'border-amber-500 bg-amber-900/30'} flex items-center justify-center`}>
                            <div className="text-center">
                              <div className="text-xs font-bold text-amber-400">#{room.n}</div>
                              <div className="text-[8px] text-slate-400">{room.tileR}</div>
                            </div>
                            <DoorBtn room={room} dir="N" label="N" />
                            <DoorBtn room={room} dir="E" label="E" />
                            <DoorBtn room={room} dir="S" label="S" />
                            <DoorBtn room={room} dir="W" label="W" />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>
          </div>
          {s.selectedDoor && <div className="text-xs text-green-400 mt-2">✓ Door selected: Room #{s.rooms.find(r => r.id === s.selectedDoor.roomId)?.n} {s.selectedDoor.dir}</div>}
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
  const loadState = () => {
    try {
      const saved = localStorage.getItem('4ad-state');
      return saved ? JSON.parse(saved) : init;
    } catch (e) {
      return init;
    }
  };

  const [s, d] = useReducer(reducer, null, loadState);
  const [tab, setTab] = useState('party');
  const tabs = [{ id: 'party', icon: Users, label: 'Party' }, { id: 'dungeon', icon: Map, label: 'Dungeon' }, { id: 'combat', icon: Sword, label: 'Combat' }, { id: 'log', icon: Scroll, label: 'Log' }];

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('4ad-state', JSON.stringify(s));
  }, [s]);
  
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