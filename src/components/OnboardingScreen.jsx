import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { CLASSES } from "../data/classes";
import { rollGold } from "../utils/campaignStorage";
import { ALL_EQUIPMENT, getEquipment } from "../data/equipment";
import TraitSelector from "./TraitSelector";
import { getTrait, getTraitsForClass } from "../data/traits";

const parseGoldInput = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
};

/**
 * OnboardingScreen - Campaign creation and party setup
 * Steps: campaign name → welcome → create party → confirm gold → start adventure
 */
export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState("campaign-name");
  const [campaignName, setCampaignName] = useState("");
  const [heroes, setHeroes] = useState([null, null, null, null]);
  const [goldRolls, setGoldRolls] = useState([]);
  const [goldMode, setGoldMode] = useState("roll");
  const [customGoldInput, setCustomGoldInput] = useState("");
  const [remainingGold, setRemainingGold] = useState(0);
  const [traitSelectorHero, setTraitSelectorHero] = useState(null);
  const [sortByPrice, setSortByPrice] = useState(false);
  const [hideUnaffordable, setHideUnaffordable] = useState(false);

  const rollStartingGold = () => {
    const rolls = heroes.map((hero) => {
      const classData = CLASSES[hero.key];
      const goldRoll = rollGold(classData.startingWealth);
      return {
        heroName: hero.name,
        className: classData.name,
        amount: goldRoll,
      };
    });
    setGoldRolls(rolls);
    return rolls;
  };

  return (
    <>
      {/* Step 0: Campaign Name */}
      {step === "campaign-name" && (
        <div id="onboarding_campaign_name_screen" className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card variant="surface1" className="max-w-2xl w-full p-8">
            <h1 id="onboarding_campaign_name_title" className="text-4xl font-bold text-amber-400 mb-4">
              New Campaign
            </h1>
            <p id="onboarding_campaign_name_description" className="text-slate-300 mb-6">
              Give your adventure a name (e.g., "Dragon Quest", "Tomb Raiding",
              "The Lost Temple")
            </p>
            <input
              id="onboarding_campaign_name_input"
              type="text"
              placeholder="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-slate-700 rounded px-4 py-3 mb-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Campaign name"
              autoFocus
            />
            <Button
              id="onboarding_campaign_name_confirm_button"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!campaignName.trim()}
              onClick={() => setStep("welcome")}
              dataAction="confirm-campaign-name"
            >
              Continue
            </Button>
          </Card>
        </div>
      )}

      {/* Step 1: Welcome screen */}
      {step === "welcome" && (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card variant="surface1" className="max-w-2xl w-full p-8">
            <h1 className="text-4xl font-bold text-amber-400 mb-2">
              {campaignName}
            </h1>
            <p className="text-slate-400 mb-6">Campaign Setup</p>
            <div className="text-slate-300 space-y-4 mb-8">
              <p>
                Welcome, adventurer! You're about to embark on a solo
                dungeon-crawling adventure based on the Four Against Darkness
                rules.
              </p>
              <p>
                You'll create a party of 4 heroes, each with their own class and
                abilities. Starting gold can be rolled per character or entered
                manually for the party pool.
              </p>
              <p className="text-amber-300 font-semibold">
                Let's begin by creating your party!
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setStep("create-party")}
              dataAction="start-party-creation"
            >
              Create Party
            </Button>
          </Card>
        </div>
      )}

      {/* Step 2: Create party (4 heroes with names, classes, traits) */}
      {step === "create-party" &&
        (() => {
          const createdCount = heroes.filter((h) => h !== null).length;

          const randomNames = [
            "Aragorn",
            "Gandalf",
            "Legolas",
            "Gimli",
            "Frodo",
            "Samwise",
            "Boromir",
            "Faramir",
            "Eowyn",
            "Theoden",
            "Elrond",
            "Galadriel",
            "Thorin",
            "Bilbo",
            "Bard",
            "Thranduil",
            "Tauriel",
            "Beorn",
            "Conan",
            "Sonja",
            "Valeria",
            "Subotai",
            "Thulsa",
            "Akiro",
            "Raistlin",
            "Caramon",
            "Tanis",
            "Sturm",
            "Goldmoon",
            "Riverwind",
          ];

          const randomizeParty = () => {
            const classKeys = Object.keys(CLASSES);
            const newHeroes = Array(4)
              .fill(null)
              .map((_, idx) => {
                const randomClass =
                  classKeys[Math.floor(Math.random() * classKeys.length)];
                const classData = CLASSES[randomClass];
                const usedNames = heroes.filter((h) => h).map((h) => h.name);
                const availableNames = randomNames.filter(
                  (n) => !usedNames.includes(n),
                );
                const randomName =
                  availableNames[
                    Math.floor(Math.random() * availableNames.length)
                  ] || `Hero ${idx + 1}`;

                // Get random trait for this class
                const traits = getTraitsForClass(randomClass);
                let randomTrait = null;
                let randomTraitChoice = null;
                if (traits.length > 0) {
                  const trait =
                    traits[Math.floor(Math.random() * traits.length)];
                  randomTrait = trait.key;
                  if (trait.requiresChoice && trait.choices) {
                    randomTraitChoice =
                      trait.choices[
                        Math.floor(Math.random() * trait.choices.length)
                      ];
                  }
                }

                return {
                  id: Date.now() + Math.random() + idx,
                  name: randomName,
                  key: randomClass,
                  lvl: 1,
                  xp: 0,
                  hp: classData.life + 1,
                  maxHp: classData.life + 1,
                  trait: randomTrait,
                  traitChoice: randomTraitChoice,
                  equipment: [],
                  inventory: [],
                  gold: 0,
                  abilities: {
                    healsUsed: 0,
                    blessingsUsed: 0,
                    spellsUsed: 0,
                    luckUsed: 0,
                    rageActive: false,
                    prayerUsed: 0,
                    tricksUsed: 0,
                    gadgetsUsed: 0,
                    panacheCurrent: 0,
                    sporesUsed: 0,
                    hideInShadowsUsed: 0,
                    mountSummoned: false,
                  },
                  status: {
                    poisoned: false,
                    blessed: false,
                    cursed: false,
                  },
                  stats: {
                    monstersKilled: 0,
                    dungeonsSurvived: 0,
                    totalGoldEarned: 0,
                  },
                };
              });
            setHeroes(newHeroes);
          };

          return (
            <div className="min-h-screen bg-slate-900 p-4 overflow-y-auto">
              <div className="max-w-6xl mx-auto py-8">
                <Card variant="surface1" className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-3xl font-bold text-amber-400 mb-2">
                        Create Your Party ({createdCount}/4)
                      </h2>
                      <p className="text-slate-400 text-sm mb-6">
                        Choose name, class, and trait for each hero. Starting
                        gold can be rolled per class or set manually.
                      </p>
                    </div>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={randomizeParty}
                      dataAction="randomize-party"
                    >
                       Random Party
                    </Button>
                  </div>

                  {/* Hero creation form - 4 slots */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[0, 1, 2, 3].map((idx) => (
                      <HeroCreationCard
                        key={idx}
                        heroNumber={idx + 1}
                        hero={heroes[idx]}
                        onSave={(hero) => {
                          const newHeroes = [...heroes];
                          newHeroes[idx] = hero;
                          setHeroes(newHeroes);
                        }}
                        onOpenTraitSelector={(heroData) => {
                          setTraitSelectorHero({ hero: heroData, index: idx });
                        }}
                        onRemove={() => {
                          const newHeroes = [...heroes];
                          newHeroes[idx] = null;
                          setHeroes(newHeroes);
                        }}
                      />
                    ))}
                  </div>

                  {createdCount === 4 && (
                    <div className="space-y-3">
                      <Button
                        variant="success"
                        size="lg"
                        fullWidth
                        onClick={() => {
                          setGoldMode("roll");
                          setCustomGoldInput("");
                          rollStartingGold();
                          setStep("confirm-gold");
                        }}
                        dataAction="confirm-party"
                      >
                        Roll Starting Gold →
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={() => {
                          setGoldMode("custom");
                          setGoldRolls([]);
                          setCustomGoldInput("");
                          setStep("confirm-gold");
                        }}
                        dataAction="confirm-party-custom-gold"
                      >
                        Set Custom Gold →
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          );
        })()}

      {/* Step 3: Review starting gold */}
      {step === "confirm-gold" &&
        (() => {
          const rolledTotal = goldRolls.reduce(
            (sum, roll) => sum + roll.amount,
            0,
          );
          const parsedCustomGold = parseGoldInput(customGoldInput);
          const customGold = parsedCustomGold ?? 0;
          const totalGold = goldMode === "custom" ? customGold : rolledTotal;
          const customGoldValid = parsedCustomGold !== null;
          return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
              <Card variant="surface1" className="max-w-2xl w-full p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2 className="text-3xl font-bold text-amber-400">
                    Starting Gold
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant={goldMode === "roll" ? "success" : "secondary"}
                      size="sm"
                      onClick={() => {
                        setGoldMode("roll");
                        if (goldRolls.length === 0) {
                          rollStartingGold();
                        }
                      }}
                      dataAction="confirm-gold-use-rolls"
                    >
                      Use Rolls
                    </Button>
                    <Button
                      variant={goldMode === "custom" ? "success" : "secondary"}
                      size="sm"
                      onClick={() => setGoldMode("custom")}
                      dataAction="confirm-gold-use-custom"
                    >
                      Custom Amount
                    </Button>
                  </div>
                </div>

                {goldMode === "roll" && (
                  <div className="space-y-3 mb-6">
                    {goldRolls.map((roll, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-slate-800 rounded p-3"
                      >
                        <div>
                          <span className="text-white font-semibold">
                            {roll.heroName}
                          </span>
                          <span className="text-slate-400 text-sm ml-2">
                            ({roll.className})
                          </span>
                        </div>
                        <span className="text-amber-400 font-bold text-lg">
                          {roll.amount} gp
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {goldMode === "custom" && (
                  <div className="bg-slate-800 rounded p-4 mb-6">
                    <label
                      htmlFor="onboarding_custom_gold_input"
                      className="text-slate-300 font-semibold block mb-2"
                    >
                      Custom starting gold (party total)
                    </label>
                    <input
                      id="onboarding_custom_gold_input"
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={customGoldInput}
                      onChange={(e) => setCustomGoldInput(e.target.value)}
                      className="w-full bg-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      aria-label="Custom starting gold"
                    />
                    <p className="text-slate-400 text-xs mt-2">
                      Enter a non-negative whole number.
                    </p>
                  </div>
                )}

                {/* Total gold */}
                <div className="bg-slate-800 border-2 border-amber-500 rounded p-6 mb-6 text-center">
                  <p className="text-slate-400 text-sm mb-2">Party Gold Pool</p>
                  <p className="text-6xl font-bold text-amber-400 mb-2">
                    {totalGold}
                  </p>
                  <p className="text-slate-400 text-sm">gold pieces</p>
                </div>

                {goldMode === "roll" ? (
                  <p className="text-slate-300 text-sm mb-6 text-center">
                    Each hero's class has different starting wealth. These
                    amounts have been rolled and pooled for your party to share.
                  </p>
                ) : (
                  <p className="text-slate-300 text-sm mb-6 text-center">
                    Set a party-wide starting gold amount for your adventure.
                  </p>
                )}

                <Button
                  variant="success"
                  size="lg"
                  fullWidth
                  onClick={() => {
                    setRemainingGold(totalGold);
                    setStep("buy-equipment");
                  }}
                  disabled={
                    goldMode === "custom"
                      ? !customGoldValid
                      : goldRolls.length === 0
                  }
                  dataAction="confirm-gold"
                >
                  Continue to Shop →
                </Button>
              </Card>
            </div>
          );
        })()}

      {/* Step 4: Equipment Shop */}
      {step === "buy-equipment" &&
        (() => {
          const getItemIcon = (category) => {
            switch (category) {
              case "weapon":
                return "️";
              case "armor":
                return "️";
              case "shield":
                return "";
              case "consumable":
                return "";
              default:
                return "";
            }
          };

          let availableItems = Object.values(ALL_EQUIPMENT).filter(
            (item) => item.cost && item.cost <= 100,
          );

          // Filter by affordability
          if (hideUnaffordable) {
            availableItems = availableItems.filter(
              (item) => item.cost <= remainingGold,
            );
          }

          // Sort items
          availableItems = availableItems.sort((a, b) => {
            if (sortByPrice) {
              return a.cost - b.cost;
            }
            return a.name.localeCompare(b.name);
          });

          const buyItem = (itemKey, heroIndex) => {
            const item = getEquipment(itemKey);
            if (!item || remainingGold < item.cost) return;

            const hero = heroes[heroIndex];
            const currentEquipment = hero.equipment || [];

            // Check weapon limits
            if (item.category === "weapon") {
              const weaponCount = currentEquipment.filter((key) => {
                const eq = getEquipment(key);
                return eq && eq.category === "weapon";
              }).length;

              const twoHandedCount = currentEquipment.filter((key) => {
                const eq = getEquipment(key);
                return (
                  eq && eq.category === "weapon" && eq.key === "two_handed"
                );
              }).length;

              if (item.key === "two_handed") {
                if (twoHandedCount >= 2) {
                  alert("Cannot carry more than 2 two-handed weapons");
                  return;
                }
              } else {
                if (weaponCount >= 3) {
                  alert("Cannot carry more than 3 weapons");
                  return;
                }
              }
            }

            // Add item to hero
            const newHeroes = [...heroes];
            newHeroes[heroIndex] = {
              ...hero,
              equipment: [...currentEquipment, itemKey],
            };
            setHeroes(newHeroes);
            setRemainingGold(remainingGold - item.cost);
          };

          const addToInventory = (itemKey, heroIndex) => {
            const hero = heroes[heroIndex];
            if (!hero) return;
            const currentEquipment = hero.equipment || [];
            const newHeroes = [...heroes];
            newHeroes[heroIndex] = {
              ...hero,
              equipment: [...currentEquipment, itemKey],
            };
            setHeroes(newHeroes);
          };

          return (
            <div className="min-h-screen bg-slate-900 p-4 overflow-y-auto">
              <div className="max-w-6xl mx-auto py-8">
                <Card variant="surface1" className="p-6">
                  <h2 className="text-3xl font-bold text-amber-400 mb-2">
                    Equipment Shop
                  </h2>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-slate-400 text-sm">
                      Purchase equipment for your heroes before the adventure
                    </p>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Remaining Gold</p>
                      <p className="text-2xl font-bold text-amber-400">
                        {remainingGold} gp
                      </p>
                    </div>
                  </div>

                  {/* Filters and Sort */}
                  <div id="onboarding_shop_filters" className="flex gap-3 mb-4">
                    <button
                      id="onboarding_shop_sort_button"
                      onClick={() => setSortByPrice(!sortByPrice)}
                      className={`px-3 py-2 rounded text-sm ${
                        sortByPrice
                          ? "bg-amber-600 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                      aria-pressed={sortByPrice}
                    >
                      {sortByPrice ? " Sort: Price" : " Sort: Name"}
                    </button>
                    <button
                      id="onboarding_shop_affordability_button"
                      onClick={() => setHideUnaffordable(!hideUnaffordable)}
                      className={`px-3 py-2 rounded text-sm ${
                        hideUnaffordable
                          ? "bg-amber-600 text-white"
                          : "bg-slate-700 text-slate-300"
                      }`}
                      aria-pressed={hideUnaffordable}
                    >
                      {hideUnaffordable ? " Affordable Only" : "️ Show All"}
                    </button>
                  </div>

                  {/* Equipment list */}
                  <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                    {availableItems.map((item) => (
                      <div
                        key={item.key}
                        className={`bg-slate-700 rounded p-3 flex gap-3 ${
                          remainingGold < item.cost ? "opacity-50" : ""
                        }`}
                      >
                        <div className="text-2xl flex-shrink-0">
                          {getItemIcon(item.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-white">
                              {item.name}
                            </span>
                            <span className="text-amber-400 font-bold ml-2">
                              {item.cost}gp
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs mb-2">
                            {item.description}
                          </p>
                          <div id={`onboarding_shop_item_${item.key}_actions`} className="flex gap-2">
                            <select
                              id={`onboarding_shop_item_${item.key}_buy_select`}
                              className="flex-1 bg-slate-600 rounded px-2 py-1 text-white text-xs"
                              onChange={(e) => {
                                if (e.target.value) {
                                  buyItem(item.key, parseInt(e.target.value));
                                  e.target.value = "";
                                }
                              }}
                              disabled={remainingGold < item.cost}
                              aria-label={`Buy ${item.name} for...`}
                            >
                              <option value="">Buy for...</option>
                              {heroes.map((hero, idx) => (
                                <option key={idx} value={idx}>
                                  {hero.name}
                                </option>
                              ))}
                            </select>
                            <div>
                              <button
                                id={`onboarding_shop_item_${item.key}_inventory_button`}
                                onClick={() => {
                                  /* Open a small prompt to select hero to add to inventory for simplicity */
                                  const nameList = heroes.map((h, i) => `${i}: ${h.name}`).join('\n');
                                  const choice = prompt(`Add to inventory for which hero?\n${nameList}`);
                                  const idx = parseInt(choice);
                                  if (!Number.isNaN(idx) && idx >= 0 && idx < heroes.length) {
                                    addToInventory(item.key, idx);
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
                                aria-label={`Add ${item.name} to inventory`}
                              >
                                Add to Inventory
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hero equipment display */}
                  <div className="bg-slate-800 rounded p-4 mb-6">
                    <h3 className="text-amber-300 font-bold mb-3">
                      Party Equipment
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {heroes.map((hero, idx) => (
                        <div key={idx} className="bg-slate-700 rounded p-3">
                          <p className="text-white font-bold mb-2">
                            {hero.name}
                          </p>
                          {hero.equipment && hero.equipment.length > 0 ? (
                            <ul className="text-slate-300 text-xs space-y-1">
                              {hero.equipment.map((itemKey, i) => {
                                const item = getEquipment(itemKey);
                                return (
                                  <li key={i}>• {item?.name || itemKey}</li>
                                );
                              })}
                            </ul>
                          ) : (
                            <p className="text-slate-500 text-xs italic">
                              No equipment
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setStep("ready")}
                    dataAction="finish-shopping"
                  >
                    Begin Adventure →
                  </Button>
                  <p className="text-slate-500 text-xs text-center mt-2">
                    You can purchase more equipment between dungeons
                  </p>
                </Card>
              </div>
            </div>
          );
        })()}

      {/* Step 5: Ready to start */}
      {step === "ready" &&
        (() => {
          const rolledTotal = goldRolls.reduce(
            (sum, roll) => sum + roll.amount,
            0,
          );
          const parsedCustomGold = parseGoldInput(customGoldInput);
          const customGold = parsedCustomGold ?? 0;
          const totalGold = goldMode === "custom" ? customGold : rolledTotal;
          return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
              <Card variant="surface1" className="max-w-3xl w-full p-8">
                <h2 className="text-3xl font-bold text-amber-400 mb-6">
                  Ready to Explore!
                </h2>

                <div className="bg-slate-800 rounded p-6 mb-6">
                  <h3 className="text-amber-300 font-semibold mb-4 text-lg">
                    Your Party:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {heroes.map((hero, idx) => (
                      <div key={idx} className="bg-slate-700 rounded p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-bold">{hero.name}</p>
                            <p className="text-slate-400 text-sm">
                              {CLASSES[hero.key].name}
                            </p>
                            {hero.trait && (
                              <p className="text-amber-400 text-xs mt-1">
                                Trait: {hero.trait}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 text-sm">
                              HP: {hero.maxHp}
                            </p>
                            <p className="text-slate-400 text-xs">
                              Level {hero.lvl}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-900/20 border border-amber-500/30 rounded p-4 mb-6">
                  <p className="text-amber-300 text-center">
                    <span className="font-bold text-2xl">
                      {remainingGold} gold pieces
                    </span>{" "}
                    remaining
                  </p>
                  {totalGold !== remainingGold && (
                    <p className="text-amber-400 text-sm text-center mt-2">
                      Starting gold: {totalGold} gp | Spent on equipment:{" "}
                      {totalGold - remainingGold} gp
                    </p>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-6 text-center">
                  Equipment can be purchased when you find shops in the dungeon.
                  Your adventure begins now!
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() =>
                    onComplete({
                      campaignName,
                      party: heroes,
                      gold: remainingGold,
                    })
                  }
                  dataAction="start-adventure"
                >
                  ️ Begin Adventure
                </Button>
              </Card>
            </div>
          );
        })()}

      {/* Trait Selector Modal - renders at document level with high z-index */}
      {traitSelectorHero && (
        <TraitSelector
          isOpen={true}
          hero={traitSelectorHero.hero}
          heroIdx={traitSelectorHero.index}
          dispatch={(action) => {
            // Handle trait selection
            if (action.type === "UPD_HERO") {
              const newHeroes = [...heroes];
              newHeroes[action.i] = {
                ...newHeroes[action.i],
                ...action.u,
              };
              setHeroes(newHeroes);
              setTraitSelectorHero(null);
            }
          }}
          onClose={() => setTraitSelectorHero(null)}
        />
      )}
    </>
  );
}

/**
 * HeroCreationCard - Individual hero creation form
 */
function HeroCreationCard({
  heroNumber,
  hero,
  onSave,
  onRemove,
  onOpenTraitSelector,
}) {
  const [name, setName] = useState(hero?.name || "");
  const [selectedClass, setSelectedClass] = useState(hero?.key || "");

  const handleSave = () => {
    if (!name.trim() || !selectedClass) return;

    const classData = CLASSES[selectedClass];
    // Clear trait if class has changed (traits are class-specific)
    const classChanged = hero && hero.key !== selectedClass;
    onSave({
      id: hero?.id || Date.now() + Math.random(),
      name: name.trim(),
      key: selectedClass,
      lvl: 1,
      xp: 0,
      hp: classData.life + 1,
      maxHp: classData.life + 1,
      trait: classChanged ? null : hero?.trait || null,
      traitChoice: classChanged ? null : hero?.traitChoice || null,
      equipment: [],
      inventory: [],
      gold: 0,
      abilities: {
        healsUsed: 0,
        blessingsUsed: 0,
        spellsUsed: 0,
        luckUsed: 0,
        rageActive: false,
        prayerUsed: 0,
        tricksUsed: 0,
        gadgetsUsed: 0,
        panacheCurrent: 0,
        sporesUsed: 0,
        hideInShadowsUsed: 0,
        mountSummoned: false,
      },
      status: {
        poisoned: false,
        blessed: false,
        cursed: false,
      },
      stats: {
        monstersKilled: 0,
        dungeonsSurvived: 0,
        totalGoldEarned: 0,
      },
    });
  };

  const classData = selectedClass ? CLASSES[selectedClass] : null;

  return (
    <Card variant={hero ? "hero" : "surface2"} className="p-4">
      <div id={`onboarding_hero_${heroNumber}_header`} className="flex items-center justify-between mb-3">
        <h4 id={`onboarding_hero_${heroNumber}_title`} className="text-amber-400 font-bold">Hero {heroNumber}</h4>
        {hero && <span id={`onboarding_hero_${heroNumber}_created_badge`} className="text-green-400 text-xs">✓ Created</span>}
      </div>

      <input
        id={`onboarding_hero_${heroNumber}_name_input`}
        type="text"
        placeholder="Hero Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-slate-700 rounded px-3 py-2 mb-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label={`Hero ${heroNumber} name`}
      />

      <select
        id={`onboarding_hero_${heroNumber}_class_select`}
        value={selectedClass}
        onChange={(e) => {
          const newClass = e.target.value;
          setSelectedClass(newClass);
          // If hero exists and class changed, clear trait immediately
          if (hero && hero.key !== newClass) {
            onSave({
              ...hero,
              key: newClass,
              trait: null,
              traitChoice: null,
            });
          }
        }}
        className="w-full bg-slate-700 rounded px-3 py-2 mb-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label={`Hero ${heroNumber} class`}
      >
        <option value="">Select Class</option>
        {Object.entries(CLASSES).map(([key, cls]) => (
          <option key={key} value={key}>
            {cls.name}
          </option>
        ))}
      </select>

      {/* Show class info if selected */}
      {classData && (
        <div className="bg-slate-800 rounded p-2 mb-3 text-xs">
          <p className="text-slate-400">
            HP: <span className="text-white">{classData.life + 1}</span>
          </p>
          <p className="text-slate-400">
            Starting Gold:{" "}
            <span className="text-amber-400">{classData.startingWealth}</span>
          </p>
        </div>
      )}

      {/* Trait display/selector */}
      {selectedClass && (
        <div className="mb-3">
          {hero && hero.trait ? (
            <div className="bg-cyan-900 border border-cyan-600 rounded p-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-cyan-300 text-xs">Trait: </span>
                  <span className="text-white text-sm font-semibold">
                    {getTrait(hero?.key, hero?.trait)?.name || hero?.trait}
                  </span>
                  {hero?.traitChoice && (
                    <span className="text-cyan-300 text-xs ml-1">
                      ({hero?.traitChoice})
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (hero) {
                      // Create hero with current selected class
                      const heroWithCurrentClass = {
                        ...hero,
                        key: selectedClass,
                      };
                      onOpenTraitSelector(heroWithCurrentClass);
                    }
                  }}
                  className="text-cyan-400 hover:text-cyan-300 text-xs"
                  type="button"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Create temporary hero object for trait selection
                const tempHero = hero || {
                  id: Date.now() + Math.random(),
                  name: name.trim() || "Hero",
                  key: selectedClass,
                  lvl: 1,
                };
                onOpenTraitSelector(tempHero);
              }}
              className="w-full bg-slate-600 hover:bg-slate-500 rounded px-3 py-2 text-white text-sm"
              type="button"
            >
              Select Trait (Optional)
            </button>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant={hero ? "info" : "success"}
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={!name.trim() || !selectedClass}
          dataAction="save-hero"
        >
          {hero ? "Update" : "Create Hero"}
        </Button>
        {hero && (
          <Button
            variant="danger"
            size="sm"
            onClick={onRemove}
            dataAction="remove-hero"
            aria-label={`Remove hero ${heroNumber}`}
          >
            Remove
          </Button>
        )}
      </div>
    </Card>
  );
}
