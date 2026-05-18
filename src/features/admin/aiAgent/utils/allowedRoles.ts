import type { AllowedRole } from '../../../../types/aiAgent.types';

export interface AllowedRoleMeta {
  value: AllowedRole;
  label: string;
  description: string;
}

export const ALLOWED_ROLES: AllowedRoleMeta[] = [
  {
    value: 'ROLE_PATIENT',
    label: 'Pacientes',
    description: 'Usuarios registrados como pacientes.',
  },
  {
    value: 'ROLE_PRACTITIONER',
    label: 'Practicantes',
    description: 'Estudiantes que atienden pacientes.',
  },
  {
    value: 'ROLE_SUPERVISOR',
    label: 'Docentes supervisores',
    description: 'Docentes que supervisan a los practicantes.',
  },
  {
    value: 'ROLE_ADMIN',
    label: 'Administradores',
    description: 'Personal administrativo de la institución.',
  },
];

export const allowedRoleMeta = (role: AllowedRole): AllowedRoleMeta => {
  const found = ALLOWED_ROLES.find((r) => r.value === role);
  return found ?? ALLOWED_ROLES[0];
};

export const allowedRoleLabel = (role: AllowedRole): string => allowedRoleMeta(role).label;
