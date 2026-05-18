import type { DetectedPiiType } from '../../../types/chatbot.types';

const LABELS: Record<DetectedPiiType, string> = {
  DNI: 'DNI',
  CUIT: 'CUIT',
  CBU: 'CBU',
  CREDIT_CARD: 'Tarjeta de crédito',
  EMAIL: 'Email',
  PHONE_AR: 'Teléfono',
};

export const piiTypeLabel = (type: DetectedPiiType): string => LABELS[type] ?? type;

export const piiTypesToText = (types: DetectedPiiType[]): string => {
  if (types.length === 0) return '';
  return types.map(piiTypeLabel).join(', ');
};
