import type { ReactElement } from 'react';
import { Chip, alpha, darken, lighten, type ChipProps, type Theme } from '@mui/material';

export type StatusTone =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'primary'
  | 'secondary'
  | 'neutral';

interface StatusChipProps {
  label: string;
  tone: StatusTone;
  icon?: ReactElement;
  size?: ChipProps['size'];
  fullWidth?: boolean;
}

/**
 * Tonal status chip following Material 3 expressive guidance.
 *
 * Renders an `alpha(main, 0.14)` background tinted in the tone color, a
 * tinted border, and a text color derived per theme mode so contrast stays
 * legible in both light and dark. Prefer this over a plain `<Chip color="info" />`
 * which uses MUI's default filled treatment and produces low-contrast pairs
 * against M3 expressive palettes (info is mapped to tertiary).
 */
export default function StatusChip({
  label,
  tone,
  icon,
  size = 'small',
  fullWidth,
}: StatusChipProps) {
  return (
    <Chip
      label={label}
      icon={icon}
      size={size}
      sx={(theme: Theme) => {
        const main = resolveTone(theme, tone);
        const isLight = theme.palette.mode === 'light';
        const textColor = isLight ? darken(main, 0.32) : lighten(main, 0.2);
        const bgAlpha = isLight ? 0.14 : 0.22;
        const borderAlpha = isLight ? 0.3 : 0.4;
        return {
          bgcolor: alpha(main, bgAlpha),
          color: textColor,
          fontWeight: 600,
          border: `1px solid ${alpha(main, borderAlpha)}`,
          width: fullWidth ? '100%' : undefined,
          '& .MuiChip-icon': { color: textColor },
          '& .MuiChip-label': { fontWeight: 600 },
        };
      }}
    />
  );
}

function resolveTone(theme: Theme, tone: StatusTone): string {
  if (tone === 'neutral') {
    return theme.palette.mode === 'light'
      ? theme.palette.grey[700]
      : theme.palette.grey[400];
  }
  const palette = theme.palette[tone] as { main?: string } | undefined;
  return palette?.main ?? theme.palette.text.primary;
}
