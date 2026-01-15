/**
 * Combat Actions - Attack, defense, saves, fleeing, and initiative
 */
import { d6, explodingD6 } from "../dice.js";
import { calculateEquipmentBonuses } from "../../data/equipment.js";
import {
  getSaveThreshold,
  getSaveModifier,
  rollSave,
} from "../../data/saves.js";
import { getTier } from "../../data/classes.js";
import {
  checkMinorFoeMorale,
  checkMajorFoeLevelReduction,
} from "./monsterActions.js";

/**
 * Calculate basic attack result (for simple attacks)
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Target foe level
 * @returns {object} Attack result
 */
export const calculateAttack = (hero, foeLevel) => {
  const roll = d6();
  let mod = 0;

  // Class-specific attack bonuses
  if (["warrior", "barbarian", "elf", "dwarf"].includes(hero.key)) {
    mod = hero.lvl;
  } else if (hero.key === "cleric") {
    mod = Math.floor(hero.lvl / 2);
  }
  // Rogue gets +L when outnumbered (handled separately)

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  mod += equipBonus.attackMod;

  const total = roll + mod;
  const hits = roll === 1 ? 0 : Math.floor(total / foeLevel);
  const exploded = roll === 6;

  return {
    roll,
    mod,
    total,
    hits,
    exploded,
    message: `${hero.name}: ${roll}+${mod}=${total} vs L${foeLevel} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${exploded ? " 💥EXPLODE" : ""}`,
  };
};

/**
 * Calculate enhanced attack with exploding dice (for Major Foes)
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Target foe level
 * @param {object} options - Combat options (dualWielding, blessed, rage, etc.)
 * @returns {object} Attack result
 */
export const calculateEnhancedAttack = (hero, foeLevel, options = {}) => {
  const { total, rolls, exploded } = explodingD6();
  let mod = 0;
  const modifiers = [];

  // Class-specific attack bonuses
  if (["warrior", "barbarian", "paladin", "assassin"].includes(hero.key)) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (class)`);
  } else if (hero.key === "elf" && !options.using2H) {
    // Elf gets +L but not with 2H weapons
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (elf)`);
  } else if (hero.key === "dwarf" && options.melee) {
    // Dwarf gets +L melee only
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (melee)`);
  } else if (hero.key === "halfling" && options.usingSling) {
    // Halfling gets +L with sling
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (sling)`);
  } else if (hero.key === "cleric") {
    mod += Math.floor(hero.lvl / 2);
    modifiers.push(`+${Math.floor(hero.lvl / 2)} (cleric)`);
  } else if (
    ["druid", "acrobat", "gnome", "swashbuckler", "bulwark"].includes(hero.key)
  ) {
    // These classes get +½L
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  } else if (hero.key === "ranger") {
    // Ranger gets +L base
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (ranger)`);
  } else if (hero.key === "kukla" && options.lightBlade) {
    // Kukla gets +1 with light blades
    mod += 1;
    modifiers.push(`+1 (light blade)`);
  } else if (hero.key === "lightGladiator" && options.lightWeapon) {
    // Light Gladiator gets +½L with light weapons only
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (light)`);
  } else if (hero.key === "mushroomMonk") {
    // Mushroom Monk gets +L martial, +½L other
    if (options.martialWeapon) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (martial)`);
    } else {
      const bonus = Math.floor(hero.lvl / 2);
      mod += bonus;
      modifiers.push(`+${bonus} (½L)`);
    }
  } else if (hero.key === "rogue" && options.rogueOutnumbers) {
    // Rogue gets +L when outnumbered
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (outnumbered)`);
  }

  // Dual wield bonus (Ranger, Swashbuckler, Light Gladiator)
  if (options.dualWielding) {
    if (hero.key === "ranger" || hero.key === "lightGladiator") {
      const dualBonus = Math.floor(hero.lvl / 2);
      mod += dualBonus;
      modifiers.push(`+${dualBonus} (dual wield)`);
    } else if (hero.key === "swashbuckler") {
      // Swashbuckler dual wield is built into base attack
      modifiers.push("(dual wield)");
    }
  }

  // Ranger sworn enemy
  if (options.swornEnemy && hero.key === "ranger") {
    mod += 2;
    modifiers.push("+2 (sworn enemy)");
  }

  // Assassin hide in shadows (3x damage = +2L to attack)
  if (options.hiddenStrike && hero.key === "assassin") {
    mod += hero.lvl * 2;
    modifiers.push(`+${hero.lvl * 2} (3x dmg)`);
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod !== 0) {
    mod += equipBonus.attackMod;
    modifiers.push(
      `${equipBonus.attackMod >= 0 ? "+" : ""}${equipBonus.attackMod} (equip)`,
    );
  }

  // Rage bonus
  if (options.rageActive && hero.key === "barbarian") {
    mod += 2;
    modifiers.push("+2 (rage)");
  }

  // Blessed bonus
  if (options.blessed) {
    mod += 1;
    modifiers.push("+1 (blessed)");
  }

  // Bulwark ranged bonus (uses Tier instead of level)
  if (options.ranged && hero.key === "bulwark") {
    const tier = getTier(hero.lvl);
    mod += tier;
    modifiers.push(`+${tier} (tier ranged)`);
  }

  const finalTotal = total + mod;
  const hits = rolls[0] === 1 ? 0 : Math.floor(finalTotal / foeLevel); // Natural 1 always misses

  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";

  return {
    rolls,
    total,
    mod,
    finalTotal,
    hits,
    exploded,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foeLevel} → ${hits > 0 ? hits + " kill(s)" : "Miss"}${exploded ? " 💥EXPLODED!" : ""}`,
  };
};

/**
 * Calculate multi-kill against Minor Foes (Vermin/Minions)
 * Per 4AD rules: Attack roll ÷ Foe Level = number of foes killed
 * @param {number} attackTotal - Total attack roll (with modifiers)
 * @param {number} foeLevel - Level of the Minor Foes
 * @param {number} foeCount - Number of foes remaining
 * @returns {object} { kills, message }
 */
export const calculateMinorFoeKills = (attackTotal, foeLevel, foeCount) => {
  // Natural 1 always misses
  if (attackTotal < foeLevel) {
    return { kills: 0, message: "Miss!" };
  }

  // Number killed = attack total ÷ foe level (rounded down)
  const potentialKills = Math.floor(attackTotal / foeLevel);
  const actualKills = Math.min(potentialKills, foeCount);

  return {
    kills: actualKills,
    potentialKills,
    message:
      actualKills > 1
        ? `${actualKills} foes slain!`
        : actualKills === 1
          ? "1 foe slain!"
          : "Miss!",
  };
};

/**
 * Attack Minor Foe with multi-kill calculation
 * @param {object} hero - Attacking hero
 * @param {object} foe - Minor foe group
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const attackMinorFoe = (hero, foe, options = {}) => {
  const { total, rolls, exploded } = explodingD6();
  let mod = 0;
  const modifiers = [];

  // Class-specific attack bonuses
  if (["warrior", "barbarian", "paladin", "assassin"].includes(hero.key)) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (class)`);
  } else if (hero.key === "elf" && !options.using2H) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (elf)`);
  } else if (hero.key === "dwarf" && options.melee) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (melee)`);
  } else if (hero.key === "halfling" && options.usingSling) {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (sling)`);
  } else if (hero.key === "cleric") {
    // Clerics get +L vs undead
    const isUndead = foe.special?.includes("undead");
    if (isUndead) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (vs undead)`);
    } else {
      mod += Math.floor(hero.lvl / 2);
      modifiers.push(`+${Math.floor(hero.lvl / 2)} (cleric)`);
    }
  } else if (
    ["druid", "acrobat", "gnome", "swashbuckler", "bulwark"].includes(hero.key)
  ) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  } else if (hero.key === "ranger") {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (ranger)`);
  } else if (hero.key === "kukla" && options.lightBlade) {
    mod += 1;
    modifiers.push(`+1 (light blade)`);
  } else if (hero.key === "lightGladiator" && options.lightWeapon) {
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (light)`);
  } else if (hero.key === "mushroomMonk") {
    if (options.martialWeapon) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (martial)`);
    } else {
      const bonus = Math.floor(hero.lvl / 2);
      mod += bonus;
      modifiers.push(`+${bonus} (½L)`);
    }
  } else if (hero.key === "rogue") {
    // Rogue gets +L when attacking outnumbered Minor Foes
    if (options.rogueOutnumbers) {
      mod += hero.lvl;
      modifiers.push(`+${hero.lvl} (outnumbered)`);
    }
  }

  // Dual wield bonus
  if (options.dualWielding) {
    if (hero.key === "ranger" || hero.key === "lightGladiator") {
      const dualBonus = Math.floor(hero.lvl / 2);
      mod += dualBonus;
      modifiers.push(`+${dualBonus} (dual wield)`);
    }
  }

  // Ranger sworn enemy
  if (options.swornEnemy && hero.key === "ranger") {
    mod += 2;
    modifiers.push("+2 (sworn enemy)");
  }

  // Assassin hide in shadows
  if (options.hiddenStrike && hero.key === "assassin") {
    mod += hero.lvl * 2;
    modifiers.push(`+${hero.lvl * 2} (3x dmg)`);
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.attackMod !== 0) {
    mod += equipBonus.attackMod;
    modifiers.push(
      `${equipBonus.attackMod >= 0 ? "+" : ""}${equipBonus.attackMod} (equip)`,
    );
  }

  // Rage bonus
  if (options.rageActive && hero.key === "barbarian") {
    mod += 2;
    modifiers.push("+2 (rage)");
  }

  // Blessed bonus
  if (options.blessed) {
    mod += 1;
    modifiers.push("+1 (blessed)");
  }

  // Bulwark ranged bonus
  if (options.ranged && hero.key === "bulwark") {
    const tier = getTier(hero.lvl);
    mod += tier;
    modifiers.push(`+${tier} (tier ranged)`);
  }

  const finalTotal = total + mod;

  // Calculate multi-kill
  const killResult = calculateMinorFoeKills(
    finalTotal,
    foe.level,
    foe.count || 1,
  );

  const rollStr = exploded ? `[${rolls.join("+")}]` : `${total}`;
  const modStr = modifiers.length > 0 ? ` ${modifiers.join(" ")}` : "";

  return {
    rolls,
    total,
    mod,
    finalTotal,
    kills: killResult.kills,
    exploded,
    isMinorFoe: true,
    message: `${hero.name}: ${rollStr}${modStr}=${finalTotal} vs L${foe.level} → ${killResult.message}${exploded ? " 💥EXPLODED!" : ""}`,
  };
};

/**
 * Calculate defense result
 * @param {object} hero - Hero object
 * @param {number} foeLevel - Attacking foe level
 * @param {object} options - Additional options (largeEnemy, parry, etc.)
 * @returns {object} Defense result
 */
export const calculateDefense = (hero, foeLevel, options = {}) => {
  const roll = d6();
  let mod = 0;
  const modifiers = [];

  // Class-specific defense bonuses
  if (hero.key === "rogue") {
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (rogue)`);
  } else if (hero.key === "halfling" && options.largeEnemy) {
    // Halfling gets +L vs large enemies
    mod += hero.lvl;
    modifiers.push(`+${hero.lvl} (vs large)`);
  } else if (hero.key === "dwarf" && options.largeEnemy) {
    // Dwarf gets +1 vs large enemies
    mod += 1;
    modifiers.push("+1 (vs large)");
  } else if (
    [
      "acrobat",
      "swashbuckler",
      "bulwark",
      "gnome",
      "kukla",
      "lightGladiator",
      "mushroomMonk",
    ].includes(hero.key)
  ) {
    // These classes get +½L to defense
    const bonus = Math.floor(hero.lvl / 2);
    mod += bonus;
    modifiers.push(`+${bonus} (½L)`);
  }

  // Parry (Light Gladiator)
  if (options.parry && hero.key === "lightGladiator") {
    mod += 2;
    modifiers.push("+2 (parry)");
  }

  // Panache dodge (Swashbuckler)
  if (options.panacheDodge) {
    mod += 2;
    modifiers.push("+2 (panache)");
  }

  // Acrobat trick
  if (options.acrobatTrick) {
    mod += 2;
    modifiers.push("+2 (trick)");
  }

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  if (equipBonus.defenseMod !== 0) {
    mod += equipBonus.defenseMod;
    modifiers.push(
      `${equipBonus.defenseMod >= 0 ? "+" : ""}${equipBonus.defenseMod} (equip)`,
    );
  }

  const total = roll + mod;
  const blocked = total > foeLevel;

  const modStr = modifiers.length > 0 ? ` (${modifiers.join(" ")})` : "";

  return {
    roll,
    mod,
    total,
    blocked,
    damage: blocked ? 0 : 1,
    message: `${hero.name} DEF: ${roll}${modStr}=${total} vs L${foeLevel} → ${blocked ? "Block!" : "HIT -1 Life"}`,
  };
};

/**
 * Perform a save roll when taking lethal damage
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero taking damage
 * @param {number} heroIdx - Hero index in party
 * @param {string} damageSource - Source of damage (trap type, monster type)
 * @returns {object} Save result
 */
export const performSaveRoll = (
  dispatch,
  hero,
  heroIdx,
  damageSource = "default",
) => {
  const threshold = getSaveThreshold(damageSource);
  const { bonus, reasons } = getSaveModifier(hero);

  // Equipment bonuses
  const equipBonus = calculateEquipmentBonuses(hero);
  const totalBonus = bonus + equipBonus.saveMod;
  const allReasons = [...reasons];
  if (equipBonus.saveMod !== 0) {
    allReasons.push(
      `${equipBonus.saveMod >= 0 ? "+" : ""}${equipBonus.saveMod} equip`,
    );
  }

  const result = rollSave(threshold, totalBonus);

  const modStr = allReasons.length > 0 ? ` (${allReasons.join(", ")})` : "";

  if (result.success) {
    // Survived - set to 1 HP and mark as wounded
    dispatch({ type: "UPD_HERO", i: heroIdx, u: { hp: 1 } });
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "wounded",
      value: true,
    });
    dispatch({ type: "LOG", t: `💀 ${hero.name} makes a SAVE ROLL!${modStr}` });
    dispatch({ type: "LOG", t: `✅ ${result.message}` });
  } else {
    // Dead - set to 0 HP and mark as dead
    dispatch({ type: "UPD_HERO", i: heroIdx, u: { hp: 0 } });
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "dead",
      value: true,
    });
    dispatch({ type: "LOG", t: `💀 ${hero.name} makes a SAVE ROLL!${modStr}` });
    dispatch({ type: "LOG", t: `❌ ${result.message}` });
  }

  return result;
};

/**
 * Use Cleric Blessing to re-roll a save
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Cleric's index
 * @param {object} targetHero - Hero who needs re-roll
 * @param {number} targetIdx - Target hero's index
 * @param {string} damageSource - Original damage source
 * @returns {object} New save result
 */
export const useBlessingForSave = (
  dispatch,
  heroIdx,
  targetHero,
  targetIdx,
  damageSource = "default",
) => {
  dispatch({ type: "USE_BLESS", heroIdx });
  dispatch({ type: "LOG", t: `🙏 Cleric uses Blessing to grant a re-roll!` });

  return performSaveRoll(dispatch, targetHero, targetIdx, damageSource);
};

/**
 * Use Halfling Luck to re-roll a save
 * @param {function} dispatch - Reducer dispatch function
 * @param {number} heroIdx - Halfling's index
 * @param {object} hero - Halfling hero
 * @param {string} damageSource - Original damage source
 * @returns {object} New save result
 */
export const useLuckForSave = (
  dispatch,
  heroIdx,
  hero,
  damageSource = "default",
) => {
  dispatch({ type: "USE_LUCK", heroIdx });
  dispatch({ type: "LOG", t: `🍀 Halfling uses Luck to re-roll!` });

  return performSaveRoll(dispatch, hero, heroIdx, damageSource);
};

/**
 * Attempt to flee from combat
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Hero attempting to flee
 * @param {number} heroIdx - Hero index
 * @param {number} monsterLevel - Monster level to flee from
 * @returns {object} Flee result
 */
export const attemptFlee = (dispatch, hero, heroIdx, monsterLevel) => {
  const roll = d6();
  let mod = 0;

  // Rogue and Halfling get bonuses to flee
  if (hero.key === "rogue") mod = hero.lvl;
  if (hero.key === "halfling") mod = Math.floor(hero.lvl / 2);

  const total = roll + mod;
  const success = total > monsterLevel;

  if (success) {
    dispatch({
      type: "LOG",
      t: `🏃 ${hero.name} escapes! (${roll}+${mod}=${total} vs L${monsterLevel})`,
    });
  } else {
    // Failed flee = free attack from monsters
    dispatch({
      type: "LOG",
      t: `❌ ${hero.name} fails to escape! (${roll}+${mod}=${total} vs L${monsterLevel})`,
    });
    dispatch({ type: "LOG", t: `⚔️ Monsters get a free attack!` });
  }

  return { success, roll, mod, total, freeAttack: !success };
};

/**
 * Attempt party flee (all must succeed)
 * @param {function} dispatch - Reducer dispatch function
 * @param {array} party - Party array
 * @param {number} monsterLevel - Highest monster level
 * @returns {object} Party flee result
 */
export const attemptPartyFlee = (dispatch, party, monsterLevel) => {
  dispatch({ type: "LOG", t: `🏃 Party attempts to flee!` });

  const results = party
    .filter((h) => h.hp > 0)
    .map((hero, idx) => attemptFlee(dispatch, hero, idx, monsterLevel));

  const allEscaped = results.every((r) => r.success);
  const failedCount = results.filter((r) => !r.success).length;

  if (allEscaped) {
    dispatch({ type: "LOG", t: `✅ Party escapes successfully!` });
    dispatch({ type: "CLEAR_MONSTERS" });
  } else {
    dispatch({
      type: "LOG",
      t: `❌ ${failedCount} hero(es) failed to escape!`,
    });
  }

  return { allEscaped, results, failedCount };
};

/**
 * Determine initiative for combat
 * Per 4AD rules:
 * - If party attacks immediately: Party goes first (ranged/spells before melee)
 * - If party waits for reaction: Based on reaction roll
 * - Surprise: Monsters go first
 * @param {object} options - Initiative options
 * @returns {object} Initiative result with order and reason
 */
export const determineInitiative = (options = {}) => {
  const { partyAttacksFirst, reaction, isSurprise, hasRanged, hasSpells } =
    options;

  // Surprise always gives monsters first attack
  if (isSurprise) {
    return {
      order: ["monster_ranged", "party_ranged", "monster_melee", "party_melee"],
      monsterFirst: true,
      reason: "Monsters surprise the party!",
    };
  }

  // Party attacks immediately
  if (partyAttacksFirst) {
    return {
      order: [
        "party_ranged",
        "party_spells",
        "monster_ranged",
        "party_melee",
        "monster_melee",
      ],
      monsterFirst: false,
      reason: "Party attacks first!",
    };
  }

  // Reaction-based initiative
  if (reaction) {
    const reactionKey = reaction.reactionKey || reaction;
    // This would need REACTION_TYPES import if we have it
    // For now, check hostile property
    if (reaction.hostile === true) {
      // Fight or Fight to the Death - monsters go first
      return {
        order: [
          "party_ranged",
          "party_spells",
          "monster_ranged",
          "monster_melee",
          "party_melee",
        ],
        monsterFirst: true,
        reason: `${reaction.name || reactionKey}: Monsters attack first!`,
      };
    }
  }

  // Default: party first (ranged/spells, then melee alternating)
  return {
    order: [
      "party_ranged",
      "party_spells",
      "monster_ranged",
      "party_melee",
      "monster_melee",
    ],
    monsterFirst: false,
    reason: "Standard initiative",
  };
};

/**
 * Process a full attack against a Minor Foe group with multi-kill and morale
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Attacking hero
 * @param {number} heroIdx - Hero index
 * @param {object} foe - Minor foe group
 * @param {number} foeIdx - Foe index in monsters array
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const processMinorFoeAttack = (
  dispatch,
  hero,
  heroIdx,
  foe,
  foeIdx,
  options = {},
) => {
  // Perform the attack
  const attackResult = attackMinorFoe(hero, foe, options);

  dispatch({ type: "LOG", t: attackResult.message });

  // Clear blessed status after use
  if (options.blessed) {
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "blessed",
      value: false,
    });
  }

  if (attackResult.kills > 0) {
    // Update foe count
    const newCount = Math.max(0, (foe.count || 1) - attackResult.kills);
    const initialCount = foe.initialCount || foe.count || 1;

    dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { count: newCount } });

    if (newCount === 0) {
      dispatch({ type: "LOG", t: `💀 All ${foe.name} defeated!` });
    } else {
      dispatch({
        type: "LOG",
        t: `💀 ${attackResult.kills} ${foe.name} killed! ${newCount} remaining.`,
      });

      // Check morale if not already checked this encounter
      if (!foe.moraleChecked) {
        const moraleResult = checkMinorFoeMorale(foe, initialCount, newCount);

        if (moraleResult.checked) {
          dispatch({ type: "LOG", t: moraleResult.message });
          dispatch({
            type: "UPD_MONSTER",
            i: foeIdx,
            u: { moraleChecked: true },
          });

          if (moraleResult.fled) {
            // Foes flee - mark as defeated but no treasure
            dispatch({
              type: "UPD_MONSTER",
              i: foeIdx,
              u: { count: 0, fled: true },
            });
            dispatch({ type: "LOG", t: `🏃 The remaining ${foe.name} flee!` });
          }
        }
      }
    }
  }

  return attackResult;
};

/**
 * Process attack against a Major Foe with level reduction check
 * @param {function} dispatch - Reducer dispatch function
 * @param {object} hero - Attacking hero
 * @param {number} heroIdx - Hero index
 * @param {object} foe - Major foe
 * @param {number} foeIdx - Foe index
 * @param {object} options - Combat options
 * @returns {object} Attack result
 */
export const processMajorFoeAttack = (
  dispatch,
  hero,
  heroIdx,
  foe,
  foeIdx,
  options = {},
) => {
  // Use existing enhanced attack
  const attackResult = calculateEnhancedAttack(hero, foe.level, options);

  dispatch({ type: "LOG", t: attackResult.message });

  // Clear blessed status after use
  if (options.blessed) {
    dispatch({
      type: "SET_HERO_STATUS",
      heroIdx,
      statusKey: "blessed",
      value: false,
    });
  }

  if (attackResult.hits > 0) {
    const newHP = Math.max(0, foe.hp - attackResult.hits);
    dispatch({ type: "UPD_MONSTER", i: foeIdx, u: { hp: newHP } });

    if (newHP === 0) {
      dispatch({ type: "LOG", t: `💀 ${foe.name} defeated!` });
    } else {
      dispatch({
        type: "LOG",
        t: `⚔️ ${foe.name} takes ${attackResult.hits} damage! (${newHP}/${foe.maxHp} HP)`,
      });

      // Check for level reduction at half HP
      const levelCheck = checkMajorFoeLevelReduction({ ...foe, hp: newHP });
      if (levelCheck.shouldReduce) {
        dispatch({
          type: "UPD_MONSTER",
          i: foeIdx,
          u: { level: levelCheck.newLevel, levelReduced: true },
        });
        dispatch({ type: "LOG", t: levelCheck.message });
      }
    }
  }

  return attackResult;
};
