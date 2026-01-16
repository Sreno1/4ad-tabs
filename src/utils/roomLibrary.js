// Simple room template library using localStorage
const STORAGE_KEY = 'room_templates_v1';

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

function save(item) {
  const existing = loadAll();
  const toSave = {
    id: Date.now() + Math.random(),
    name: item.name || 'Untitled',
    grid: item.grid,
    doors: item.doors || [],
    d66Number: item.d66Number || null,
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
  return loadAll().find(item => item.d66Number === d66Number) || null;
}

export default { loadAll, save, remove, clear, getByD66 };
