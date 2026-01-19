// scripts/check-random.js
import { execSync } from "node:child_process";
const output = execSync('rg "Math.random" src/utils src/game', { encoding: "utf8" });
if (output.trim().length > 0) {
  console.error(output);
  process.exit(1);
}
