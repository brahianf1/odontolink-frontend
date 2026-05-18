import type { AccessMode } from '../../../../types/aiAgent.types';

export interface AccessModeMeta {
  value: AccessMode;
  label: string;
  description: string;
  color: 'success' | 'warning' | 'default';
}

export const ACCESS_MODES: AccessModeMeta[] = [
  {
    value: 'PUBLIC',
    label: 'Público',
    description: 'Cualquier persona puede usar el chatbot, incluso sin iniciar sesión.',
    color: 'success',
  },
  {
    value: 'PRIVATE',
    label: 'Privado',
    description: 'Solo usuarios autenticados con roles permitidos pueden acceder.',
    color: 'warning',
  },
  {
    value: 'DISABLED',
    label: 'Desactivado',
    description: 'El chatbot no está disponible para ningún tipo de usuario.',
    color: 'default',
  },
];

export const accessModeMeta = (mode: AccessMode): AccessModeMeta => {
  const found = ACCESS_MODES.find((m) => m.value === mode);
  return found ?? ACCESS_MODES[0];
};
