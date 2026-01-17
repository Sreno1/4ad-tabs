import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import sfx from '../utils/sfx.js';
import { X, Download, Upload, Save, PlusSquare, Trash2 } from 'lucide-react';
import DungeonGridCanvas from './DungeonGridCanvas.jsx';
import ContextMenu from './ContextMenu.jsx';
import RoomPreview from './RoomPreview.jsx';
import roomLibrary from '../utils/roomLibrary.js';

// 7x7 grid editor for drafting room templates (reuses DungeonGridCanvas)
export default function RoomDesigner({ initialTemplate = null, onClose, onPlaceTemplate }) {
  const blank = Array(7).fill(null).map(() => Array(7).fill(0));
  const [grid, setGrid] = useState(() => (initialTemplate && initialTemplate.grid) || blank);
  const [doors, setDoors] = useState(() => (initialTemplate && initialTemplate.doors) || []);
  const [walls, setWalls] = useState(() => (initialTemplate && initialTemplate.walls) || []);
  const [name, setName] = useState((initialTemplate && initialTemplate.name) || '');
  const [d66Number, setD66Number] = useState((initialTemplate && initialTemplate.d66Number) || '');
  const [library, setLibrary] = useState(() => roomLibrary.loadAll());
  const [designerContextMenu, setDesignerContextMenu] = useState(null); // {xPx,yPx,cellX,cellY}
  const designerGridRef = useRef(null);
  // Native contextmenu handler for designer
  useEffect(() => {
    const container = designerGridRef.current;
    if (!container) return;
    const handler = (e) => {
      try {
        const canvas = container.querySelector('canvas');
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;
        // no rotation in designer, so mapping is direct
        const x = Math.floor(mouseX / 28);
        const y = Math.floor(mouseY / 28);
        if (x >= 0 && x < 7 && y >= 0 && y < 7 && grid[y][x] === 1) {
          e.preventDefault();
          e.stopPropagation();
          setDesignerContextMenu({ xPx: e.clientX, yPx: e.clientY, cellX: x, cellY: y });
        }
      } catch (err) {
        // ignore
      }
    };
    container.addEventListener('contextmenu', handler);
    return () => container.removeEventListener('contextmenu', handler);
  }, [designerGridRef, grid]);

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
      // Remove any wall on this edge first
      const newWalls = walls.filter(w => !(w.x === x && w.y === y && w.edge === edge));
      setWalls(newWalls);
      return [...d, { x, y, edge }];
    });
  }, [walls]);

  const onWallToggle = useCallback((x, y, edge, isAdding) => {
    setWalls(w => {
      const exists = w.findIndex(ww => ww.x === x && ww.y === y && ww.edge === edge);
      if (isAdding) {
        if (exists >= 0) return w; // Wall already exists
        // Remove any door on this edge first
        const newDoors = doors.filter(d => !(d.x === x && d.y === y && d.edge === edge));
        setDoors(newDoors);
        return [...w, { x, y, edge }];
      } else {
        // Removing wall
        if (exists >= 0) {
          return w.filter((_, i) => i !== exists);
        }
        return w;
      }
    });
  }, [doors]);

  const clearGrid = useCallback(() => { setGrid(blank); setDoors([]); setWalls([]); }, [blank]);

  const saveToLibrary = useCallback(() => {
    roomLibrary.save({
      name: name || 'Untitled',
      grid,
      doors,
      walls,
      d66Number: d66Number ? parseInt(d66Number) : null
    });
    setLibrary(roomLibrary.loadAll());
  }, [grid, doors, walls, name, d66Number]);

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
    // Prefer internal id for filename to avoid exposing editable names; fall back to tpl.name
    const safeName = tpl.id ? String(tpl.id) : (tpl.name || 'room');
    a.download = `${safeName.replace(/[^a-z0-9-_.]/gi,'_')}.json`;
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
          // Keep imported template name internal-only; do not surface it in the editor UI
          setName(parsed.name || '');
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
            {/* Room naming removed from UI - templates keep internal ids for export/import */}
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
              <div ref={designerGridRef}>
              <DungeonGridCanvas
                grid={grid}
                doors={doors}
                walls={walls}
                roomMarkers={{}}
                showMarkers={false}
                cellSize={28}
                shouldRotate={false}
                suppressContextAction={true}
                showPawnHint={false}
                onCellClick={(x,y)=>onCellClick(x,y)}
                onCellSet={(x,y,val)=>onCellSet(x,y,val)}
                onCellContextMenu={(x,y,e)=>{
                  // Only open context menu for room cells
                  try { e.preventDefault(); } catch (err) {}
                  if (!grid[y] || grid[y][x] !== 1) return;
                  setDesignerContextMenu({ xPx: e.clientX, yPx: e.clientY, cellX: x, cellY: y });
                }}
                onCellContextMenu={(x,y,e)=>{
                  // compute menu position relative to click
                  e.preventDefault();
                  setDesignerContextMenu({ xPx: e.clientX, yPx: e.clientY, cellX: x, cellY: y });
                }}
                onDoorToggle={(x,y,edge)=>onDoorToggle(x,y,edge)}
                partyPos={null}
                onPartyMove={null}
                partySelected={false}
                onPartySelect={null}
              />
              {designerContextMenu && (
                <ContextMenu
                  x={designerContextMenu.xPx}
                  y={designerContextMenu.yPx}
                  onClose={()=>setDesignerContextMenu(null)}
                  items={[
                    { key: 'wall', label: 'Wall off room', onClick: () => {
                        const { cellX: sx, cellY: sy } = designerContextMenu;
                        if (!(sy >= 0 && sy < grid.length && sx >= 0 && sx < (grid[0]?.length || 0))) return;
                        if (grid[sy][sx] !== 1) return;
                        // Flood-fill region
                        const cols = grid[0]?.length || 0;
                        const rows = grid.length;
                        const toVisit = [{x: sx, y: sy}];
                        const region = new Set();
                        const key = (a,b)=>`${a},${b}`;
                        while (toVisit.length) {
                          const c = toVisit.pop();
                          const k = key(c.x, c.y);
                          if (region.has(k)) continue;
                          if (!(c.y >= 0 && c.y < rows && c.x >= 0 && c.x < cols)) continue;
                          if (grid[c.y][c.x] !== 1) continue;
                          region.add(k);
                          toVisit.push({x: c.x+1, y: c.y}); toVisit.push({x: c.x-1, y: c.y}); toVisit.push({x: c.x, y: c.y+1}); toVisit.push({x: c.x, y: c.y-1});
                        }
                        const perimeter = [];
                        region.forEach(k => {
                          const [rx, ry] = k.split(',').map(Number);
                          const neighbors = [
                            {edge: 'N', nx: rx, ny: ry-1},
                            {edge: 'S', nx: rx, ny: ry+1},
                            {edge: 'E', nx: rx+1, ny: ry},
                            {edge: 'W', nx: rx-1, ny: ry}
                          ];
                          neighbors.forEach(n => {
                            if (!(n.ny >= 0 && n.ny < rows && n.nx >= 0 && n.nx < cols) || grid[n.ny][n.nx] !== 1) {
                              perimeter.push({ x: rx, y: ry, edge: n.edge });
                            }
                          });
                        });
                        if (perimeter.length === 0) return;
                        const allExist = perimeter.every(pe => walls.some(w => w.x === pe.x && w.y === pe.y && w.edge === pe.edge));
                        if (allExist) {
                          setWalls(prev => prev.filter(w => !perimeter.some(pe => pe.x === w.x && pe.y === w.y && pe.edge === w.edge)));
                        } else {
                          setDoors(prev => prev.filter(d => !perimeter.some(pe => pe.x === d.x && pe.y === d.y && pe.edge === d.edge)));
                          setWalls(prev => {
                            const kept = prev.filter(w => !perimeter.some(pe => pe.x === w.x && pe.y === w.y && pe.edge === w.edge));
                            return [...kept, ...perimeter];
                          });
                        }
                        setDesignerContextMenu(null);
                      } },
                    { key: 'note', label: 'Add Note', onClick: () => {
                        const txt = window.prompt('Note for this tile:');
                        if (txt && txt.trim()) {
                          // no global markers here - could be extended later
                        }
                        setDesignerContextMenu(null);
                      } }
                  ]}
                />
              )}
              </div>

              {/* Native contextmenu listener on the designer container to ensure right-click works inside modal */}
              <>
                {/* attach listener via effect below */}
              </>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={clearGrid} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">Clear</button>
              <button onClick={()=>{ try { sfx.play('select2', { volume: 0.8 }); } catch(e){}; onPlaceTemplate({ name, grid, doors, walls }) }} className="px-2 py-1 bg-amber-600 hover:bg-amber-500 rounded text-sm">Place to map</button>
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
                      <RoomPreview grid={item.grid} doors={item.doors || []} walls={item.walls || []} cellSize={16} />
                    </div>
                    {/* Info & Actions */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-sm text-amber-400">Template</div>
                            {item.d66Number && <div className="text-xs bg-blue-700 px-1.5 py-0.5 rounded">d66: {item.d66Number}</div>}
                            {item.tag && <div className="text-xs bg-slate-700 px-1.5 py-0.5 rounded">{item.tag}</div>}
                          </div>
                        <div className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={()=>{ setGrid(item.grid); setDoors(item.doors || []); setD66Number(item.d66Number || ''); }} className="px-2 py-0.5 bg-slate-600 hover:bg-slate-500 rounded text-xs">Edit</button>
                        <button onClick={()=>{ try { sfx.play('select2', { volume: 0.8 }); } catch(e){}; onPlaceTemplate(item); }} className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 rounded text-xs">Place</button>
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
