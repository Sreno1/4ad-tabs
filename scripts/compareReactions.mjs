import fs from 'fs';
import path from 'path';
import { MONSTER_TABLE, DEFAULT_REACTION_TABLE } from '../src/data/monsters.js';

const defaultJson = JSON.stringify(DEFAULT_REACTION_TABLE);

const rows = [];
Object.entries(MONSTER_TABLE).forEach(([key, tpl]) => {
  const hasTable = !!tpl.reactionTable;
  const sameAsDefault = hasTable && JSON.stringify(tpl.reactionTable) === defaultJson;
  rows.push({ key, name: tpl.name, hasTable, sameAsDefault, table: tpl.reactionTable || null });
});

// Summary
const total = rows.length;
const withCustom = rows.filter(r => r.hasTable && !r.sameAsDefault).length;
const withDefault = rows.filter(r => !r.hasTable || r.sameAsDefault).length;

console.log(`Monster reaction table comparison report`);
console.log(`Total species in MONSTER_TABLE: ${total}`);
console.log(`Using custom table (different from DEFAULT): ${withCustom}`);
console.log(`Using default table or none: ${withDefault}\n`);

// Print lists
console.log('--- Using custom table ---');
rows.filter(r => r.hasTable && !r.sameAsDefault).forEach(r => {
  console.log(`${r.key} -> ${r.name}`);
});

console.log('\n--- Using default/no table ---');
rows.filter(r => !r.hasTable || r.sameAsDefault).forEach(r => {
  console.log(`${r.key} -> ${r.name}`);
});

// Also write a JSON file with full details
const out = { total, withCustom, withDefault, rows };
fs.writeFileSync(path.resolve('./.compareReactions.json'), JSON.stringify(out, null, 2));
console.log('\nDetailed output written to .compareReactions.json');
