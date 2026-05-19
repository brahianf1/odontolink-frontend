import type { ChipProps } from '@mui/material';
import type { ProviderGuardrailType } from '../../../../types/aiAgent.types';

interface TypeMeta {
  label: string;
  color: ChipProps['color'];
  description: string;
}

export const providerGuardrailTypeMeta = (type: ProviderGuardrailType): TypeMeta => {
  switch (type) {
    case 'JAILBREAK':
      return {
        label: 'Jailbreak',
        color: 'error',
        description: 'Detecta intentos de manipulación del prompt.',
      };
    case 'SENSITIVE_DATA':
      return {
        label: 'Datos sensibles',
        color: 'warning',
        description: 'Filtra datos personales (Presidio en DigitalOcean).',
      };
    case 'CONTENT_MODERATION':
      return {
        label: 'Moderación',
        color: 'success',
        description: 'Filtra contenido tóxico o NSFW.',
      };
    case 'OTHER':
      return {
        label: 'Otro',
        color: 'default',
        description: 'Tipo no reconocido. Revisalo en el dashboard de DigitalOcean.',
      };
  }
};
