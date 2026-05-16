export const CHAT_MESSAGE_MAX_LENGTH = 2000;
export const CHAT_BLOCK_REASON_MAX_LENGTH = 500;

export interface ChatMessageValidation {
  valid: boolean;
  error?: string;
  sanitized: string;
}

export function validateChatMessage(content: string): ChatMessageValidation {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: 'El mensaje no puede estar vacío.',
      sanitized: '',
    };
  }
  if (content.length > CHAT_MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `El mensaje supera el límite de ${CHAT_MESSAGE_MAX_LENGTH} caracteres.`,
      sanitized: content.slice(0, CHAT_MESSAGE_MAX_LENGTH),
    };
  }
  return { valid: true, sanitized: trimmed };
}

export interface BlockReasonValidation {
  valid: boolean;
  error?: string;
  sanitized: string;
}

export function validateBlockReason(reason: string): BlockReasonValidation {
  const trimmed = reason.trim();
  if (trimmed.length > CHAT_BLOCK_REASON_MAX_LENGTH) {
    return {
      valid: false,
      error: `El motivo supera el límite de ${CHAT_BLOCK_REASON_MAX_LENGTH} caracteres.`,
      sanitized: trimmed.slice(0, CHAT_BLOCK_REASON_MAX_LENGTH),
    };
  }
  return { valid: true, sanitized: trimmed };
}
