// Build-time script that converts shadcn/Tailwind-v4 CSS theme files in
// `themes/*.css` into typed TS variants under `src/theme/variants/generated.ts`.
//
// Usage:  node scripts/generateThemes.mjs
//
// The output is committed alongside the rest of the code so the runtime
// bundle never needs to parse CSS. Re-run whenever themes/*.css change.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());
const THEMES_DIR = join(ROOT, 'themes');
const OUT_FILE = join(ROOT, 'src', 'theme', 'variants', 'generated.ts');

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const normalizeColor = (raw) => {
  if (raw == null) return null;
  let c = raw.trim().replace(/['"]/g, '');
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    if (h.length === 8) h = h.slice(0, 6);
    if (h.length !== 6) return null;
    return `#${h.toLowerCase()}`;
  }
  // hsl(), rgb(), oklch() etc. — only used by shadows in these themes, we
  // ignore those paths and don't need to convert.
  return null;
};

const hexToRgb = (hex) => {
  if (!hex || !hex.startsWith('#')) return null;
  const h = hex.slice(1);
  if (h.length !== 6) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

const rgbToHex = ([r, g, b]) =>
  '#' +
  [r, g, b]
    .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0'))
    .join('');

const mix = (c1, c2, ratio) => {
  const r1 = hexToRgb(c1);
  const r2 = hexToRgb(c2);
  if (!r1 || !r2) return c1;
  return rgbToHex([
    r1[0] * (1 - ratio) + r2[0] * ratio,
    r1[1] * (1 - ratio) + r2[1] * ratio,
    r1[2] * (1 - ratio) + r2[2] * ratio,
  ]);
};

const parseBlock = (css, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match block by selector: `selector { ... }` allowing whitespace/newlines.
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const match = css.match(re);
  if (!match) return {};
  const body = match[1];
  const tokens = {};
  const lineRe = /--([\w-]+):\s*([^;]+);/g;
  let m;
  while ((m = lineRe.exec(body)) !== null) {
    tokens[m[1]] = m[2].trim();
  }
  return tokens;
};

const FALLBACK_LIGHT = {
  primary: '#3b82f6',
  'primary-foreground': '#ffffff',
  secondary: '#e2e8f0',
  'secondary-foreground': '#0f172a',
  accent: '#3b82f6',
  'accent-foreground': '#ffffff',
  background: '#ffffff',
  foreground: '#0f172a',
  card: '#ffffff',
  'card-foreground': '#0f172a',
  popover: '#ffffff',
  'popover-foreground': '#0f172a',
  muted: '#f1f5f9',
  'muted-foreground': '#64748b',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#3b82f6',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
};

const FALLBACK_DARK = {
  primary: '#60a5fa',
  'primary-foreground': '#0f172a',
  secondary: '#1e293b',
  'secondary-foreground': '#f8fafc',
  accent: '#60a5fa',
  'accent-foreground': '#0f172a',
  background: '#0f172a',
  foreground: '#f8fafc',
  card: '#1e293b',
  'card-foreground': '#f8fafc',
  popover: '#1e293b',
  'popover-foreground': '#f8fafc',
  muted: '#1e293b',
  'muted-foreground': '#94a3b8',
  border: '#334155',
  input: '#334155',
  ring: '#60a5fa',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
};

const buildVariantColors = (raw, mode) => {
  const defaults = mode === 'light' ? FALLBACK_LIGHT : FALLBACK_DARK;
  const get = (key) => normalizeColor(raw[key]) ?? defaults[key];

  const primary = get('primary');
  const primaryForeground = get('primary-foreground');
  const secondary = get('secondary');
  const secondaryForeground = get('secondary-foreground');
  const accent = get('accent');
  const accentForeground = get('accent-foreground');
  const background = get('background');
  const foreground = get('foreground');
  const card = get('card');
  const cardForeground = get('card-foreground');
  const popover = get('popover');
  const muted = get('muted');
  const mutedForeground = get('muted-foreground');
  const border = get('border');
  const input = get('input');
  const destructive = get('destructive');
  const destructiveForeground = get('destructive-foreground');

  const containerBase = mode === 'light' ? '#ffffff' : '#000000';
  const inkBase = mode === 'light' ? '#000000' : '#ffffff';

  // Tonal containers — mix the source color toward white (light) or black (dark)
  // to produce a soft tint suitable for chips, FAB backgrounds, etc.
  const primaryContainer = mix(primary, containerBase, mode === 'light' ? 0.85 : 0.75);
  const onPrimaryContainer = mix(primary, inkBase, mode === 'light' ? 0.45 : 0.55);
  const secondaryContainer = mix(secondary, containerBase, 0.6);
  const onSecondaryContainer = secondaryForeground;
  const tertiaryContainer = mix(accent, containerBase, mode === 'light' ? 0.82 : 0.72);
  const onTertiaryContainer = mix(accent, inkBase, mode === 'light' ? 0.5 : 0.5);
  const errorContainer = mix(destructive, containerBase, mode === 'light' ? 0.82 : 0.7);
  const onErrorContainer = mix(destructive, inkBase, mode === 'light' ? 0.45 : 0.55);

  // Surface container ladder — when shadcn provides distinct card/popover/muted
  // we use them in order; otherwise we step them programmatically.
  const ladderStep = mode === 'light' ? 0.04 : 0.06;
  const surfaceContainerLowest = card;
  const surfaceContainerLow = card;
  const surfaceContainer = muted;
  const surfaceContainerHigh =
    popover && popover !== card ? popover : mix(card, foreground, ladderStep);
  const surfaceContainerHighest =
    secondary && secondary !== muted ? secondary : mix(card, foreground, ladderStep * 2);

  return {
    primary,
    onPrimary: primaryForeground,
    primaryContainer,
    onPrimaryContainer,
    inversePrimary: mix(primary, inkBase, mode === 'light' ? 0.6 : 0.3),
    secondary,
    onSecondary: secondaryForeground,
    secondaryContainer,
    onSecondaryContainer,
    tertiary: accent,
    onTertiary: accentForeground,
    tertiaryContainer,
    onTertiaryContainer,
    error: destructive,
    onError: destructiveForeground,
    errorContainer,
    onErrorContainer,
    background,
    onBackground: foreground,
    surface: card,
    onSurface: cardForeground,
    surfaceVariant: muted,
    onSurfaceVariant: mutedForeground,
    surfaceDim: mode === 'light' ? muted : background,
    surfaceBright: mode === 'light' ? card : popover,
    surfaceContainerLowest,
    surfaceContainerLow,
    surfaceContainer,
    surfaceContainerHigh,
    surfaceContainerHighest,
    outline: border,
    outlineVariant: input,
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: foreground,
    inverseOnSurface: background,
    surfaceTint: primary,
    chart1: normalizeColor(raw['chart-1']) ?? primary,
    chart2: normalizeColor(raw['chart-2']) ?? secondary,
    chart3: normalizeColor(raw['chart-3']) ?? accent,
    chart4: normalizeColor(raw['chart-4']) ?? mix(primary, secondary, 0.5),
    chart5: normalizeColor(raw['chart-5']) ?? mix(accent, primary, 0.5),
  };
};

// --- Main

const files = readdirSync(THEMES_DIR)
  .filter((f) => /^theme-\d+\.css$/.test(f))
  .sort((a, b) => {
    const na = parseInt(a.match(/\d+/)[0], 10);
    const nb = parseInt(b.match(/\d+/)[0], 10);
    return na - nb;
  });

const result = {};
for (const file of files) {
  const id = file.replace('.css', '');
  const css = readFileSync(join(THEMES_DIR, file), 'utf-8');
  const lightRaw = parseBlock(css, ':root');
  const darkRaw = parseBlock(css, '.dark');
  result[id] = {
    light: buildVariantColors(lightRaw, 'light'),
    dark: buildVariantColors(darkRaw, 'dark'),
  };
}

const banner = `// AUTO-GENERATED by scripts/generateThemes.mjs from themes/*.css
// Do not edit by hand. Re-run \`node scripts/generateThemes.mjs\` to regenerate.

import type { ThemeVariantColors } from './_types';

export interface GeneratedThemeEntry {
  light: ThemeVariantColors;
  dark: ThemeVariantColors;
}

export const generatedThemes: Record<string, GeneratedThemeEntry> = ${JSON.stringify(
  result,
  null,
  2,
)};
`;

writeFileSync(OUT_FILE, banner, 'utf-8');
console.log(`Generated ${files.length} themes → ${OUT_FILE}`);
