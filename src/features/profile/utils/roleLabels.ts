export const normalizeRole = (role: string | undefined | null): string => {
  if (!role) return '';
  return role.replace(/^ROLE_/i, '').toUpperCase();
};

const ROLE_LABELS: Record<string, string> = {
  PATIENT: 'Paciente',
  PRACTITIONER: 'Practicante',
  SUPERVISOR: 'Docente',
  ADMIN: 'Administrador',
};

export const getRoleLabel = (role: string | undefined | null): string => {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized] ?? normalized;
};

export const getProfilePathForRole = (role: string | undefined | null): string => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case 'PATIENT':
      return '/patient/profile';
    case 'PRACTITIONER':
      return '/practitioner/profile';
    case 'SUPERVISOR':
      return '/supervisor/profile';
    case 'ADMIN':
      return '/admin/profile';
    default:
      return '/';
  }
};
