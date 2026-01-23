/**
 * Schema Index - Central export for all game data schemas and data
 * Import from this file to access all schema-validated game data
 */

// Schemas
export * from './class.js';
export * from './monster.js';
export * from './spell.js';
export * from './equipment.js';
export * from './combatModifiers.js';
export * from './environment.js';

// Data
export * from './classData.js';
export * from './monsterData.js';
export * from './spellData.js';
export * from './equipmentData.js';
export * from './traitData.js';
export * from './scrollData.js';
export * from './roomData.js';
export * from './treasureData.js';

// Default imports for convenience
import classData from './classData.js';
import monsterData from './monsterData.js';
import spellData from './spellData.js';
import equipmentData from './equipmentData.js';
import traitData from './traitData.js';
import scrollData from './scrollData.js';
import roomData from './roomData.js';
import treasureData from './treasureData.js';

/**
 * All game data in one object for convenience
 */
export const GameData = {
  classes: classData,
  monsters: monsterData,
  spells: spellData,
  equipment: equipmentData,
  traits: traitData,
  scrolls: scrollData,
  rooms: roomData,
  treasure: treasureData
};

/**
 * Quick access functions
 */
export function getClass(id) {
  return classData.getClass(id);
}

export function getMonster(id) {
  return monsterData.getMonster(id);
}

export function getSpell(id) {
  return spellData.getSpell(id);
}

export function getEquipment(key) {
  return equipmentData.getEquipment(key);
}

export function getTrait(classKey, traitKey) {
  return traitData.getTrait(classKey, traitKey);
}

export function getScroll(key) {
  return scrollData.getScroll(key);
}

export function getTrap(trapType) {
  return roomData.getTrap(trapType);
}

export default GameData;
