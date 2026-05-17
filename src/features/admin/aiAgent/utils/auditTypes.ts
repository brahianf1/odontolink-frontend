import type { AiAdminAuditEventType } from '../../../../types/aiAgent.types';

export interface AuditTypeMeta {
  label: string;
  color: 'default' | 'success' | 'error' | 'warning' | 'info';
}

export const auditTypeMeta = (type: AiAdminAuditEventType): AuditTypeMeta => {
  switch (type) {
    case 'AGENT_PUBLISH':
      return { label: 'Publicación', color: 'success' };
    case 'AGENT_PUBLISH_FAILED':
      return { label: 'Publicación fallida', color: 'error' };
    case 'AGENT_ROLLBACK':
      return { label: 'Rollback', color: 'warning' };
    case 'GOVERNANCE_POLICY_UPDATED':
      return { label: 'Política actualizada', color: 'info' };
  }
};
