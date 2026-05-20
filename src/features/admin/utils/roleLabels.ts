import type { AdminUserRole } from '../../../types/admin.types';
import type { StatusTone } from '../../../components/common/StatusChip';

export const ROLE_LABEL: Record<AdminUserRole, string> = {
  ROLE_PATIENT: 'Paciente',
  ROLE_PRACTITIONER: 'Practicante',
  ROLE_SUPERVISOR: 'Docente',
  ROLE_ADMIN: 'Administrador',
};

export const getRoleLabel = (role: string): string => {
  return ROLE_LABEL[role as AdminUserRole] ?? role;
};

export const ROLE_TONE: Record<AdminUserRole, StatusTone> = {
  ROLE_PATIENT: 'primary',
  ROLE_PRACTITIONER: 'info',
  ROLE_SUPERVISOR: 'secondary',
  ROLE_ADMIN: 'warning',
};

export const getRoleTone = (role: string): StatusTone => {
  return ROLE_TONE[role as AdminUserRole] ?? 'neutral';
};
