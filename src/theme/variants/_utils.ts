import type { ThemeVariantColors } from './_types';

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const hexToRgb = (hex: string): [number, number, number] | null => {
  if (!hex || !hex.startsWith('#')) return null;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length !== 6) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const rgbToHex = ([r, g, b]: [number, number, number]): string =>
  '#' +
  [r, g, b]
    .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0'))
    .join('');

/**
 * Mix two hex colors. `ratio = 0` → c1, `ratio = 1` → c2.
 * Falls back to c1 if either input isn't a parseable hex color.
 */
export const mixHex = (c1: string, c2: string, ratio: number): string => {
  const r1 = hexToRgb(c1);
  const r2 = hexToRgb(c2);
  if (!r1 || !r2) return c1;
  return rgbToHex([
    r1[0] * (1 - ratio) + r2[0] * ratio,
    r1[1] * (1 - ratio) + r2[1] * ratio,
    r1[2] * (1 - ratio) + r2[2] * ratio,
  ]);
};

/**
 * Build a hex color with the given alpha overlay against an opaque base.
 * Used for ring/focus colors and translucent overlays expressed as solid hex.
 */
export const alphaOver = (color: string, base: string, alpha: number): string =>
  mixHex(base, color, alpha);

/**
 * Subset of M3 tokens that consumers most commonly read. Exposed for sanity
 * checks and for the admin preview component (Phase 2) — components should
 * keep going through `theme.palette` rather than this directly.
 */
export const previewTokens = (c: ThemeVariantColors) => ({
  primary: c.primary,
  secondary: c.secondary,
  tertiary: c.tertiary,
  background: c.background,
  surface: c.surface,
  text: c.onBackground,
});
