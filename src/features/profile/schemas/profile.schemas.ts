import { z } from 'zod';
import { BLOOD_TYPES } from '../../../types/profile.types';
import { MIN_AGE_MESSAGE, isAtLeast18 } from '../../../utils/birthDateValidation';

const PHONE_REGEX = /^[0-9 +()-]*$/;

const passwordBaseSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(128, 'La contraseña no puede superar los 128 caracteres.');

export const personalInfoSchema = z.object({
  email: z
    .email('Ingresá un correo electrónico válido.')
    .max(100, 'El correo no puede superar los 100 caracteres.'),
  firstName: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio.')
    .max(100, 'El apellido no puede superar los 100 caracteres.'),
  phone: z
    .string()
    .max(20, 'El teléfono no puede superar los 20 caracteres.')
    .regex(PHONE_REGEX, 'Solo se permiten números, espacios y los símbolos + ( ) -'),
  birthDate: z
    .string()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      'Fecha de nacimiento inválida.'
    )
    .refine(
      (value) => !value || new Date(value).getTime() <= Date.now(),
      'La fecha de nacimiento no puede ser futura.'
    )
    .refine((value) => isAtLeast18(value), MIN_AGE_MESSAGE),
  address: z.string().max(255, 'La dirección no puede superar los 255 caracteres.'),
});

export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export const changeMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
    newPassword: passwordBaseSchema,
    confirmNewPassword: z.string().min(1, 'Confirmá la nueva contraseña.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual.',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changeMyPasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .email('Ingresá un correo electrónico válido.')
    .max(100, 'El correo no puede superar los 100 caracteres.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: passwordBaseSchema,
    confirmNewPassword: z.string().min(1, 'Confirmá la nueva contraseña.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const patientDetailsSchema = z.object({
  healthInsurance: z
    .string()
    .max(100, 'La obra social no puede superar los 100 caracteres.'),
  bloodType: z.union([z.literal(''), z.enum(BLOOD_TYPES)]),
});

export type PatientDetailsFormValues = z.infer<typeof patientDetailsSchema>;

export const supervisorDetailsSchema = z.object({
  specialty: z
    .string()
    .trim()
    .min(1, 'La especialidad es obligatoria.')
    .max(100, 'La especialidad no puede superar los 100 caracteres.'),
});

export type SupervisorDetailsFormValues = z.infer<typeof supervisorDetailsSchema>;
