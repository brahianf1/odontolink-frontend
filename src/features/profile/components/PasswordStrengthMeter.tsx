import { Box, LinearProgress, Stack, Typography } from '@mui/material';

interface PasswordStrengthMeterProps {
  value: string;
}

interface Score {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: 'error' | 'warning' | 'info' | 'success';
}

const scorePassword = (password: string): Score => {
  if (!password) {
    return { level: 0, label: 'Sin contraseña', color: 'error' };
  }
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length < 8) {
    return { level: 1, label: 'Demasiado corta', color: 'error' };
  }
  if (score <= 2) return { level: 2, label: 'Aceptable', color: 'warning' };
  if (score === 3) return { level: 3, label: 'Buena', color: 'info' };
  return { level: 4, label: 'Fuerte', color: 'success' };
};

export function PasswordStrengthMeter({ value }: PasswordStrengthMeterProps) {
  const { level, label, color } = scorePassword(value);
  const progress = (level / 4) * 100;

  return (
    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Seguridad
        </Typography>
        <Typography variant="caption" color={`${color}.main`} fontWeight={600}>
          {label}
        </Typography>
      </Box>
    </Stack>
  );
}
