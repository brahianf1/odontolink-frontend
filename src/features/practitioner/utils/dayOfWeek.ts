import type { AvailabilitySlotDTO } from '../../../types/practitioner.types';

export type DayOfWeek = AvailabilitySlotDTO['dayOfWeek'];

export const DAYS_OF_WEEK: ReadonlyArray<{ value: DayOfWeek; label: string }> = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export const DAY_LABELS: Record<DayOfWeek, string> = DAYS_OF_WEEK.reduce(
  (acc, d) => ({ ...acc, [d.value]: d.label }),
  {} as Record<DayOfWeek, string>
);

const ORDER: Record<DayOfWeek, number> = DAYS_OF_WEEK.reduce(
  (acc, d, idx) => ({ ...acc, [d.value]: idx }),
  {} as Record<DayOfWeek, number>
);

export const compareDays = (a: DayOfWeek, b: DayOfWeek): number =>
  ORDER[a] - ORDER[b];

/** Convert "HH:mm" or "HH:mm:ss" to a numeric minute-of-day for ordering. */
export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':');
  return Number(h) * 60 + Number(m ?? 0);
};

export const ensureSeconds = (time: string): string =>
  time.length === 5 ? `${time}:00` : time;

export const stripSeconds = (time: string): string => time.substring(0, 5);
