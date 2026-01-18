import { defaultRng } from "./rng.js";

export const getDefaultContext = () => ({
  rng: defaultRng,
  now: Date.now,
  debug: false,
  rollLog: null,
});
