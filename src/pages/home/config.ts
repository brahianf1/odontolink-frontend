export type HeroVariant = 'scatter' | 'split' | 'marquee';

const ENV_VARIANT = import.meta.env.VITE_HERO_VARIANT as HeroVariant | undefined;

const VALID: ReadonlySet<HeroVariant> = new Set(['scatter', 'split', 'marquee']);

export const HERO_VARIANT: HeroVariant =
  ENV_VARIANT && VALID.has(ENV_VARIANT) ? ENV_VARIANT : 'scatter';
