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

export type ScheduleDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Visual tokens applied to the calendar grid and day header. We keep them in
 * one place so the toggle, the store and the CalendarView all stay in sync.
 * gridHeight feeds schedule-x's weekOptions; the rest target CSS custom
 * selectors scoped to our wrapper.
 */
export interface DensityTokens {
  /** Total pixel height of the time grid (with 28 rows of 30min). */
  gridHeight: number;
  /** Vertical padding of `.sx__week-grid__date` (each day column header). */
  dateColumnPaddingY: string;
  /** Width/height of `.sx__week-grid__date-number` (date circle). */
  dateNumberSize: string;
  /** Font size of the date number. */
  dateNumberFontSize: string;
  /** Font size of the day name label ("LUN", "MAR", …). */
  dayNameFontSize: string;
}

export const DENSITY_TOKENS: Record<ScheduleDensity, DensityTokens> = {
  compact: {
    gridHeight: 840,
    dateColumnPaddingY: '2px',
    dateNumberSize: '1.4em',
    dateNumberFontSize: '0.9rem',
    dayNameFontSize: '0.7rem',
  },
  comfortable: {
    gridHeight: 1120,
    dateColumnPaddingY: '6px',
    dateNumberSize: '1.7em',
    dateNumberFontSize: '1.05rem',
    dayNameFontSize: '0.75rem',
  },
  spacious: {
    gridHeight: 1400,
    dateColumnPaddingY: '10px',
    dateNumberSize: '2em',
    dateNumberFontSize: '1.2rem',
    dayNameFontSize: '0.8rem',
  },
};

export const DENSITY_LABELS: Record<ScheduleDensity, string> = {
  compact: 'Compacta',
  comfortable: 'Cómoda',
  spacious: 'Espaciosa',
};
