import { useState } from 'react';
import { d66, d6, r2d6 } from '../utils/dice.js';
import { TILE_SHAPE_TABLE, TILE_CONTENTS_TABLE, SPECIAL_FEATURE_TABLE, SPECIAL_ROOMS, checkForBoss } from '../data/rooms.js';
import { spawnMonster, rollTreasure, spawnMajorFoe } from "../utils/gameActions/index.js";
import { ACTION_MODES, EVENT_TYPES } from '../constants/gameConstants.js';
import { logMessage } from '../state/actionCreators.js';
import roomLibrary from '../utils/roomLibrary.js';

export function useRoomEvents(state, dispatch, setActionMode) {
  const [roomEvents, setRoomEvents] = useState([]);
  const [tileResult, setTileResult] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [bossCheckResult, setBossCheckResult] = useState(null);
  const [autoPlacedRoom, setAutoPlacedRoom] = useState(null);

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
        dispatch(logMessage(`The room is empty.`, 'exploration'));
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
        } else {
          spawnMajorFoe(dispatch, state.hcl, false);
          dispatch({ type: 'MAJOR' });
          dispatch(logMessage(`Major Foe appears! (Level ${state.hcl})`, 'exploration'));
          newEvents.push({ type: EVENT_TYPES.MONSTER, data: { monsterType: 'major', level: state.hcl, isBoss: false }, timestamp: Date.now() });
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
    const newEvents = [{
      type: 'D66_ROLL',
      data: { roll: shapeRoll },
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
      setAutoPlacedRoom(matchedRoom);
      setRoomEvents(newEvents);
      setTileResult(null);
      setRoomDetails(null);
      setBossCheckResult(null);
      return;
    }

    // No match - still roll 2d6 for contents
    const contentsRoll = r2d6();
    const contentsResult = TILE_CONTENTS_TABLE[contentsRoll];

    newEvents.push({
      type: 'CONTENTS_ROLL',
      data: { roll: contentsRoll, description: contentsResult.description },
      timestamp: Date.now()
    });

    setRoomEvents(newEvents);
    setTileResult(null);
    setRoomDetails(null);
    setBossCheckResult(null);

    // Process contents (spawn monsters, treasure, etc)
    processContents(contentsResult, newEvents);
  };

  // Clear the current tile result and return to idle
  const clearTile = () => {
    setTileResult(null);
    setRoomDetails(null);
    setBossCheckResult(null);
    setRoomEvents([]);
    setAutoPlacedRoom(null);
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
    autoPlacedRoom,
    setAutoPlacedRoom,
    addRoomEvent,
    generateTile,
    clearTile,
    isCorridor,
    processContents
  };
}
