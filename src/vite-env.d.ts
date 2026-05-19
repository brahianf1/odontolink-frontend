/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HERO_VARIANT?: 'scatter' | 'split' | 'marquee';
  readonly VITE_THEME_VARIANT?: string;
  readonly VITE_FONT_PAIR?: string;
  readonly VITE_THEME_MODE?: 'light' | 'dark' | 'system';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
