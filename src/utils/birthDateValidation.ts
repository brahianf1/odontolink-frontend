export const MIN_AGE = 18;

const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

const toLocalYYYYMMDD = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getMaxBirthDate = (today: Date = new Date()): string => {
  const max = new Date(
    today.getFullYear() - MIN_AGE,
    today.getMonth(),
    today.getDate()
  );
  return toLocalYYYYMMDD(max);
};

const parseYYYYMMDD = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isAtLeast18 = (value: string, today: Date = new Date()): boolean => {
  if (!value) return true;
  const birth = parseYYYYMMDD(value);
  if (!birth) return true;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age >= MIN_AGE;
};

export const MIN_AGE_MESSAGE = `Debes tener al menos ${MIN_AGE} años.`;

export const validateBirthDateMinAge = (value: string): string | null => {
  if (!value) return null;
  return isAtLeast18(value) ? null : MIN_AGE_MESSAGE;
};

export const validateBirthDateFull = (value: string): string | null => {
  if (!value) return null;
  const parsed = parseYYYYMMDD(value);
  if (!parsed) return 'Fecha inválida';
  if (parsed.getTime() > Date.now()) return 'La fecha no puede ser futura';
  if (!isAtLeast18(value)) return MIN_AGE_MESSAGE;
  return null;
};
