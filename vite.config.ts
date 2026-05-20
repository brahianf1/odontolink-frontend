import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { generatedThemes } from './src/theme/variants/generated';

/**
 * Substitute the boot-paint colour placeholders in `index.html` with the
 * background/onBackground/primary tokens of the variant identified by
 * `VITE_THEME_VARIANT` at build time. This is what makes the very first
 * frame painted by the browser match the env-default theme — without this
 * plugin the HTML would carry hard-coded Mint Green defaults and a
 * non-default `VITE_THEME_VARIANT` would briefly flash that fallback
 * before React mounts and applies the real theme.
 *
 * Unknown ids (including `odontolink-original`, which is computed at
 * runtime via material-color-utilities and not present in
 * `generatedThemes`) fall back to `theme-26` so the build never breaks.
 */
function odontolinkBootColorsPlugin(variantId: string): Plugin {
  return {
    name: 'odl-boot-colors',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const resolved =
          generatedThemes[variantId] ?? generatedThemes['theme-26'];
        if (!resolved) return html;
        return html
          .replaceAll('%ODL_BG_LIGHT%', resolved.light.background)
          .replaceAll('%ODL_BG_DARK%', resolved.dark.background)
          .replaceAll('%ODL_FG_LIGHT%', resolved.light.onBackground)
          .replaceAll('%ODL_FG_DARK%', resolved.dark.onBackground)
          .replaceAll('%ODL_ACCENT_LIGHT%', resolved.light.primary)
          .replaceAll('%ODL_ACCENT_DARK%', resolved.dark.primary);
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files (.env, .env.local, .env.[mode], .env.[mode].local) for the
  // current mode so the boot-colors plugin can resolve `VITE_THEME_VARIANT`
  // exactly the way the client bundle will later see it.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const variantId = env.VITE_THEME_VARIANT?.trim() || 'theme-26';
  return {
    plugins: [react(), odontolinkBootColorsPlugin(variantId)],
    base: '/',
  };
});
