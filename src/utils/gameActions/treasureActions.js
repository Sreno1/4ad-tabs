/**
 * Treasure Actions - Rolling treasure and searching
 */
import { d6, r2d6 } from '../dice.js';
import { formatRollPrefix } from '../rollLog.js';
import { SCROLLS, generateRandomScroll } from '../../data/scrolls.js';
import { ASSIGN_TREASURE, SHOW_MODAL } from '../../state/actions.js';
import { normalizeEnvironment } from '../../constants/environmentConstants.js';

const RARE_MUSHROOM_TABLE = [
  '',
  'Slumber Amanita',
  'Puffball Smokebomb',
  'Brown Cap Delight',
  'Phoenix Mushroom',
  'Purple Truffle',
  "Healer's Chanterelle"
];

const DUNGEON_MAGIC_TREASURE_TABLE = [
  '',
  'Wand of Sleep (3 charges)',
  'Ring of Teleportation',
  "Fool's Gold",
  'Magic Weapon (+1)',
  'Potion of Healing',
  'Fireball Staff (2 charges)'
];

const CAVERNS_SPECIAL_ITEM_TABLE = [
  '',
  'Small gemstone (3d6+3 gp)',
  'Glittering Crystal',
  'Map Fragment',
  "Adventurer's Dead Body (gear cache)",
  "Miners' Ointment",
  "Miners' Amulet"
];

const FUNGAL_RARE_ITEM_TABLE = [
  '',
  'Small gemstone (2d6+2 gp) or Leafsteel Armor',
  "Xicthul's Cap",
  'Red Death',
  "Adventurer's Dead Body (gear cache)",
  "Mushroom Gatherer\'s Basket",
  'Morel Crusher'
];

const rollXd6 = (count) => {
  let total = 0;
  for (let i = 0; i < count; i++) total += d6();
  return total;
};

const applyGoldModifiers = (gold, multiplier, minGold) => {
  let total = gold * multiplier;
  if (minGold > 0 && total < minGold) total = minGold;
  return total;
};

const getScrollName = (scrollKey) => {
  if (!scrollKey) return 'Scroll';
  return SCROLLS[scrollKey]?.name || 'Scroll';
};

export const rollRareMushroomTable = (dispatch = null) => {
  const roll = d6();
  const item = RARE_MUSHROOM_TABLE[roll] || 'Rare Mushroom';
  if (dispatch) {
    const logText = `${formatRollPrefix(roll)}Rare Mushroom: ${item}`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
  }
  return { roll, item };
};

const rollDungeonMagicTreasure = (environmentKey) => {
  const roll = d6();
  if (environmentKey === 'fungal_grottoes' && roll === 6) {
    const mushroom = rollRareMushroomTable();
    return { roll, item: `Rare Mushroom: ${mushroom.item}`, detail: mushroom };
  }
  return { roll, item: DUNGEON_MAGIC_TREASURE_TABLE[roll] || 'Magic Treasure' };
};

const rollCavernsSpecialItem = () => {
  const roll = d6();
  return { roll, item: CAVERNS_SPECIAL_ITEM_TABLE[roll] || 'Special Item' };
};

const rollFungalRareItem = () => {
  const roll = d6();
  return { roll, item: FUNGAL_RARE_ITEM_TABLE[roll] || 'Rare Item' };
};

/**
 * Roll on treasure table and award result
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} options - Optional params { multiplier, minGold, environment }
 * @returns {object} Treasure result
 */
export const rollTreasure = (dispatch, options = {}) => {
  const { multiplier = 1, minGold = 0, environment } = options;
  const envKey = normalizeEnvironment(environment);
  const roll = d6();

  if (roll === 1) {
    const logText = `${formatRollPrefix(roll)}Treasure: No treasure found.`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 3000 });
    return { roll, type: 'none' };
  }

  if (roll === 2) {
    if (envKey === 'fungal_grottoes') {
      const foodRoll = r2d6();
      const mushroom = rollRareMushroomTable();
      const logText = `${formatRollPrefix(roll)}Treasure: 2d6 food rations (${foodRoll}) or Rare Mushroom (${mushroom.item}).`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      return { roll, type: 'food_or_mushroom', food: foodRoll, mushroom };
    }

    const baseGold = r2d6();
    const gold = applyGoldModifiers(baseGold, multiplier, minGold);
    const multiplierText = multiplier > 1 ? ` (x${multiplier})` : '';
    const minText = minGold > 0 && gold === minGold ? ` (min ${minGold}gp)` : '';
    dispatch({ type: ASSIGN_TREASURE, amount: gold });
    const logText = `${formatRollPrefix(roll)}Treasure: Found ${gold} gp!${multiplierText}${minText}`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'success', autoClose: 4000 });
    return { roll, type: 'gold', amount: gold, multiplier };
  }

  if (roll === 3) {
    if (envKey === 'dungeon') {
      const scrollKey = generateRandomScroll('wizard');
      const logText = `${formatRollPrefix(roll)}Treasure: ${getScrollName(scrollKey)}.`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      return { roll, type: 'scroll', scrollKey };
    }

    if (envKey === 'caverns') {
      const scrollKey = generateRandomScroll('illusionist');
      const logText = `${formatRollPrefix(roll)}Treasure: ${getScrollName(scrollKey)}.`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      return { roll, type: 'scroll', scrollKey };
    }

    const scrollKey = generateRandomScroll('druid');
    const mushroom = rollRareMushroomTable();
    const logText = `${formatRollPrefix(roll)}Treasure: Choose ${getScrollName(scrollKey)} or Rare Mushroom (${mushroom.item}).`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
    return { roll, type: 'scroll_or_mushroom', scrollKey, mushroom };
  }

  if (roll === 4) {
    const baseGold = envKey === 'caverns'
      ? rollXd6(3) * 5
      : r2d6() * 5;
    const gold = applyGoldModifiers(baseGold, multiplier, minGold);
    const multiplierText = multiplier > 1 ? ` (x${multiplier})` : '';
    const minText = minGold > 0 && gold === minGold ? ` (min ${minGold}gp)` : '';
    dispatch({ type: ASSIGN_TREASURE, amount: gold });
    const logText = `${formatRollPrefix(roll)}Treasure: Gem worth ${gold} gp!${multiplierText}${minText}`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'success', autoClose: 4000 });
    return { roll, type: 'gem', amount: gold, multiplier };
  }

  if (roll === 5) {
    if (envKey === 'caverns') {
      const baseGold = rollXd6(3) * 10;
      const gold = applyGoldModifiers(baseGold, multiplier, minGold);
      const logText = `${formatRollPrefix(roll)}Treasure: Choose gem worth ${gold} gp or a prism with a random illusionist spell.`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      dispatch({ type: ASSIGN_TREASURE, amount: gold });
      return { roll, type: 'gem_or_prism', amount: gold };
    }

    if (envKey === 'fungal_grottoes') {
      const baseGold = r2d6() * 10;
      const gold = applyGoldModifiers(baseGold, multiplier, minGold);
      const logText = `${formatRollPrefix(roll)}Treasure: Choose gem worth ${gold} gp or 3 rolls on the Rare Mushroom table.`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      dispatch({ type: ASSIGN_TREASURE, amount: gold });
      return { roll, type: 'gem_or_mushrooms', amount: gold };
    }

    const baseGold = rollXd6(3) * 10;
    const gold = applyGoldModifiers(baseGold, multiplier, minGold);
    const multiplierText = multiplier > 1 ? ` (x${multiplier})` : '';
    const minText = minGold > 0 && gold === minGold ? ` (min ${minGold}gp)` : '';
    dispatch({ type: ASSIGN_TREASURE, amount: gold });
    const logText = `${formatRollPrefix(roll)}Treasure: Chest worth ${gold} gp!${multiplierText}${minText}`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'success', autoClose: 4000 });
    return { roll, type: 'chest', amount: gold, multiplier };
  }

  if (roll === 6) {
    if (envKey === 'caverns') {
      const item = rollCavernsSpecialItem();
      const logText = `${formatRollPrefix(roll)}Treasure: Caverns special item (${item.item}).`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      return { roll, type: 'special_item', item };
    }

    if (envKey === 'fungal_grottoes') {
      const magic = rollDungeonMagicTreasure(envKey);
      const rareItem = rollFungalRareItem();
      const logText = `${formatRollPrefix(roll)}Treasure: Choose dungeon magic treasure (${magic.item}) or fungal rare item (${rareItem.item}).`;
      dispatch({ type: 'LOG', t: logText });
      dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
      return { roll, type: 'magic_or_rare', magic, rareItem };
    }

    const item = rollDungeonMagicTreasure(envKey);
    const logText = `${formatRollPrefix(roll)}Treasure: ${item.item}.`;
    dispatch({ type: 'LOG', t: logText });
    dispatch({ type: SHOW_MODAL, message: logText, msgType: 'info', autoClose: 4000 });
    return { roll, type: 'magic', item };
  }

  return { roll, type: 'unknown' };
};

/**
 * Preview a treasure roll without dispatching state changes.
 * Useful for abilities that reveal potential treasure (e.g., Dwarf Gold Sense)
 * @returns {object} preview result similar to rollTreasure but without dispatch
 */
export const previewTreasureRoll = (environment = 'dungeon') => {
  const envKey = normalizeEnvironment(environment);
  const roll = d6();

  if (roll === 1) return { roll, type: 'none', label: 'no treasure' };

  if (roll === 2) {
    if (envKey === 'fungal_grottoes') {
      return { roll, type: 'food_or_mushroom', label: 'food rations or rare mushroom' };
    }
    const gold = r2d6();
    return { roll, type: 'gold', amount: gold, label: `${gold} gp` };
  }

  if (roll === 3) {
    return { roll, type: 'scroll', label: envKey === 'fungal_grottoes' ? 'druid scroll or rare mushroom' : 'scroll' };
  }

  if (roll === 4) {
    const gold = envKey === 'caverns' ? rollXd6(3) * 5 : r2d6() * 5;
    return { roll, type: 'gem', amount: gold, label: `gem worth ${gold} gp` };
  }

  if (roll === 5) {
    return { roll, type: 'chest_or_gem', label: envKey === 'dungeon' ? 'treasure chest' : 'gem or special item' };
  }

  return { roll, type: 'magic', label: 'magic treasure' };
};

/**
 * Perform a search action
 * @param {function} dispatch - Reducer dispatch function
 * @returns {object} Search result info
 */
export const performSearch = (dispatch) => {
  const roll = d6();
  let result;

  if (roll <= 1) {
    result = 'Wandering Monsters!';
  } else if (roll <= 4) {
    result = 'Nothing';
  } else {
    result = 'Found! (Clue/Door/Treasure/Passage)';
    dispatch({ type: 'CLUE', n: 1 });
  }

  dispatch({ type: 'LOG', t: `${formatRollPrefix(roll)}Search ${roll}: ${result}` });
  return { roll, result };
};
