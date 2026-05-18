import { z } from 'zod';

export const emergencyKeywordFormSchema = z.object({
  term: z
    .string()
    .trim()
    .min(1, 'La palabra es obligatoria.')
    .max(100, 'No puede superar los 100 caracteres.'),
  active: z.boolean(),
});

export type EmergencyKeywordFormValues = z.infer<typeof emergencyKeywordFormSchema>;

export const DEFAULT_EMERGENCY_KEYWORD_VALUES: EmergencyKeywordFormValues = {
  term: '',
  active: true,
};
