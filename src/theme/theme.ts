import { createAppTheme } from './createAppTheme';
export type { M3ColorScheme } from './tokens/palette';
export { SEED_COLOR_HEX } from './tokens/palette';

export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');
