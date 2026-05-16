import { Box, Typography, useTheme } from '@mui/material';
import { formatDayDivider } from '../utils/chatTimeFormat';

interface DayDividerProps {
  isoDate: string;
}

export default function DayDivider({ isoDate }: DayDividerProps) {
  const theme = useTheme();
  const label = formatDayDivider(isoDate);
  if (!label) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        my: 1.5,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 0.4,
          backgroundColor:
            theme.palette.mode === 'dark'
              ? theme.palette.background.paper
              : theme.palette.grey[200],
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.secondary,
            textTransform: 'capitalize',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}
