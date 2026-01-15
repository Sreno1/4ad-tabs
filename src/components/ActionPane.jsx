import React, { useState } from "react";
import { Dices } from "lucide-react";
import { d6 } from "../utils/dice.js";
import { rollTreasure, performCastSpell } from "../utils/gameActions/index.js";
import { SPELLS, getAvailableSpells } from "../data/spells.js";
import { COMBAT_PHASES, ACTION_MODES } from "../constants/gameConstants.js";
import EventCard from "./actionPane/EventCard.jsx";
import ActiveMonsters from "./actionPane/ActiveMonsters.jsx";
import CombatInitiative from "./actionPane/CombatInitiative.jsx";
import { PartyTurnPhase, MonsterTurnPhase } from "./actionPane/combat";
import AbilityButtons from "./actionPane/combat/AbilityButtons.jsx";

export default function ActionPane({
  state,
  dispatch,
  actionMode,
  roomEvents,
  tileResult,
  roomDetails,
  generateTile,
  clearTile,
  isCorridor,
  // Combat props
  combatPhase,
  getActiveMonsters,
  isCombatWon,
  handleRollReaction,
  handlePartyAttacks,
  handleEndPartyTurn,
  handleEndMonsterTurn,
  handleEndCombat,
  setCombatPhase,
  setRoomEvents,
  // Modal handlers
  setShowDungeonFeatures,
}) {
  const [showSpells, setShowSpells] = useState(null);
  const [showHealTarget, setShowHealTarget] = useState(null);
  const [showBlessTarget, setShowBlessTarget] = useState(null);
  const [showProtectionTarget, setShowProtectionTarget] = useState(null);

  const activeMonsters = getActiveMonsters();
  const hasActiveMonsters = activeMonsters.length > 0;
  const combatWon = isCombatWon();
  const corridor = isCorridor();

  // Handle spell casting
  const handleCastSpell = (casterIdx, spellKey) => {
    const caster = state.party[casterIdx];
    const spell = SPELLS[spellKey];
    const context = {};

    // Protection spell: open target selection popup
    if (spellKey === "protection") {
      setShowProtectionTarget(casterIdx);
      return;
    }

    // For attack spells, target first alive monster
    if (spell.type === "attack") {
      const activeMonsters = getActiveMonsters();
      if (activeMonsters.length > 0) {
        const targetMonster = activeMonsters[0];
        const targetIdx = state.monsters.findIndex(
          (m) => m.id === targetMonster.id,
        );
        context.targetMonsterIdx = targetIdx;
        context.targetMonster = targetMonster;
        context.targets = [targetMonster];
      }
    }

    // For healing spells, find lowest HP ally
    if (spell.type === "healing") {
      const lowestHP = state.party.reduce(
        (min, h, idx) =>
          h.hp > 0 &&
          h.hp < h.maxHp &&
          (min === null || h.hp < state.party[min].hp)
            ? idx
            : min,
        null,
      );
      if (lowestHP !== null) {
        context.targetHeroIdx = lowestHP;
        context.targetHero = state.party[lowestHP];
        context.targets = [state.party[lowestHP]];
      }
    }

    // Cast the spell
    performCastSpell(dispatch, caster, casterIdx, spellKey, context);

    // Track spell usage
    const abilities = state.abilities?.[casterIdx] || {};
    dispatch({
      type: "SET_ABILITY",
      heroIdx: casterIdx,
      ability: "spellsUsed",
      value: (abilities.spellsUsed || 0) + 1,
    });

    // Close spell selection
    setShowSpells(null);
  };

  // If no tile generated yet, show idle state with Generate Tile button
  if (!tileResult && roomEvents.length === 0) {
    return (
      <div className="space-y-3">
        <div className="bg-slate-800 rounded p-4 text-center">
          <div className="text-slate-400 text-sm mb-3">Ready to explore</div>
          <button
            onClick={generateTile}
            className="w-full bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 px-4 py-3 rounded font-bold text-sm flex items-center justify-center gap-2"
          >
            <Dices size={18} /> Generate Tile
          </button>
          <div className="text-slate-500 text-xs mt-2">
            Rolls d66 for shape + 2d6 for contents
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Room Events Stack - shows all events that happened in this room */}
      <div className="space-y-1">
        {roomEvents.map((event, index) => (
          <EventCard key={index} event={event} index={index} />
        ))}
      </div>

      {/* COMBAT MODE - Show when monsters are active */}
      {hasActiveMonsters && (
        <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
          {/* Active Monsters Section */}
          <ActiveMonsters
            activeMonsters={activeMonsters}
            state={state}
            dispatch={dispatch}
            corridor={corridor}
          />

          {/* Initiative Section */}
          <CombatInitiative
            combatPhase={combatPhase}
            monsterReaction={state.monsters?.[0]?.reaction}
            handleRollReaction={handleRollReaction}
            handlePartyAttacks={handlePartyAttacks}
            setShowDungeonFeatures={setShowDungeonFeatures}
            dispatch={dispatch}
          />

          {/* Attack/Defense Buttons based on phase */}
          {combatPhase === COMBAT_PHASES.PARTY_TURN && (
            <PartyTurnPhase
              state={state}
              dispatch={dispatch}
              activeMonsters={activeMonsters}
              corridor={corridor}
              onEndTurn={handleEndPartyTurn}
            />
          )}
          {combatPhase === COMBAT_PHASES.MONSTER_TURN && (
            <MonsterTurnPhase
              state={state}
              dispatch={dispatch}
              activeMonsters={activeMonsters}
              onEndTurn={handleEndMonsterTurn}
            />
          )}

          {/* Class Abilities - Always visible during combat */}
          <AbilityButtons
            state={state}
            dispatch={dispatch}
            showSpells={showSpells}
            setShowSpells={setShowSpells}
            showHealTarget={showHealTarget}
            setShowHealTarget={setShowHealTarget}
            showBlessTarget={showBlessTarget}
            setShowBlessTarget={setShowBlessTarget}
            showProtectionTarget={showProtectionTarget}
            setShowProtectionTarget={setShowProtectionTarget}
            getAvailableSpells={getAvailableSpells}
            handleCastSpell={handleCastSpell}
            SPELLS={SPELLS}
          />

          {/* Flee/End Combat */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                dispatch({ type: "LOG", t: `Party attempts to flee!` });
                setCombatPhase(COMBAT_PHASES.FLED);
              }}
              className="flex-1 bg-yellow-700 hover:bg-yellow-600 px-3 py-1.5 rounded text-sm"
            >
              🏃 Flee
            </button>
            <button
              onClick={handleEndCombat}
              className="flex-1 bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded text-sm"
            >
              End Combat
            </button>
          </div>

          {/* VICTORY - Show below combat, not replacing */}
          {combatWon && (
            <div className="mt-2 pt-2 border-t-2 border-green-500/50 space-y-2">
              <div className="bg-green-900/50 rounded p-3 text-center border-2 border-green-500/50">
                <div className="text-green-400 font-bold text-xl">
                  🎉 VICTORY!
                </div>
                <div className="text-slate-300 text-sm">
                  All foes have been defeated!
                </div>
              </div>

              <button
                onClick={() => {
                  rollTreasure(dispatch);
                  setRoomEvents((prev) => [
                    ...prev,
                    { type: "TREASURE", data: {}, timestamp: Date.now() },
                  ]);
                }}
                className="w-full bg-amber-600 hover:bg-amber-500 px-3 py-2 rounded text-sm font-bold"
              >
                💰 Roll Treasure
              </button>

              <button
                onClick={() => {
                  handleEndCombat();
                  if (!corridor) {
                    // setActionMode(ACTION_MODES.EMPTY); // Can search room after combat
                  }
                }}
                className="w-full bg-green-700 hover:bg-green-600 px-3 py-2 rounded text-sm font-bold"
              >
                ✓ Continue
              </button>
            </div>
          )}
        </div>
      )}

      {/* DEFEAT - Show below combat if party wiped */}
      {!hasActiveMonsters &&
        state.party.every((h) => h.hp <= 0) &&
        combatPhase !== COMBAT_PHASES.NONE && (
          <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
            <div className="bg-red-900/50 rounded p-3 text-center border-2 border-red-500/50">
              <div className="text-red-400 font-bold text-xl">DEFEAT</div>
              <div className="text-slate-300 text-sm">
                The party has fallen...
              </div>
            </div>

            <button
              onClick={() => {
                handleEndCombat();
                clearTile();
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
            >
              End Adventure
            </button>
          </div>
        )}

      {/* NON-COMBAT MODES - Only show when not in combat at all */}
      {!hasActiveMonsters &&
        combatPhase === COMBAT_PHASES.NONE &&
        tileResult && (
          <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
            {/* Special Feature */}
            {actionMode === ACTION_MODES.SPECIAL && roomDetails?.special && (
              <div className="bg-purple-900/30 rounded p-3">
                <div className="text-purple-400 font-bold">
                  {roomDetails.special.name}
                </div>
                <div className="text-slate-300 text-sm mt-1">
                  {roomDetails.special.description}
                </div>
                {roomDetails.special.effect && (
                  <button
                    onClick={() => setShowDungeonFeatures(true)}
                    className="mt-2 w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm"
                  >
                    ✨ Interact with Feature
                  </button>
                )}
              </div>
            )}

            {/* Empty Room/Corridor */}
            {actionMode === ACTION_MODES.EMPTY && (
              <div className="bg-slate-700/50 rounded p-3">
                <div className="text-slate-400 font-bold">
                  {corridor ? "📦 Empty Corridor" : "📦 Empty Room"}
                </div>
                <div className="text-slate-300 text-sm mt-1">
                  {corridor
                    ? "Corridors can be searched but have fewer features."
                    : "You may search the room for hidden treasure or secrets."}
                </div>
              </div>
            )}

            {/* Treasure Room (non-combat) */}
            {actionMode === ACTION_MODES.TREASURE && (
              <div className="bg-amber-900/30 rounded p-3">
                <div className="text-amber-400 font-bold">💰 Treasure!</div>
                <div className="text-slate-300 text-sm mt-1">
                  Check the log for details of what you found.
                </div>
              </div>
            )}

            {/* Quest Room */}
            {actionMode === ACTION_MODES.QUEST && (
              <div className="bg-amber-900/30 rounded p-3">
                <div className="text-amber-500 font-bold">🏆 Quest Room!</div>
                <div className="text-slate-300 text-sm mt-1">
                  This is the dungeon's final objective! Complete your quest
                  here.
                </div>
              </div>
            )}

            {/* Search Button - for rooms, not corridors in some cases */}
            {(actionMode === ACTION_MODES.EMPTY ||
              actionMode === ACTION_MODES.TREASURE) && (
              <button
                onClick={() => setShowDungeonFeatures(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-sm"
              >
                🔍 Search {corridor ? "Corridor" : "Room"}
              </button>
            )}

            {/* Done Button */}
            <button
              onClick={clearTile}
              className="w-full bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-sm"
            >
              ✓ Done / Continue
            </button>
          </div>
        )}
    </div>
  );
}
