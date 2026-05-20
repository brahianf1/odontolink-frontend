import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  caption?: string;
  action?: ReactNode;
}

/**
 * Section header used inside Cards on the attention detail pages. The
 * left side holds the icon + title + caption; the right side is a slot
 * the consumer fills with an action button if needed (e.g. "Add note").
 */
export default function SectionHeader({ icon, title, caption, action }: SectionHeaderProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {caption && (
            <Typography variant="caption" color="text.secondary">
              {caption}
            </Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}
