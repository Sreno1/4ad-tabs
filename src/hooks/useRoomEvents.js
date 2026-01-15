import { useState } from 'react';
import { d66, d6, r2d6 } from '../utils/dice.js';
import { TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE, SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS, checkForBoss } from '../data/rooms.js';
import { spawnMonster, rollTreasure, spawnMajorFoe } from '../utils/gameActions.js';
import { ACTION_MODES, EVENT_TYPES } from '../constants/gameConstants.js';

export function useRoomEvents(state, dispatch, setActionMode) {
  const [roomEvents, setRoomEvents] = useState([]);
  const [tileResult, setTileResult] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [bossCheckResult, setBossCheckResult] = useState(null);

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

    switch (contents.type) {
      case 'empty':
        newEvents.push({ type: EVENT_TYPES.EMPTY, data: {}, timestamp: Date.now() });
        setActionMode(ACTION_MODES.EMPTY);
        dispatch({ type: 'LOG', t: `The room is empty.` });
        break;

      case 'vermin':
        spawnMonster(dispatch, 'vermin', 1);
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'vermin', level: 1 }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;

      case 'minions':
        spawnMonster(dispatch, 'minion', 2);
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'minions', level: 2 }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;

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
        dispatch({ type: 'LOG', t: `✨ Special Feature! ${special.name}` });
        dispatch({ type: 'LOG', t: `📜 ${special.description}` });
        setActionMode(ACTION_MODES.SPECIAL);
        break;
      }

      case 'weird_monster':
        dispatch({ type: 'LOG', t: `👾 Weird Monster! Roll on the Weird Monster table.` });
        const weirdDetails = { type: 'weird_monster' };
        setRoomDetails(weirdDetails);
        newEvents.push({ type: EVENT_TYPES.WEIRD, data: weirdDetails, timestamp: Date.now() });
        setActionMode(ACTION_MODES.WEIRD);
        break;

      case 'minor_boss':
        spawnMonster(dispatch, 'boss', 3);
        dispatch({ type: 'MINOR' });
        dispatch({ type: 'LOG', t: `⚔️ Minor Boss appears! (Level 3)` });
        newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'boss', level: 3, isBoss: false }, timestamp: Date.now() });
        setActionMode(ACTION_MODES.COMBAT);
        break;

      case 'major_foe': {
        const bossRoll = d6();
        const bossResult = checkForBoss(state.majorFoes || 0, bossRoll);
        setBossCheckResult(bossResult);
        dispatch({ type: 'LOG', t: `🎲 Boss Check: ${bossResult.message}` });
        newEvents.push({ type: EVENT_TYPES.BOSS_CHECK, data: bossResult, timestamp: Date.now() });

        if (bossResult.isBoss) {
          spawnMajorFoe(dispatch, state.hcl, true);
          dispatch({ type: 'BOSS' });
          dispatch({ type: 'LOG', t: `👑 THE BOSS APPEARS! (+1 Life, +1 Attack, 3x Treasure)` });
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'boss', level: state.hcl, isBoss: true }, timestamp: Date.now() });
        } else {
          spawnMajorFoe(dispatch, state.hcl, false);
          dispatch({ type: 'MAJOR' });
          dispatch({ type: 'LOG', t: `⚔️ Major Foe appears! (Level ${state.hcl})` });
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'major', level: state.hcl, isBoss: false }, timestamp: Date.now() });
        }
        setActionMode(ACTION_MODES.COMBAT);
        break;
      }

      case 'quest_room':
        dispatch({ type: 'LOG', t: `🏆 Quest Room / Final Room! The dungeon's objective is here.` });
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
    const contentsRoll = r2d6();
    const contentsResult = TILE_CONTENTS_TABLE[contentsRoll];

    dispatch({ type: 'LOG', t: `🎲 NEW TILE: Shape d66=${shapeRoll}, Contents 2d6=${contentsRoll}` });
    dispatch({ type: 'LOG', t: `📐 ${shapeResult.description} | Doors: ${shapeResult.doors}` });
    dispatch({ type: 'LOG', t: `📦 ${contentsResult.description}` });

    const result = {
      shape: { roll: shapeRoll, ...shapeResult },
      contents: { roll: contentsRoll, ...contentsResult }
    };

    // Reset room state for new tile
    setTileResult(result);
    setRoomDetails(null);
    setBossCheckResult(null);
    setRoomEvents([]); // Clear events for new room

    // Add tile generated event
    const newEvents = [{
      type: EVENT_TYPES.TILE_GENERATED,
      data: result,
      timestamp: Date.now()
    }];

    // Process contents and add events
    processContents(contentsResult, newEvents);
  };

  // Clear the current tile result and return to idle
  const clearTile = () => {
    setTileResult(null);
    setRoomDetails(null);
    setBossCheckResult(null);
    setRoomEvents([]);
    setActionMode(ACTION_MODES.IDLE);
  };

  // Helper: Check if tile is a corridor
  const isCorridor = () => {
    return tileResult?.shape?.shape?.includes('corridor') || tileResult?.shape?.shape === 'corridor_dead_end';
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
    addRoomEvent,
    generateTile,
    clearTile,
    isCorridor,
    processContents
  };
}
