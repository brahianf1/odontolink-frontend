/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HERO_VARIANT?: 'scatter' | 'split' | 'marquee';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
