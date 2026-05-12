import { Temporal } from 'temporal-polyfill';
import type { AppointmentResponseDTO } from '../../../types/attention.types';
import type { AppointmentStatus } from '../types/schedule.types';
import { STATUS_CONFIG } from '../types/schedule.types';

/**
 * Schedule-X v4 dropped the legacy "YYYY-MM-DD HH:mm" string format and now
 * validates events with `instanceof Temporal.ZonedDateTime`. The check is
 * identity-sensitive, so events must be built with the very same polyfill
 * copy installed globally in main.tsx (temporal-polyfill@0.3.0).
 *
 * The backend sends naive datetimes (Java LocalDateTime, e.g.
 * "2026-05-13T11:30:00") with no TZ offset. The literal semantic is "wall
 * clock at the clinic" — we anchor it to the practitioner's local timezone
 * so schedule-x renders the same hour the backend stored.
 */
export interface ScheduleXEvent {
  id: number;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  calendarId: AppointmentStatus;
  description?: string;
  /** Original DTO preserved for click-handlers that need full data. */
  _payload: AppointmentResponseDTO;
}

/**
 * Resolves the practitioner's timezone. Falling back to UTC keeps the calendar
 * functional in headless or misconfigured environments.
 */
export const getLocalTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/**
 * Converts a naive ISO datetime (no offset, no Z) into a ZonedDateTime
 * anchored to `timeZone`. `Temporal.PlainDateTime.from` keeps the wall-clock
 * components verbatim; `.toZonedDateTime` attaches the timezone without
 * doing any conversion, so the displayed hour matches what the backend
 * stored. If the backend ever switches to RFC 3339 with offset, the
 * `.from` parser keeps the wall-clock part and discards the offset, which is
 * still the right behavior for clinical wall-clock scheduling.
 */
const toZonedDateTime = (
  iso: string,
  timeZone: string
): Temporal.ZonedDateTime =>
  Temporal.PlainDateTime.from(iso).toZonedDateTime(timeZone);

export const toScheduleXEvent = (
  appointment: AppointmentResponseDTO,
  timeZone: string = getLocalTimeZone()
): ScheduleXEvent => {
  const start = toZonedDateTime(appointment.appointmentTime, timeZone);
  const end = start.add({ minutes: appointment.durationInMinutes });

  return {
    id: appointment.id,
    title: `${appointment.patientName} · ${appointment.treatmentName}`,
    start,
    end,
    calendarId: appointment.status,
    description: appointment.motive,
    _payload: appointment,
  };
};

export const toScheduleXEvents = (
  appointments: AppointmentResponseDTO[]
): ScheduleXEvent[] => {
  const tz = getLocalTimeZone();
  return appointments.map((appt) => toScheduleXEvent(appt, tz));
};

/**
 * Builds the `calendars` config consumed by schedule-x so each status
 * renders with its own color. Keys MUST match `event.calendarId`.
 */
export const buildStatusCalendars = () => ({
  SCHEDULED: {
    colorName: 'SCHEDULED',
    lightColors: {
      main: STATUS_CONFIG.SCHEDULED.hex,
      container: STATUS_CONFIG.SCHEDULED.containerHex,
      onContainer: STATUS_CONFIG.SCHEDULED.onContainerHex,
    },
    darkColors: {
      main: STATUS_CONFIG.SCHEDULED.hex,
      onContainer: '#E6F5F0',
      container: '#0A3D33',
    },
  },
  COMPLETED: {
    colorName: 'COMPLETED',
    lightColors: {
      main: STATUS_CONFIG.COMPLETED.hex,
      container: STATUS_CONFIG.COMPLETED.containerHex,
      onContainer: STATUS_CONFIG.COMPLETED.onContainerHex,
    },
    darkColors: {
      main: STATUS_CONFIG.COMPLETED.hex,
      onContainer: '#DCEFDD',
      container: '#1C401F',
    },
  },
  CANCELLED: {
    colorName: 'CANCELLED',
    lightColors: {
      main: STATUS_CONFIG.CANCELLED.hex,
      container: STATUS_CONFIG.CANCELLED.containerHex,
      onContainer: STATUS_CONFIG.CANCELLED.onContainerHex,
    },
    darkColors: {
      main: STATUS_CONFIG.CANCELLED.hex,
      onContainer: '#F8E4E4',
      container: '#5E1A1A',
    },
  },
  NO_SHOW: {
    colorName: 'NO_SHOW',
    lightColors: {
      main: STATUS_CONFIG.NO_SHOW.hex,
      container: STATUS_CONFIG.NO_SHOW.containerHex,
      onContainer: STATUS_CONFIG.NO_SHOW.onContainerHex,
    },
    darkColors: {
      main: STATUS_CONFIG.NO_SHOW.hex,
      onContainer: '#FBE5CC',
      container: '#5C2C00',
    },
  },
});
