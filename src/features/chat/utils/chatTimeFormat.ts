import { format, isToday, isYesterday, parseISO, isSameYear } from 'date-fns';
import { es } from 'date-fns/locale';

function safeParse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  try {
    const d = parseISO(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function formatMessageTime(iso: string): string {
  const d = safeParse(iso);
  if (!d) return '';
  if (isToday(d)) return format(d, 'HH:mm', { locale: es });
  if (isYesterday(d)) return `Ayer ${format(d, 'HH:mm', { locale: es })}`;
  if (isSameYear(d, new Date())) {
    return format(d, "d 'de' MMM, HH:mm", { locale: es });
  }
  return format(d, "d MMM yyyy, HH:mm", { locale: es });
}

export function formatSessionPreviewTime(
  iso: string | null | undefined
): string {
  const d = safeParse(iso);
  if (!d) return '';
  if (isToday(d)) return format(d, 'HH:mm', { locale: es });
  if (isYesterday(d)) return 'Ayer';
  if (isSameYear(d, new Date())) return format(d, 'd MMM', { locale: es });
  return format(d, 'dd/MM/yyyy', { locale: es });
}

export function formatDayDivider(iso: string): string {
  const d = safeParse(iso);
  if (!d) return '';
  if (isToday(d)) return 'Hoy';
  if (isYesterday(d)) return 'Ayer';
  if (isSameYear(d, new Date())) {
    return format(d, "EEEE d 'de' MMMM", { locale: es });
  }
  return format(d, "EEEE d 'de' MMMM yyyy", { locale: es });
}

export function isSameDay(a: string, b: string): boolean {
  const da = safeParse(a);
  const db = safeParse(b);
  if (!da || !db) return false;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}
