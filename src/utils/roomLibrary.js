// Simple room template library using localStorage
import { TILE_SHAPE_TABLE } from '../data/rooms.js';

const STORAGE_KEY = 'room_templates_v1';

// Centralized tag inference to avoid type mismatches and allow reuse
function inferTag(grid, d66) {
  const d66num = d66 != null ? parseInt(d66, 10) : null;
  // Prefer explicit d66 -> shape mapping when available
  if (d66num && TILE_SHAPE_TABLE && TILE_SHAPE_TABLE[d66num]) {
    const t = String(TILE_SHAPE_TABLE[d66num].type || '').toLowerCase();
    if (t === 'corridor') return 'Corridor';
    if (t === 'room') return 'Room';
  }

  // Fallback: inspect grid contents
  if (!Array.isArray(grid)) return null;
  let hasRoom = false;
  let hasCorridor = false;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < (grid[y] || []).length; x++) {
      const v = grid[y][x];
      if (v === 1) hasRoom = true;
      if (v === 2) hasCorridor = true;
      if (hasRoom && hasCorridor) break;
    }
    if (hasRoom && hasCorridor) break;
  }
  if (hasRoom) return 'Room';
  if (hasCorridor) return 'Corridor';
  return null;
}

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migration: normalize d66Number to numeric and ensure tag exists
    return parsed.map(p => {
      const copy = Object.assign({}, p);
      if (copy.d66Number != null) {
        const n = parseInt(copy.d66Number, 10);
        copy.d66Number = Number.isNaN(n) ? null : n;
      }
      if (!copy.tag) {
        copy.tag = inferTag(copy.grid, copy.d66Number);
      }
      if (!copy.cellStyles || typeof copy.cellStyles !== 'object') {
        copy.cellStyles = {};
      }
      return copy;
    });
  } catch (e) {
    return [];
  }
}

function save(item) {
  const existing = loadAll();
  const d66num = item.d66Number != null ? (Number.isNaN(parseInt(item.d66Number, 10)) ? null : parseInt(item.d66Number, 10)) : null;
  const toSave = {
    id: Date.now() + Math.random(),
    name: item.name || 'Untitled',
    grid: item.grid,
    doors: item.doors || [],
    walls: item.walls || [],
    cellStyles: item.cellStyles || {},
    d66Number: d66num,
    tag: inferTag(item.grid, d66num),
    createdAt: new Date().toISOString(),
  };
  existing.push(toSave);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(existing)); } catch (e) {}
  return toSave.id;
}

function remove(id) {
  const existing = loadAll().filter(i => i.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(existing)); } catch (e) {}
}

function clear() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

function getByD66(d66Number) {
  const target = d66Number != null ? parseInt(d66Number, 10) : null;
  return loadAll().find(item => {
    const candidate = item.d66Number != null ? parseInt(item.d66Number, 10) : null;
    return candidate === target;
  }) || null;
}

export default { loadAll, save, remove, clear, getByD66 };
