import { parseISO, getDay, startOfDay, isBefore, isAfter } from 'date-fns';
import type { NonWorkingDayDTO } from '../types/nonWorkingDay.types';
import type { AvailabilitySlotDTO } from '../types/practitioner.types';

const DAY_NAME_TO_JS: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function findOverlappingNonWorkingDays(
  startDate: string,
  endDate: string,
  slots: AvailabilitySlotDTO[],
  nonWorkingDays: Map<string, NonWorkingDayDTO>,
): NonWorkingDayDTO[] {
  if (!startDate || !endDate || slots.length === 0 || nonWorkingDays.size === 0) return [];

  const start = startOfDay(parseISO(startDate));
  const end = startOfDay(parseISO(endDate));
  const selectedJsDays = new Set(slots.map((s) => DAY_NAME_TO_JS[s.dayOfWeek]));

  return Array.from(nonWorkingDays.values())
    .filter((nwd) => {
      const date = startOfDay(parseISO(nwd.date));
      if (isBefore(date, start) || isAfter(date, end)) return false;
      return selectedJsDays.has(getDay(date));
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
