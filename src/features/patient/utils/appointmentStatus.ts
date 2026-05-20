import type { AppointmentStatus } from '../../../types/appointment.types';
import type { AttentionStatus } from '../../../types/attention.types';
import type { StatusTone } from '../../../components/common/StatusChip';

const APPOINTMENT_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Programado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'No asistió',
};

const APPOINTMENT_TONES: Record<AppointmentStatus, StatusTone> = {
  SCHEDULED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'warning',
};

const ATTENTION_LABELS: Record<AttentionStatus, string> = {
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const ATTENTION_TONES: Record<AttentionStatus, StatusTone> = {
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export const getAppointmentStatusLabel = (status: AppointmentStatus): string =>
  APPOINTMENT_LABELS[status] ?? status;

export const getAppointmentStatusTone = (status: AppointmentStatus): StatusTone =>
  APPOINTMENT_TONES[status] ?? 'neutral';

export const getAttentionStatusLabel = (status: AttentionStatus): string =>
  ATTENTION_LABELS[status] ?? status;

export const getAttentionStatusTone = (status: AttentionStatus): StatusTone =>
  ATTENTION_TONES[status] ?? 'neutral';
