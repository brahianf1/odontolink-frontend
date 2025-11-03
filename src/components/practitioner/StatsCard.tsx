import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, color = 'primary', subtitle }: StatsCardProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 2,
              backgroundColor: `${color}.main`,
              color: `${color}.contrastText`,
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
