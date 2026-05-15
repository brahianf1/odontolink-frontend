import { Box, Button, Paper, Typography, alpha } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'primary' | 'neutral';
}

/**
 * MD3-style empty state: tonal surface, prominent icon, title + supporting
 * text + optional CTA. Used when a list has zero items or a filter yields
 * no results. Stays low-key (no animations) — empty states should inform,
 * not entertain.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  tone = 'primary',
}: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        textAlign: 'center',
        py: { xs: 5, sm: 8 },
        px: 3,
        borderRadius: 3,
        border: '1px dashed',
        borderColor: tone === 'primary' ? alpha(theme.palette.primary.main, 0.3) : 'divider',
        bgcolor: tone === 'primary'
          ? alpha(theme.palette.primary.main, 0.02)
          : alpha(theme.palette.text.primary, 0.02),
      })}
    >
      <Box
        sx={(theme) => ({
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: tone === 'primary'
            ? alpha(theme.palette.primary.main, 0.08)
            : alpha(theme.palette.text.primary, 0.06),
          color: tone === 'primary' ? 'primary.main' : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2.5,
          '& svg': { fontSize: 36 },
        })}
      >
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: actionLabel ? 3 : 0, maxWidth: 480, mx: 'auto' }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ borderRadius: 999, px: 3 }}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
}
