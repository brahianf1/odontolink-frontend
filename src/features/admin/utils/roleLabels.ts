import type { AdminUserRole } from '../../../types/admin.types';

export const ROLE_LABEL: Record<AdminUserRole, string> = {
  ROLE_PATIENT: 'Paciente',
  ROLE_PRACTITIONER: 'Practicante',
  ROLE_SUPERVISOR: 'Docente',
  ROLE_ADMIN: 'Administrador',
};

export const getRoleLabel = (role: string): string => {
  return ROLE_LABEL[role as AdminUserRole] ?? role;
};

export const ROLE_COLOR: Record<AdminUserRole, 'primary' | 'secondary' | 'info' | 'warning'> = {
  ROLE_PATIENT: 'primary',
  ROLE_PRACTITIONER: 'info',
  ROLE_SUPERVISOR: 'secondary',
  ROLE_ADMIN: 'warning',
};

export const getRoleColor = (
  role: string
): 'primary' | 'secondary' | 'info' | 'warning' | 'default' => {
  return ROLE_COLOR[role as AdminUserRole] ?? 'default';
};
