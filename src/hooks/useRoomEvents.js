import { useState } from 'react';
import { d66, d6, r2d6 } from '../utils/dice.js';
import { TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE, SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS, checkForBoss } from '../data/rooms.js';
import { spawnMonster, rollTreasure, spawnMajorFoe } from "../utils/gameActions/index.js";
import { previewTreasureRoll } from '../utils/gameActions/treasureActions.js';
import { getTrait } from '../data/traits.js';
import { createMonsterFromTable, MONSTER_TABLE } from '../data/monsters.js';
import { addMonster, logMessage as logMsgAction } from '../state/actionCreators.js';
import { ACTION_MODES, EVENT_TYPES } from '../constants/gameConstants.js';
import { logMessage } from '../state/actionCreators.js';
import roomLibrary from '../utils/roomLibrary.js';

export function useRoomEvents(state, dispatch, setActionMode, onGoldSensePreview) {
  // Attempt to restore last tile data from localStorage so refresh keeps you in the same room
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem('lastTileData');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };
  const saved = loadSaved();

  const [roomEvents, setRoomEvents] = useState(() => (saved && saved.roomEvents) ? saved.roomEvents : []);
  const [tileResult, setTileResult] = useState(() => (saved && saved.tileResult) ? saved.tileResult : null);
  const [roomDetails, setRoomDetails] = useState(() => (saved && saved.roomDetails) ? saved.roomDetails : null);
  const [bossCheckResult, setBossCheckResult] = useState(() => (saved && saved.bossCheckResult) ? saved.bossCheckResult : null);
  const [autoPlacedRoom, setAutoPlacedRoom] = useState(() => (saved && saved.autoPlacedRoom) ? saved.autoPlacedRoom : null);

  // Add an event to the room events stack
  const addRoomEvent = (eventType, eventData = {}) => {
    setRoomEvents(prev => [...prev, {
      type: eventType,
      data: eventData,
      timestamp: Date.now()
    }]);
  };

  // Process tile contents and trigger appropriate actions
  const processContents = (contents, events = []) => {
    let newEvents = [...events];

    const rollCountSpec = (spec) => {
      // spec examples: 'd6+2', 'd6', 'd3', 'd6-2'
      if (!spec || typeof spec !== 'string') return 1;
      const m = spec.match(/^d(\d+)([+-]\d+)?$/);
      if (!m) return 1;
      const sides = parseInt(m[1], 10);
      const offset = m[2] ? parseInt(m[2], 10) : 0;
      const roll = Math.floor(Math.random() * sides) + 1;
      return Math.max(0, roll + offset);
    };

    switch (contents.type) {
      case 'empty':
        newEvents.push({ type: EVENT_TYPES.EMPTY, data: {}, timestamp: Date.now() });
        setActionMode(ACTION_MODES.EMPTY);
        dispatch(logMessage(`The room is empty.`, 'exploration'));
        break;

      case 'vermin': {
        // Choose a specific vermin from MONSTER_TABLE with category 'dungeonVermin'
        const candidates = Object.entries(MONSTER_TABLE).filter(([, t]) => t.category === 'dungeonVermin').map(([k]) => k);
        const key = candidates[Math.floor(Math.random() * candidates.length)];
        const template = MONSTER_TABLE[key];
        // Roll group count from template.count (e.g., 'd6+2')
        const count = rollCountSpec(template.count || 'd6');
        const level = Math.max(1, 1 + (template.levelMod || 0));
        const group = {
          id: Date.now() + Math.random(),
          name: template.name,
          level: level,
          hp: 1,
          maxHp: 1,
          count,
          initialCount: count,
          type: key,
          special: template.special,
          xp: template.xp || level,
          moraleMod: template.moraleMod || 0,
          reaction: null,
          statuses: [],
          isMinorFoe: true
        };
        dispatch(addMonster(group));
        dispatch(logMsgAction(`${group.count} ${group.name} L${group.level} appear!`));

        // Dwarf Gold Sense: if any alive dwarf has the trait, offer a preview
        const dwarfIdx = (state.party || []).findIndex(h => h && h.hp > 0 && getTrait(h.key, h.trait)?.key === 'goldSense');
    if (dwarfIdx !== -1) {
          // Save vs L6 + L
          const dwarf = state.party[dwarfIdx];
          const saveRoll = d6();
          const total = saveRoll + dwarf.lvl;
          dispatch(logMsgAction(`🧭 ${dwarf.name} (Gold Sense) rolls Save ${saveRoll}+${dwarf.lvl}=${total} vs L6`));
          if (total >= 6) {
            const preview = previewTreasureRoll();
      dispatch(logMsgAction(`🔎 ${dwarf.name} smells treasure! Preview: ${preview.type === 'gold' ? `${preview.amount} gold` : preview.type}`));
      // Notify UI via callback if provided so we can show a modal preview
      try { if (typeof onGoldSensePreview === 'function') onGoldSensePreview({ dwarf, saveRoll, total, preview }); } catch (e) {}
          } else {
            dispatch(logMsgAction(`❌ ${dwarf.name} fails to sense treasure.`));
          }
        }
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'vermin', level: 1, species: key, count }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;
      }

      case 'minions': {
        // Choose a specific minion from MONSTER_TABLE with category 'dungeonMinions'
        const candidates = Object.entries(MONSTER_TABLE).filter(([, t]) => t.category === 'dungeonMinions').map(([k]) => k);
        const key = candidates[Math.floor(Math.random() * candidates.length)];
        const template = MONSTER_TABLE[key];
        const count = rollCountSpec(template.count || 'd6+2');
        const level = Math.max(1, 2 + (template.levelMod || 0));
        const group = {
          id: Date.now() + Math.random(),
          name: template.name,
          level: level,
          hp: 1,
          maxHp: 1,
          count,
          initialCount: count,
          type: key,
          special: template.special,
          xp: template.xp || level,
          moraleMod: template.moraleMod || 0,
          reaction: null,
          statuses: [],
          isMinorFoe: true
        };
        dispatch(addMonster(group));
        dispatch(logMsgAction(`${group.count} ${group.name} L${group.level} appear!`));

        // Dwarf Gold Sense preview
        const dwarfIdx2 = (state.party || []).findIndex(h => h && h.hp > 0 && getTrait(h.key, h.trait)?.key === 'goldSense');
    if (dwarfIdx2 !== -1) {
          const dwarf = state.party[dwarfIdx2];
          const saveRoll = d6();
          const total = saveRoll + dwarf.lvl;
          dispatch(logMsgAction(`🧭 ${dwarf.name} (Gold Sense) rolls Save ${saveRoll}+${dwarf.lvl}=${total} vs L6`));
          if (total >= 6) {
            const preview = previewTreasureRoll();
      dispatch(logMsgAction(`🔎 ${dwarf.name} smells treasure! Preview: ${preview.type === 'gold' ? `${preview.amount} gold` : preview.type}`));
      try { if (typeof onGoldSensePreview === 'function') onGoldSensePreview({ dwarf, saveRoll, total, preview }); } catch (e) {}
          } else {
            dispatch(logMsgAction(`❌ ${dwarf.name} fails to sense treasure.`));
          }
        }
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'minions', level: 2, species: key, count }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;
      }

      case 'treasure':
        rollTreasure(dispatch);
        newEvents.push({ type: EVENT_TYPES.TREASURE, data: { gold: state.gold }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.TREASURE);
        break;

      case 'special': {
        const specialRoll = d6();
        const specialKey = SPECIAL_FEATURE_TABLE[specialRoll];
        const special = SPECIAL_ROOMS[specialKey];
        const details = { type: 'special', specialKey, special, specialRoll };
        setRoomDetails(details);
        newEvents.push({ type: EVENT_TYPES.SPECIAL, data: details, timestamp: Date.now() });
  dispatch(logMessage(`Special Feature! ${special.name}`, 'exploration'));
        dispatch(logMessage(`📜 ${special.description}`, 'exploration'));
        setActionMode(ACTION_MODES.SPECIAL);
        break;
      }

      case 'weird_monster':
        dispatch(logMessage(`👾 Weird Monster! Roll on the Weird Monster table.`, 'exploration'));
        const weirdDetails = { type: 'weird_monster' };
        setRoomDetails(weirdDetails);
        newEvents.push({ type: EVENT_TYPES.WEIRD, data: weirdDetails, timestamp: Date.now() });
        setActionMode(ACTION_MODES.WEIRD);
        break;

      case 'minor_boss':
        spawnMonster(dispatch, 'boss', 3);
        dispatch({ type: 'MINOR' });
  dispatch(logMessage(`Minor Boss appears! (Level 3)`, 'exploration'));
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'boss', level: 3, isBoss: false }, timestamp: Date.now() });
        // Dwarf Gold Sense preview for boss
        const dwarfIdx3 = (state.party || []).findIndex(h => h && h.hp > 0 && getTrait(h.key, h.trait)?.key === 'goldSense');
    if (dwarfIdx3 !== -1) {
          const dwarf = state.party[dwarfIdx3];
          const saveRoll = d6();
          const total = saveRoll + dwarf.lvl;
          dispatch(logMsgAction(`🧭 ${dwarf.name} (Gold Sense) rolls Save ${saveRoll}+${dwarf.lvl}=${total} vs L6`));
          if (total >= 6) {
            const preview = previewTreasureRoll();
      dispatch(logMsgAction(`🔎 ${dwarf.name} smells treasure! Preview: ${preview.type === 'gold' ? `${preview.amount} gold` : preview.type}`));
      try { if (typeof onGoldSensePreview === 'function') onGoldSensePreview({ dwarf, saveRoll, total, preview }); } catch (e) {}
          } else {
            dispatch(logMsgAction(`❌ ${dwarf.name} fails to sense treasure.`));
          }
        }
        setActionMode(ACTION_MODES.COMBAT);
        break;

      case 'major_foe': {
        const bossRoll = d6();
        const bossResult = checkForBoss(state.majorFoes || 0, bossRoll);
        setBossCheckResult(bossResult);
        dispatch(logMessage(`🎲 Boss Check: ${bossResult.message}`, 'exploration'));
        newEvents.push({ type: EVENT_TYPES.BOSS_CHECK, data: bossResult, timestamp: Date.now() });

        if (bossResult.isBoss) {
          spawnMajorFoe(dispatch, state.hcl, true);
          dispatch({ type: 'BOSS' });
          dispatch(logMessage(`👑 THE BOSS APPEARS! (+1 Life, +1 Attack, 3x Treasure)`, 'exploration'));
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'boss', level: state.hcl, isBoss: true }, timestamp: Date.now() });
          // Dwarf Gold Sense preview for boss
          const dwarfIdx4 = (state.party || []).findIndex(h => h && h.hp > 0 && getTrait(h.key, h.trait)?.key === 'goldSense');
      if (dwarfIdx4 !== -1) {
            const dwarf = state.party[dwarfIdx4];
            const saveRoll = d6();
            const total = saveRoll + dwarf.lvl;
            dispatch(logMsgAction(`🧭 ${dwarf.name} (Gold Sense) rolls Save ${saveRoll}+${dwarf.lvl}=${total} vs L6`));
            if (total >= 6) {
              const preview = previewTreasureRoll();
        dispatch(logMsgAction(`🔎 ${dwarf.name} smells treasure! Preview: ${preview.type === 'gold' ? `${preview.amount} gold` : preview.type}`));
        try { if (typeof onGoldSensePreview === 'function') onGoldSensePreview({ dwarf, saveRoll, total, preview }); } catch (e) {}
            } else {
              dispatch(logMsgAction(`❌ ${dwarf.name} fails to sense treasure.`));
            }
          }
        } else {
          spawnMajorFoe(dispatch, state.hcl, false);
          dispatch({ type: 'MAJOR' });
          dispatch(logMessage(`Major Foe appears! (Level ${state.hcl})`, 'exploration'));
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'major', level: state.hcl, isBoss: false }, timestamp: Date.now() });
          // Dwarf Gold Sense preview for major foe
          const dwarfIdx5 = (state.party || []).findIndex(h => h && h.hp > 0 && getTrait(h.key, h.trait)?.key === 'goldSense');
      if (dwarfIdx5 !== -1) {
            const dwarf = state.party[dwarfIdx5];
            const saveRoll = d6();
            const total = saveRoll + dwarf.lvl;
            dispatch(logMsgAction(`🧭 ${dwarf.name} (Gold Sense) rolls Save ${saveRoll}+${dwarf.lvl}=${total} vs L6`));
            if (total >= 6) {
              const preview = previewTreasureRoll();
        dispatch(logMsgAction(`🔎 ${dwarf.name} smells treasure! Preview: ${preview.type === 'gold' ? `${preview.amount} gold` : preview.type}`));
        try { if (typeof onGoldSensePreview === 'function') onGoldSensePreview({ dwarf, saveRoll, total, preview }); } catch (e) {}
            } else {
              dispatch(logMsgAction(`❌ ${dwarf.name} fails to sense treasure.`));
            }
          }
        }
        setActionMode(ACTION_MODES.COMBAT);
        break;
      }

      case 'quest_room':
        dispatch(logMessage(`🏆 Quest Room / Final Room! The dungeon's objective is here.`, 'exploration'));
        const questDetails = { type: 'quest_room' };
        setRoomDetails(questDetails);
        newEvents.push({ type: EVENT_TYPES.QUEST, data: questDetails, timestamp: Date.now() });
        setActionMode(ACTION_MODES.QUEST);
        break;

      default:
        setActionMode(ACTION_MODES.IDLE);
        break;
    }

    setRoomEvents(newEvents);
  };

  // Combined tile generation - rolls both shape and contents at once
  const generateTile = () => {
    const shapeRoll = d66();
    const shapeResult = TILE_SHAPE_TABLE[shapeRoll];
    const isCorridor = shapeResult?.shape?.includes('corridor');

    const newEvents = [{
      type: 'D66_ROLL',
      data: { roll: shapeRoll, shape: shapeResult?.shape },
      timestamp: Date.now()
    }];

    // Check if this d66 roll matches any saved room template
    const matchedRoom = roomLibrary.getByD66(shapeRoll);
    if (matchedRoom) {
      newEvents.push({
        type: 'LIBRARY_MATCH',
        data: { room: matchedRoom },
        timestamp: Date.now()
      });
  // Set the auto-placed template but continue to roll contents so the
  // ActionPane shows the 2d6 result and associated events. Previously
  // we returned early here which prevented the contents roll from
  // running when a library match occurred.
  setAutoPlacedRoom(matchedRoom);
  setRoomEvents(newEvents);
  // continue on to roll contents and process them below
    }

    // No match - roll 2d6 for contents
    const contentsRoll = r2d6();
    const contentsResult = TILE_CONTENTS_TABLE[contentsRoll];

    // Check if this content roll has different outcomes for room vs corridor
    const hasDualContent = contentsResult.corridorType && contentsResult.roomType;

    if (hasDualContent) {
      // Show both options - let player choose
      const corridorOption = {
        type: contentsResult.corridorType,
        description: `Corridor: ${contentsResult.corridorType === 'empty' ? 'Empty (may search)' : contentsResult.description}`
      };
      const roomOption = {
        type: contentsResult.roomType,
        description: `Room: ${contentsResult.description.split('//')[1]?.trim() || contentsResult.description}`
      };

      newEvents.push({
        type: 'DUAL_CONTENT',
        data: {
          roll: contentsRoll,
          isCorridor,
          corridorOption,
          roomOption,
          description: contentsResult.description
        },
        timestamp: Date.now()
      });

      // Also record a generic contents roll event so the UI can show the 2d6 value
      newEvents.push({
        type: 'CONTENTS_ROLL',
        data: { roll: contentsRoll, description: contentsResult.description },
        timestamp: Date.now()
      });

      // Store both options so player can choose
      setTileResult({
        shape: shapeResult,
        isCorridor,
        contentsRoll,
        hasDualContent: true,
        corridorOption,
        roomOption
      });
      setRoomEvents(newEvents);
      setRoomDetails(null);
      setBossCheckResult(null);
      setActionMode(ACTION_MODES.IDLE); // Let player choose
    } else {
      // Single content type - process immediately
      newEvents.push({
        type: 'CONTENTS_ROLL',
        data: { roll: contentsRoll, description: contentsResult.description },
        timestamp: Date.now()
      });

      // Store tile result for searchable rooms/corridors
      setTileResult({
        shape: shapeResult,
        isCorridor,
        contentsRoll,
        contentType: contentsResult.type
      });
      setRoomEvents(newEvents);
      setRoomDetails(null);
      setBossCheckResult(null);

      // Process contents (spawn monsters, treasure, etc)
      processContents(contentsResult, newEvents);
    }
  };

  // Process chosen content option (for dual content rolls)
  const applyContentChoice = (contentType) => {
    // Update tileResult to remove dual content flag and add content type
    setTileResult(prev => prev ? {
      ...prev,
      hasDualContent: false,
      contentType
    } : null);

    const contentObj = { type: contentType };
    processContents(contentObj, roomEvents);
    dispatch(logMessage(`Player chose: ${contentType}`, 'exploration'));
  };

  // Clear the current tile result and return to idle
  const clearTile = () => {
    setTileResult(null);
    setRoomDetails(null);
    setBossCheckResult(null);
    setRoomEvents([]);
    setAutoPlacedRoom(null);
    setActionMode(ACTION_MODES.IDLE);
    try { localStorage.removeItem('lastTileData'); } catch (e) { /* ignore */ }
  };

  // Persist relevant room state so refresh restores the current non-combat room
  // Only persist when there are no active monsters (not in combat)
  const persist = () => {
    try {
  // Avoid saving during combat or when monsters exist in global state
  if ((state && Array.isArray(state.monsters) && state.monsters.length > 0) || (state && state.actionMode === ACTION_MODES.COMBAT)) {
        // Remove any saved tile data during combat to avoid restoring a combat state later
        try { localStorage.removeItem('lastTileData'); } catch (e) {}
        return;
      }
      const data = {
        adventureId: state?.adventure?.adventureId || null,
        roomEvents: roomEvents || [],
        tileResult: tileResult || null,
        roomDetails: roomDetails || null,
        bossCheckResult: bossCheckResult || null,
        autoPlacedRoom: autoPlacedRoom || null
      };
      // Only save if there's meaningful data
      if ((data.roomEvents && data.roomEvents.length > 0) || data.tileResult || data.roomDetails || data.autoPlacedRoom) {
        localStorage.setItem('lastTileData', JSON.stringify(data));
      } else {
        localStorage.removeItem('lastTileData');
      }
    } catch (e) {
      // ignore storage errors
    }
  };

  // Persist whenever key room state changes
  try {
    // use a microtask to avoid calling during render
    setTimeout(persist, 0);
  } catch (e) {
    // ignore
  }

  // If the global adventure or mode changes (reset/new adventure/etc.), clear persisted tile data
  try {
    // run as microtask to avoid during render
    setTimeout(() => {
      // If adventure ID changed or mode changed in global state, remove saved tile
      if (!state || !state.adventure) return;
      // Listen for external signals: when adventureId differs from saved state, clear storage
      const savedRaw = localStorage.getItem('lastTileData');
      if (!savedRaw) return;
      try {
        const parsed = JSON.parse(savedRaw);
        // If the current adventure ID is different than any saved adventure marker, clear
        if (parsed && parsed.adventureId && parsed.adventureId !== state.adventure.adventureId) {
          localStorage.removeItem('lastTileData');
        }
      } catch (e) {
        // If saved data isn't JSON or missing fields, remove it to be safe
        localStorage.removeItem('lastTileData');
      }
    }, 0);
  } catch (e) {
    // ignore
  }

  // Helper: Check if tile is a corridor
  const isCorridor = () => {
    if (!tileResult) return false;

    // Check if we stored isCorridor as a boolean
    if (typeof tileResult.isCorridor === 'boolean') {
      return tileResult.isCorridor;
    }

    // Otherwise check shape structure
    const shapeStr = tileResult?.shape?.shape;
    if (!shapeStr || typeof shapeStr !== 'string') return false;

    return shapeStr.includes('corridor') || shapeStr === 'corridor_dead_end';
  };

  return {
    roomEvents,
    setRoomEvents,
    tileResult,
    setTileResult,
    roomDetails,
    setRoomDetails,
    bossCheckResult,
    setBossCheckResult,
    autoPlacedRoom,
    setAutoPlacedRoom,
    addRoomEvent,
    generateTile,
    clearTile,
    isCorridor,
    processContents,
    applyContentChoice
  };
}
