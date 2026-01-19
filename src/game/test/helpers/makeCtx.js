// src/game/test/helpers/makeCtx.js
import { createRng } from "../../rng.js";

export const makeCtx = (seed = 123) => ({
  rng: createRng(seed),
  now: () => 0,
  debug: false,
  rollLog: [],
});
