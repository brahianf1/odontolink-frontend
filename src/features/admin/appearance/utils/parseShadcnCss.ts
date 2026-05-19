import type { ThemeVariantColors } from '../../../../theme/variants/_types';

/**
 * Browser-safe port of scripts/generateThemes.mjs. Parses shadcn-style
 * Tailwind v4 CSS (with `:root` light block + `.dark` block) into our
 * 42-key ThemeVariantColors shape used everywhere else in the app.
 *
 * Returns warnings + errors so the uploader UI can show what was missing
 * or derived before the admin commits the upload.
 */

export type ParseMode = 'light' | 'dark';

export interface ParsedCssResult {
  /** Either both blocks present and tokens valid → result populated. */
  light?: ThemeVariantColors;
  dark?: ThemeVariantColors;
  /** Blocking issues that prevent saving. */
  errors: string[];
  /** Non-blocking — derived tokens, missing chart colors, etc. */
  warnings: string[];
  /** Token coverage (count of explicit shadcn tokens parsed per block). */
  detected: { light: number; dark: number };
}

// ---- Required source tokens (per block) -----------------------------------

const REQUIRED_SHADCN_TOKENS = [
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'accent',
  'accent-foreground',
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'muted',
  'muted-foreground',
  'border',
  'destructive',
  'destructive-foreground',
] as const;

// ---- Color utilities ------------------------------------------------------

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const normalizeColor = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/['"]/g, '');
  if (cleaned.startsWith('#')) {
    let h = cleaned.slice(1);
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (h.length === 8) h = h.slice(0, 6);
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return `#${h.toLowerCase()}`;
  }
  // hsl(), rgb(), oklch() are present only in shadow tokens in the source
  // CSS files we support — silently dropped.
  return null;
};

const hexToRgb = (hex: string): [number, number, number] | null => {
  if (!hex.startsWith('#') || hex.length !== 7) return null;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
};

const rgbToHex = ([r, g, b]: [number, number, number]): string => {
  return (
    '#' +
    [r, g, b]
      .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0'))
      .join('')
  );
};

const mix = (c1: string, c2: string, ratio: number): string => {
  const r1 = hexToRgb(c1);
  const r2 = hexToRgb(c2);
  if (!r1 || !r2) return c1;
  return rgbToHex([
    r1[0] * (1 - ratio) + r2[0] * ratio,
    r1[1] * (1 - ratio) + r2[1] * ratio,
    r1[2] * (1 - ratio) + r2[2] * ratio,
  ]);
};

// ---- CSS block parser -----------------------------------------------------

const parseBlock = (css: string, selector: string): Record<string, string> => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const match = css.match(re);
  if (!match) return {};
  const body = match[1];
  const tokens: Record<string, string> = {};
  const lineRe = /--([\w-]+):\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = lineRe.exec(body)) !== null) {
    tokens[m[1]] = m[2].trim();
  }
  return tokens;
};

// ---- Token mapping (shadcn → ThemeVariantColors) --------------------------

const FALLBACK_LIGHT: Record<string, string> = {
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
  muted: '#f1f5f9',
  'muted-foreground': '#64748b',
  border: '#e2e8f0',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
};

const FALLBACK_DARK: Record<string, string> = {
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
  muted: '#1e293b',
  'muted-foreground': '#94a3b8',
  border: '#334155',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
};

const buildVariantColors = (
  raw: Record<string, string>,
  mode: ParseMode,
  warnings: string[],
): ThemeVariantColors => {
  const defaults = mode === 'light' ? FALLBACK_LIGHT : FALLBACK_DARK;
  const get = (key: string): string => {
    const normalized = normalizeColor(raw[key]);
    if (normalized) return normalized;
    if (raw[key] !== undefined) {
      warnings.push(`${mode}.${key}: valor inválido, se usa fallback`);
    }
    return defaults[key] ?? '#000000';
  };

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
  const input = normalizeColor(raw['input']) ?? border;
  const destructive = get('destructive');
  const destructiveForeground = get('destructive-foreground');

  const containerBase = mode === 'light' ? '#ffffff' : '#000000';
  const inkBase = mode === 'light' ? '#000000' : '#ffffff';

  const primaryContainer = mix(primary, containerBase, mode === 'light' ? 0.85 : 0.75);
  const onPrimaryContainer = mix(primary, inkBase, mode === 'light' ? 0.45 : 0.55);
  const secondaryContainer = mix(secondary, containerBase, 0.6);
  const onSecondaryContainer = secondaryForeground;
  const tertiaryContainer = mix(accent, containerBase, mode === 'light' ? 0.82 : 0.72);
  const onTertiaryContainer = mix(accent, inkBase, 0.5);
  const errorContainer = mix(destructive, containerBase, mode === 'light' ? 0.82 : 0.7);
  const onErrorContainer = mix(destructive, inkBase, mode === 'light' ? 0.45 : 0.55);

  const ladderStep = mode === 'light' ? 0.04 : 0.06;
  const surfaceContainerLowest = card;
  const surfaceContainerLow = card;
  const surfaceContainer = muted;
  const surfaceContainerHigh =
    popover && popover !== card ? popover : mix(card, foreground, ladderStep);
  const surfaceContainerHighest =
    secondary && secondary !== muted ? secondary : mix(card, foreground, ladderStep * 2);

  const chart1 = normalizeColor(raw['chart-1']) ?? primary;
  const chart2 = normalizeColor(raw['chart-2']) ?? secondary;
  const chart3 = normalizeColor(raw['chart-3']) ?? accent;
  const chart4 = normalizeColor(raw['chart-4']) ?? mix(primary, secondary, 0.5);
  const chart5 = normalizeColor(raw['chart-5']) ?? mix(accent, primary, 0.5);

  if (!raw['chart-1'] || !raw['chart-2'] || !raw['chart-3']) {
    warnings.push(`${mode}.chart-*: faltan, se derivan de primary/secondary/accent`);
  }

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
    chart1,
    chart2,
    chart3,
    chart4,
    chart5,
  };
};

// ---- Validation -----------------------------------------------------------

const validateRequired = (
  raw: Record<string, string>,
  block: ParseMode,
  errors: string[],
): void => {
  for (const key of REQUIRED_SHADCN_TOKENS) {
    if (raw[key] === undefined) {
      errors.push(`${block}.--${key}: token requerido faltante`);
    } else if (!normalizeColor(raw[key])) {
      errors.push(`${block}.--${key}: formato inválido (esperado #rrggbb)`);
    }
  }
};

// ---- Entry point ----------------------------------------------------------

export const parseShadcnCss = (css: string): ParsedCssResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lightRaw = parseBlock(css, ':root');
  const darkRaw = parseBlock(css, '.dark');

  if (Object.keys(lightRaw).length === 0) {
    errors.push('No se encontró un bloque `:root { ... }` con tokens CSS.');
  }
  if (Object.keys(darkRaw).length === 0) {
    errors.push('No se encontró un bloque `.dark { ... }` con tokens CSS.');
  }

  if (errors.length > 0) {
    return {
      errors,
      warnings,
      detected: {
        light: Object.keys(lightRaw).length,
        dark: Object.keys(darkRaw).length,
      },
    };
  }

  validateRequired(lightRaw, 'light', errors);
  validateRequired(darkRaw, 'dark', errors);

  if (errors.length > 0) {
    return {
      errors,
      warnings,
      detected: {
        light: Object.keys(lightRaw).length,
        dark: Object.keys(darkRaw).length,
      },
    };
  }

  const light = buildVariantColors(lightRaw, 'light', warnings);
  const dark = buildVariantColors(darkRaw, 'dark', warnings);

  return {
    light,
    dark,
    errors,
    warnings,
    detected: {
      light: Object.keys(lightRaw).length,
      dark: Object.keys(darkRaw).length,
    },
  };
};
