import type { PiiPolicy } from '../../../../types/aiAgent.types';

export interface PiiPolicyMeta {
  value: PiiPolicy;
  label: string;
  description: string;
}

export const PII_POLICIES: PiiPolicyMeta[] = [
  {
    value: 'BLOCK',
    label: 'Bloquear (recomendado)',
    description:
      'Si el usuario envía datos personales sensibles, el mensaje se bloquea y el bot responde con un copy educativo. Más seguro.',
  },
  {
    value: 'ANONYMIZE',
    label: 'Anonimizar',
    description:
      'Los datos personales detectados se anonimizan antes de enviarse al modelo. El mensaje continúa, pero con menor garantía.',
  },
];

export const piiPolicyMeta = (policy: PiiPolicy): PiiPolicyMeta => {
  const found = PII_POLICIES.find((p) => p.value === policy);
  return found ?? PII_POLICIES[0];
};
