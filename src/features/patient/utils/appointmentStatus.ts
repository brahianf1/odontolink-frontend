import type { AppointmentStatus } from '../../../types/appointment.types';
import type { AttentionStatus } from '../../../types/attention.types';

type MuiStatusColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const APPOINTMENT_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: 'Programado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'No asistió',
};

const APPOINTMENT_COLORS: Record<AppointmentStatus, MuiStatusColor> = {
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

const ATTENTION_COLORS: Record<AttentionStatus, MuiStatusColor> = {
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export const getAppointmentStatusLabel = (status: AppointmentStatus): string =>
  APPOINTMENT_LABELS[status] ?? status;

export const getAppointmentStatusColor = (status: AppointmentStatus): MuiStatusColor =>
  APPOINTMENT_COLORS[status] ?? 'default';

export const getAttentionStatusLabel = (status: AttentionStatus): string =>
  ATTENTION_LABELS[status] ?? status;

export const getAttentionStatusColor = (status: AttentionStatus): MuiStatusColor =>
  ATTENTION_COLORS[status] ?? 'default';
