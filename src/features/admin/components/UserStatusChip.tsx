import { Chip } from '@mui/material';
import { CheckCircleOutline, HighlightOff } from '@mui/icons-material';

interface UserStatusChipProps {
  active: boolean;
  size?: 'small' | 'medium';
}

export default function UserStatusChip({ active, size = 'small' }: UserStatusChipProps) {
  return (
    <Chip
      icon={active ? <CheckCircleOutline /> : <HighlightOff />}
      label={active ? 'Activo' : 'Inactivo'}
      color={active ? 'success' : 'default'}
      size={size}
      variant={active ? 'filled' : 'outlined'}
      sx={{ fontWeight: 600 }}
    />
  );
}
