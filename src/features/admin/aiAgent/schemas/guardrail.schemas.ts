import { z } from 'zod';

export const guardrailFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  text: z
    .string()
    .trim()
    .min(5, 'El texto debe tener al menos 5 caracteres.')
    .max(2000, 'El texto no puede superar los 2000 caracteres.'),
  active: z.boolean(),
});

export type GuardrailFormValues = z.infer<typeof guardrailFormSchema>;

export const DEFAULT_GUARDRAIL_VALUES: GuardrailFormValues = {
  label: '',
  text: '',
  active: true,
};
