import { Chip } from '@mui/material';
import { getRoleColor, getRoleLabel } from '../utils/roleLabels';

interface UserRoleChipProps {
  role: string;
  size?: 'small' | 'medium';
}

export default function UserRoleChip({ role, size = 'small' }: UserRoleChipProps) {
  return (
    <Chip
      label={getRoleLabel(role)}
      color={getRoleColor(role)}
      size={size}
      variant="outlined"
      sx={{ fontWeight: 600 }}
    />
  );
}
