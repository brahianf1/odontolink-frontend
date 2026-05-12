import type { AppointmentResponseDTO } from '../../../types/attention.types';

export type AppointmentStatus = AppointmentResponseDTO['status'];

export type ScheduleViewMode = 'planning' | 'daily';

export interface StatusConfig {
  label: string;
  /** MUI color key used by Chip / Button */
  color: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'default';
  /** Hex color used by schedule-x calendars */
  hex: string;
  /** Lighter shade used for the event background container */
  containerHex: string;
  /** Text color used on top of containerHex */
  onContainerHex: string;
}

export const STATUS_CONFIG: Record<AppointmentStatus, StatusConfig> = {
  SCHEDULED: {
    label: 'Programado',
    color: 'primary',
    hex: '#0D7C66',
    containerHex: '#D7EFE9',
    onContainerHex: '#053E33',
  },
  COMPLETED: {
    label: 'Completado',
    color: 'success',
    hex: '#2E7D32',
    containerHex: '#D6ECD8',
    onContainerHex: '#173F19',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'error',
    hex: '#D32F2F',
    containerHex: '#F8D7D7',
    onContainerHex: '#691818',
  },
  NO_SHOW: {
    label: 'Inasistencia',
    color: 'warning',
    hex: '#ED6C02',
    containerHex: '#FBE0C7',
    onContainerHex: '#763601',
  },
};

export interface CancelAppointmentPayload {
  appointmentId: number;
  motive: string;
}
