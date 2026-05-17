import type { AiAgentLifecycle } from '../../../../types/aiAgent.types';

export interface LifecycleMeta {
  label: string;
  color: 'default' | 'warning' | 'success';
  description: string;
}

export const lifecycleMeta = (lifecycle: AiAgentLifecycle): LifecycleMeta => {
  switch (lifecycle) {
    case 'UNCONFIGURED':
      return {
        label: 'No configurado',
        color: 'default',
        description: 'El agente todavía no fue configurado.',
      };
    case 'DRAFT':
      return {
        label: 'Borrador',
        color: 'warning',
        description: 'Hay cambios sin publicar.',
      };
    case 'PUBLISHED':
      return {
        label: 'Publicado',
        color: 'success',
        description: 'El agente está en producción.',
      };
  }
};

export const canPublish = (lifecycle: AiAgentLifecycle): boolean => lifecycle === 'DRAFT';

export const canRevert = (lifecycle: AiAgentLifecycle): boolean => lifecycle === 'PUBLISHED';
