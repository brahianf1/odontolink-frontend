const EMAIL_REGEX = /^[\w!#$%&'*+/=?`{|}~^.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DNI_REGEX = /^[0-9]{7,8}$/;
const PHONE_REGEX = /^[0-9 +()-]*$/;
const BLOOD_TYPE_REGEX = /^(A|B|AB|O)[+-]$/;

export const isNonEmpty = (value: string | undefined | null): boolean =>
  !!value && value.trim().length > 0;

export const validateEmail = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'El correo electrónico es obligatorio';
  if (value.length > 100) return 'El correo no puede superar los 100 caracteres';
  if (!EMAIL_REGEX.test(value)) return 'Formato de correo inválido';
  return null;
};

export const validatePassword = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'La contraseña es obligatoria';
  if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  if (value.length > 100) return 'La contraseña no puede superar los 100 caracteres';
  return null;
};

export const validateConfirmPassword = (password: string, confirm: string): string | null => {
  if (!isNonEmpty(confirm)) return 'Confirma la contraseña';
  if (password !== confirm) return 'Las contraseñas no coinciden';
  return null;
};

export const validateName = (value: string, label: string): string | null => {
  if (!isNonEmpty(value)) return `${label} es obligatorio`;
  if (value.length > 100) return `${label} no puede superar los 100 caracteres`;
  return null;
};

export const validateDni = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'El DNI es obligatorio';
  if (!DNI_REGEX.test(value)) return 'El DNI debe contener 7 u 8 dígitos numéricos';
  return null;
};

export const validatePhone = (value: string): string | null => {
  if (!value) return null;
  if (value.length > 20) return 'El teléfono no puede superar los 20 caracteres';
  if (!PHONE_REGEX.test(value)) return 'Solo se permiten números, espacios y los símbolos + ( ) -';
  return null;
};

import { validateBirthDateFull } from '../../../utils/birthDateValidation';

export const validateBirthDate = (value: string): string | null =>
  validateBirthDateFull(value);

export const validateStudentId = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'El legajo es obligatorio';
  if (value.length > 50) return 'El legajo no puede superar los 50 caracteres';
  return null;
};

export const validateEmployeeId = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'El número de empleado es obligatorio';
  if (value.length > 50) return 'El número de empleado no puede superar los 50 caracteres';
  return null;
};

export const validateSpecialty = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'La especialidad es obligatoria';
  if (value.length > 100) return 'La especialidad no puede superar los 100 caracteres';
  return null;
};

export const validateStudyYear = (value: number): string | null => {
  if (!Number.isInteger(value) || value < 1 || value > 6) {
    return 'El año de cursado debe estar entre 1 y 6';
  }
  return null;
};

export const validateBloodType = (value: string): string | null => {
  if (!value) return null;
  if (!BLOOD_TYPE_REGEX.test(value)) return 'Grupo sanguíneo inválido';
  return null;
};

export const validateInstitutionName = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'El nombre de la institución es obligatorio';
  if (value.length > 200) return 'No puede superar los 200 caracteres';
  return null;
};

export const validateMaxConcurrentAppointments = (value: number): string | null => {
  if (!Number.isInteger(value) || value < 1) {
    return 'Debe ser un número entero mayor o igual a 1';
  }
  return null;
};

export const validateMaxLength = (
  value: string | undefined,
  max: number,
  label: string
): string | null => {
  if (!value) return null;
  if (value.length > max) return `${label} no puede superar los ${max} caracteres`;
  return null;
};

export const validateTreatmentName = (value: string): string | null => {
  if (!isNonEmpty(value)) return 'El nombre del tratamiento es obligatorio';
  if (value.length > 100) return 'El nombre no puede superar los 100 caracteres';
  return null;
};

export const validateTreatmentDescription = (value: string): string | null => {
  if (!value) return null;
  if (value.length > 500) return 'La descripción no puede superar los 500 caracteres';
  return null;
};

export const validateTreatmentArea = (value: string): string | null => {
  if (!value) return null;
  if (value.length > 50) return 'El área no puede superar los 50 caracteres';
  return null;
};

export const collectErrors = (
  results: Record<string, string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const key of Object.keys(results)) {
    const value = results[key];
    if (value) errors[key] = value;
  }
  return errors;
};
