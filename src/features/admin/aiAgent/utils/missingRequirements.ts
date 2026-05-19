import type { ParsedRequirement } from '../../../../types/aiAgent.types';

const MIN_ACTIVE_GUARDRAILS_RE = /^REQUIRES_MIN_ACTIVE_GUARDRAILS:(\d+):have:(\d+)$/;

export const parseRequirement = (raw: string): ParsedRequirement => {
  if (raw === 'REQUIRES_SYSTEM_PROMPT') return { kind: 'SYSTEM_PROMPT' };
  if (raw === 'REQUIRES_WELCOME_MESSAGE') return { kind: 'WELCOME_MESSAGE' };
  if (raw === 'REQUIRES_INDEXED_DOCUMENTS') return { kind: 'INDEXED_DOCUMENTS' };
  if (raw === 'REQUIRES_ALLOWED_ROLES_FOR_PRIVATE') {
    return { kind: 'ALLOWED_ROLES_FOR_PRIVATE' };
  }
  const match = MIN_ACTIVE_GUARDRAILS_RE.exec(raw);
  if (match) {
    return {
      kind: 'MIN_ACTIVE_GUARDRAILS',
      required: Number(match[1]),
      current: Number(match[2]),
    };
  }
  return { kind: 'UNKNOWN', raw };
};

export const parseRequirements = (raws: string[] | undefined | null): ParsedRequirement[] => {
  if (!raws || raws.length === 0) return [];
  return raws.map(parseRequirement);
};

export const requirementLabel = (req: ParsedRequirement): string => {
  switch (req.kind) {
    case 'SYSTEM_PROMPT':
      return 'Definí un prompt de sistema para el agente.';
    case 'WELCOME_MESSAGE':
      return 'Definí un mensaje de bienvenida.';
    case 'INDEXED_DOCUMENTS':
      return 'Subí al menos un documento que se haya indexado correctamente.';
    case 'MIN_ACTIVE_GUARDRAILS':
      return `Activá al menos ${req.required} ${
        req.required === 1 ? 'regla de comportamiento' : 'reglas de comportamiento'
      } (tenés ${req.current}).`;
    case 'ALLOWED_ROLES_FOR_PRIVATE':
      return 'Seleccioná al menos un rol permitido cuando el modo de acceso es PRIVADO.';
    case 'UNKNOWN':
      return req.raw;
  }
};
