import type {
  AiAgentConfigurationResponseDTO,
  AiGovernancePolicyResponseDTO,
  ParsedRequirement,
} from '../../../../types/aiAgent.types';

/**
 * Computa los missingRequirements que el cliente puede determinar con
 * certeza a partir de configuration + governance, sin pegarle al backend.
 * Solo incluye reglas deterministas (campos vacíos, contradicciones de
 * schema). Para reglas con count agregado (PolicyRules activas, KB docs
 * indexed) o estado runtime del proveedor, confiamos en el health
 * autoritativo del backend — esas no se computan acá.
 */
export const computeLocalRequirements = (
  configuration: AiAgentConfigurationResponseDTO | null,
  governance: AiGovernancePolicyResponseDTO | null
): ParsedRequirement[] => {
  if (!configuration || !governance) return [];
  const out: ParsedRequirement[] = [];
  if (
    governance.requireSystemPrompt &&
    (configuration.systemPromptCore == null ||
      configuration.systemPromptCore.trim().length === 0)
  ) {
    out.push({ kind: 'SYSTEM_PROMPT' });
  }
  if (
    governance.requireWelcomeMessage &&
    (configuration.welcomeMessage == null ||
      configuration.welcomeMessage.trim().length === 0)
  ) {
    out.push({ kind: 'WELCOME_MESSAGE' });
  }
  if (
    configuration.accessMode === 'PRIVATE' &&
    (!configuration.allowedRoles || configuration.allowedRoles.length === 0)
  ) {
    out.push({ kind: 'ALLOWED_ROLES_FOR_PRIVATE' });
  }
  return out;
};

const requirementKey = (req: ParsedRequirement): string => {
  switch (req.kind) {
    case 'UNKNOWN':
      return `UNKNOWN:${req.raw}`;
    case 'MIN_ACTIVE_GUARDRAILS':
      return `MIN_ACTIVE_GUARDRAILS:${req.required}`;
    default:
      return req.kind;
  }
};

/**
 * Une server + client sin duplicados, preservando orden: primero los del
 * server (autoritativos / más actualizados), después los locales que el
 * server no haya reportado todavía.
 */
export const mergeRequirements = (
  fromServer: ParsedRequirement[],
  fromClient: ParsedRequirement[]
): ParsedRequirement[] => {
  const seen = new Set<string>();
  const out: ParsedRequirement[] = [];
  const pushUnique = (req: ParsedRequirement) => {
    const key = requirementKey(req);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(req);
  };
  fromServer.forEach(pushUnique);
  fromClient.forEach(pushUnique);
  return out;
};
