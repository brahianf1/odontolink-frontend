type Shadow = string;

const lightShadows: readonly Shadow[] = [
  'none',
  '0px 1px 2px 0px rgba(0,0,0,0.30), 0px 1px 3px 1px rgba(0,0,0,0.15)',
  '0px 1px 2px 0px rgba(0,0,0,0.30), 0px 2px 6px 2px rgba(0,0,0,0.15)',
  '0px 1px 3px 0px rgba(0,0,0,0.30), 0px 4px 8px 3px rgba(0,0,0,0.15)',
  '0px 2px 3px 0px rgba(0,0,0,0.30), 0px 6px 10px 4px rgba(0,0,0,0.15)',
  '0px 4px 4px 0px rgba(0,0,0,0.30), 0px 8px 12px 6px rgba(0,0,0,0.15)',
] as const;

const darkShadows: readonly Shadow[] = [
  'none',
  '0px 1px 2px 0px rgba(0,0,0,0.60), 0px 1px 3px 1px rgba(0,0,0,0.30)',
  '0px 1px 2px 0px rgba(0,0,0,0.60), 0px 2px 6px 2px rgba(0,0,0,0.30)',
  '0px 1px 3px 0px rgba(0,0,0,0.60), 0px 4px 8px 3px rgba(0,0,0,0.30)',
  '0px 2px 3px 0px rgba(0,0,0,0.60), 0px 6px 10px 4px rgba(0,0,0,0.30)',
  '0px 4px 4px 0px rgba(0,0,0,0.60), 0px 8px 12px 6px rgba(0,0,0,0.30)',
] as const;

export const elevation = {
  light: {
    0: lightShadows[0],
    1: lightShadows[1],
    2: lightShadows[2],
    3: lightShadows[3],
    4: lightShadows[4],
    5: lightShadows[5],
  },
  dark: {
    0: darkShadows[0],
    1: darkShadows[1],
    2: darkShadows[2],
    3: darkShadows[3],
    4: darkShadows[4],
    5: darkShadows[5],
  },
} as const;

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

const padShadows = (base: readonly Shadow[]): Shadow[] => {
  const out: Shadow[] = [...base];
  while (out.length < 25) out.push(base[base.length - 1]);
  return out;
};

export const muiShadows = {
  light: padShadows(lightShadows),
  dark: padShadows(darkShadows),
} as const;
