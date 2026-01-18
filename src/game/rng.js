export const createRng = (seed = 123456789) => {
  let state = seed >>> 0;
  const nextInt = (max) => {
    if (max <= 0) return 0;
    // mulberry32
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return Math.floor(result * max);
  };
  const nextFloat = () => nextInt(0xffffffff) / 0xffffffff;
  const nextRange = (min, max) => min + nextInt(max - min + 1);
  const getState = () => state >>> 0;
  const setState = (s) => { state = (s >>> 0); };
  return { nextInt, nextFloat, nextRange, getState, setState };
};

export const defaultRng = {
  nextInt: (max) => Math.floor(Math.random() * max),
  nextFloat: () => Math.random(),
  nextRange: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),
};
