import React, { useState, useCallback, useMemo } from 'react';
import { X, Download, Upload, Save, PlusSquare, Trash2 } from 'lucide-react';
import DungeonGridCanvas from './DungeonGridCanvas.jsx';
import RoomPreview from './RoomPreview.jsx';
import roomLibrary from '../utils/roomLibrary.js';

// 7x7 grid editor for drafting room templates (reuses DungeonGridCanvas)
export default function RoomDesigner({ initialTemplate = null, onClose, onPlaceTemplate }) {
  const blank = Array(7).fill(null).map(() => Array(7).fill(0));
  const [grid, setGrid] = useState(() => (initialTemplate && initialTemplate.grid) || blank);
  const [doors, setDoors] = useState(() => (initialTemplate && initialTemplate.doors) || []);
  const [name, setName] = useState((initialTemplate && initialTemplate.name) || 'Untitled Room');
  const [d66Number, setD66Number] = useState((initialTemplate && initialTemplate.d66Number) || '');
  const [library, setLibrary] = useState(() => roomLibrary.loadAll());

  const onCellSet = useCallback((x, y, value) => {
    setGrid(g => {
      const next = g.map(row => row.slice());
      next[y][x] = value;
      return next;
    });
  }, []);

  const onCellClick = useCallback((x, y) => {
    setGrid(g => {
      const next = g.map(row => row.slice());
      next[y][x] = (next[y][x] + 1) % 3;
      return next;
    });
  }, []);

  const onDoorToggle = useCallback((x, y, edge) => {
    setDoors(d => {
      const exists = d.findIndex(dd => dd.x === x && dd.y === y && dd.edge === edge);
      if (exists >= 0) {
        return d.filter((_, i) => i !== exists);
      }
      return [...d, { x, y, edge }];
    });
  }, []);

  const clearGrid = useCallback(() => { setGrid(blank); setDoors([]); }, [blank]);

  const saveToLibrary = useCallback(() => {
    roomLibrary.save({
      name: name || 'Untitled',
      grid,
      doors,
      d66Number: d66Number ? parseInt(d66Number) : null
    });
    setLibrary(roomLibrary.loadAll());
  }, [grid, doors, name, d66Number]);

  const deleteFromLibrary = useCallback((id) => {
    roomLibrary.remove(id);
    setLibrary(roomLibrary.loadAll());
  }, []);

  const exportTemplate = useCallback((tpl) => {
    const payload = JSON.stringify(tpl);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(tpl.name||'room').replace(/[^a-z0-9-_]/gi,'_')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const importFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed.grid)) {
          setGrid(parsed.grid);
          setDoors(parsed.doors || []);
          setName(parsed.name || 'Imported Room');
        }
      } catch (err) {
        // ignore
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-800 border border-slate-700 rounded p-4 w-[900px] max-w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-amber-400 font-bold">Room Designer (7×7)</div>
          <div className="flex items-center gap-2">
            <input className="bg-slate-700 px-2 py-1 rounded text-sm" placeholder="Room name" value={name} onChange={(e)=>setName(e.target.value)} />
            <input
              type="number"
              min="11"
              max="66"
              className="bg-slate-700 px-2 py-1 rounded text-sm w-16"
              placeholder="d66"
              title="d66 roll to trigger (11-66)"
              value={d66Number}
              onChange={(e)=>setD66Number(e.target.value)}
            />
            <button onClick={saveToLibrary} className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded flex items-center gap-1 text-sm"><Save size={14}/> Save</button>
            <button onClick={() => exportTemplate({ name, grid, doors, d66Number: d66Number ? parseInt(d66Number) : null })} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-1 text-sm"><Download size={14}/> Export</button>
            <label className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded flex items-center gap-1 text-sm cursor-pointer">
              <Upload size={14}/> <input type="file" accept="application/json" className="hidden" onChange={(e)=>e.target.files?.[0] && importFile(e.target.files[0])} /> Import
            </label>
            <button onClick={onClose} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded"><X size={16} /></button>
          </div>
        </div>

        <div className="flex gap-4">
          <div>
            <div className="bg-slate-900 p-2 rounded">
              <DungeonGridCanvas
                grid={grid}
                doors={doors}
                roomMarkers={{}}
                showMarkers={false}
                cellSize={28}
                shouldRotate={false}
                showPawnHint={false}
                onCellClick={(x,y)=>onCellClick(x,y)}
                onCellSet={(x,y,val)=>onCellSet(x,y,val)}
                onCellRightClick={()=>{}}
                onDoorToggle={(x,y,edge)=>onDoorToggle(x,y,edge)}
                partyPos={null}
                onPartyMove={null}
                partySelected={false}
                onPartySelect={null}
              />
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={clearGrid} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">Clear</button>
              <button onClick={()=>onPlaceTemplate({ name, grid, doors })} className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded text-sm">Place to map</button>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-sm text-slate-300 mb-2">Library</div>
            <div className="space-y-3 max-h-[380px] overflow-auto">
              {library.length === 0 && <div className="text-slate-500 text-sm">No templates saved</div>}
              {library.map(item => (
                <div key={item.id} className="bg-slate-700 p-2 rounded">
                  <div className="flex gap-2">
                    {/* Preview */}
                    <div className="flex-shrink-0">
                      <RoomPreview grid={item.grid} doors={item.doors || []} cellSize={16} />
                    </div>
                    {/* Info & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-sm text-amber-400">{item.name}</div>
                          {item.d66Number && <div className="text-xs bg-blue-700 px-1.5 py-0.5 rounded">d66: {item.d66Number}</div>}
                        </div>
                        <div className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={()=>{ setGrid(item.grid); setDoors(item.doors || []); setName(item.name); setD66Number(item.d66Number || ''); }} className="px-2 py-0.5 bg-slate-600 hover:bg-slate-500 rounded text-xs">Edit</button>
                        <button onClick={()=>onPlaceTemplate(item)} className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 rounded text-xs">Place</button>
                        <button onClick={()=>exportTemplate(item)} className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-xs">Export</button>
                        <button onClick={()=>deleteFromLibrary(item.id)} className="px-2 py-0.5 bg-red-700 hover:bg-red-600 rounded text-xs"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
