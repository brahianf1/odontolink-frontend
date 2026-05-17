import { z } from 'zod';

export const configurationFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'El nombre del agente es obligatorio.')
    .max(150, 'El nombre no puede superar los 150 caracteres.'),
  systemPromptCore: z
    .string()
    .trim()
    .min(10, 'El system prompt debe tener al menos 10 caracteres.')
    .max(8000, 'El system prompt no puede superar los 8000 caracteres.'),
  welcomeMessage: z
    .string()
    .max(2000, 'El mensaje de bienvenida no puede superar los 2000 caracteres.')
    .optional()
    .or(z.literal('')),
  temperature: z
    .number()
    .min(0, 'La temperatura debe ser ≥ 0.')
    .max(1, 'La temperatura debe ser ≤ 1.'),
  topP: z
    .number()
    .min(0, 'Top-P debe ser ≥ 0.')
    .max(1, 'Top-P debe ser ≤ 1.'),
  maxTokens: z
    .number()
    .int('Debe ser un entero.')
    .min(1, 'Mínimo 1.')
    .max(512, 'Máximo 512.')
    .optional(),
  k: z
    .number()
    .int('Debe ser un entero.')
    .min(1, 'Mínimo 1.')
    .max(50, 'Máximo 50.')
    .optional(),
  retrievalMethod: z.enum(['REWRITE', 'STEP_BACK', 'SUB_QUERIES', 'NONE']),
});

export type ConfigurationFormValues = z.infer<typeof configurationFormSchema>;

export const DEFAULT_CONFIG_VALUES: ConfigurationFormValues = {
  displayName: '',
  systemPromptCore: '',
  welcomeMessage: '',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 256,
  k: 5,
  retrievalMethod: 'REWRITE',
};
