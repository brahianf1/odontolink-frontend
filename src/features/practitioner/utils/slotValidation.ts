import type { AvailabilitySlotDTO } from '../../../types/practitioner.types';
import { timeToMinutes } from './dayOfWeek';

export interface SlotIssue {
  index: number;
  message: string;
}

export const validateSlot = (slot: AvailabilitySlotDTO): string | null => {
  if (!slot.dayOfWeek) return 'Selecciona el día de la semana';
  if (!slot.startTime || !slot.endTime) return 'Indica hora de inicio y fin';
  if (timeToMinutes(slot.startTime) >= timeToMinutes(slot.endTime)) {
    return 'La hora de inicio debe ser anterior a la de fin';
  }
  return null;
};

/**
 * Detects two kinds of conflicts inside a single offer:
 *  - Same day, overlapping time ranges.
 *  - Invalid individual slots (range inverted, missing field).
 *
 * Backend may additionally reject inter-offer collisions with 422; that
 * mapping lives in apiErrors.ts.
 */
export const findSlotConflicts = (
  slots: ReadonlyArray<AvailabilitySlotDTO>
): SlotIssue[] => {
  const issues: SlotIssue[] = [];

  slots.forEach((slot, index) => {
    const reason = validateSlot(slot);
    if (reason) issues.push({ index, message: reason });
  });

  for (let i = 0; i < slots.length; i++) {
    const a = slots[i];
    if (validateSlot(a)) continue;
    const aStart = timeToMinutes(a.startTime);
    const aEnd = timeToMinutes(a.endTime);

    for (let j = i + 1; j < slots.length; j++) {
      const b = slots[j];
      if (a.dayOfWeek !== b.dayOfWeek || validateSlot(b)) continue;
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      const overlap = aStart < bEnd && bStart < aEnd;
      if (overlap) {
        issues.push({
          index: j,
          message: `Se solapa con el horario ${i + 1} del mismo día`,
        });
      }
    }
  }

  return issues;
};
