import type {
  ChatSessionResponseDTO,
  ChatViewerRole,
} from '../types/chat.types';

export interface ChatCounterpart {
  userId: number;
  name: string;
  initials: string;
  roleLabel: string;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getCounterpart(
  session: ChatSessionResponseDTO,
  viewerRole: ChatViewerRole
): ChatCounterpart {
  if (viewerRole === 'PRACTITIONER') {
    return {
      userId: session.patientId,
      name: session.patientName,
      initials: getInitials(session.patientName),
      roleLabel: 'Paciente',
    };
  }
  return {
    userId: session.practitionerId,
    name: session.practitionerName,
    initials: getInitials(session.practitionerName),
    roleLabel: 'Practicante',
  };
}

export function normalizeRoleName(role?: string | null): string {
  if (!role) return '';
  return role.replace(/^ROLE_/i, '').toUpperCase();
}

/**
 * Whether the viewer is the one who blocked the session.
 * Falls back to role-matching if blockedByUserId is missing on legacy payloads.
 */
export function isBlockedByViewer(
  session: ChatSessionResponseDTO,
  viewerUserId: number | undefined,
  viewerRole: ChatViewerRole
): boolean {
  if (!session.blocked) return false;
  if (viewerUserId && session.blockedByUserId) {
    return session.blockedByUserId === viewerUserId;
  }
  const role = normalizeRoleName(session.blockedByRole);
  return role === viewerRole;
}

export function viewerIsSender(
  message: { senderId: number },
  viewerUserId: number | undefined
): boolean {
  return viewerUserId !== undefined && message.senderId === viewerUserId;
}
