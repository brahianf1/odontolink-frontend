import StatusChip from '../../../components/common/StatusChip';
import { getRoleLabel, getRoleTone } from '../utils/roleLabels';

interface UserRoleChipProps {
  role: string;
  size?: 'small' | 'medium';
}

export default function UserRoleChip({ role, size = 'small' }: UserRoleChipProps) {
  return <StatusChip label={getRoleLabel(role)} tone={getRoleTone(role)} size={size} />;
}
