const normalizeRole = (role?: string | null) => String(role ?? '').trim().toUpperCase();

const PATIENT_ROLES = new Set(['ROLE_PATIENT', 'PATIENT', 'PAT']);
const PRACTITIONER_ROLES = new Set(['ROLE_PRACTITIONER', 'PRACTITIONER', 'PRACT']);

export const isPatientRole = (role?: string | null): boolean => PATIENT_ROLES.has(normalizeRole(role));

export const isPractitionerRole = (role?: string | null): boolean =>
  PRACTITIONER_ROLES.has(normalizeRole(role));
