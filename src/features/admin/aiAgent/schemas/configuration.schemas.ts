import { z } from 'zod';

const ALLOWED_ROLE_VALUES = [
  'ROLE_PATIENT',
  'ROLE_PRACTITIONER',
  'ROLE_SUPERVISOR',
  'ROLE_ADMIN',
] as const;

export const configurationFormSchema = z
  .object({
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
    accessMode: z.enum(['PUBLIC', 'PRIVATE', 'DISABLED']),
    allowedRoles: z.array(z.enum(ALLOWED_ROLE_VALUES)),
    piiPolicy: z.enum(['BLOCK', 'ANONYMIZE']),
    conversationBufferSize: z
      .number()
      .int('Debe ser un entero.')
      .min(4, 'Mínimo 4 mensajes.')
      .max(50, 'Máximo 50 mensajes.'),
    rateLimitAnonymousPerHour: z
      .number()
      .int('Debe ser un entero.')
      .min(1, 'Mínimo 1.')
      .max(1000, 'Máximo 1000.'),
    rateLimitAuthenticatedPerHour: z
      .number()
      .int('Debe ser un entero.')
      .min(1, 'Mínimo 1.')
      .max(5000, 'Máximo 5000.'),
    emergencyBannerText: z
      .string()
      .trim()
      .min(1, 'El texto de emergencia es obligatorio.')
      .max(500, 'No puede superar los 500 caracteres.'),
    provideCitations: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.accessMode === 'PRIVATE' && values.allowedRoles.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowedRoles'],
        message: 'Seleccioná al menos un rol cuando el modo es PRIVADO.',
      });
    }
  });

export type ConfigurationFormValues = z.infer<typeof configurationFormSchema>;

export const DEFAULT_EMERGENCY_BANNER_TEXT =
  '*** ATENCIÓN: si esto es una emergencia, comunicate con el servicio de emergencias o acudí a la guardia más cercana. ***';

export const DEFAULT_CONFIG_VALUES: ConfigurationFormValues = {
  displayName: '',
  systemPromptCore: '',
  welcomeMessage: '',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 256,
  k: 5,
  retrievalMethod: 'REWRITE',
  accessMode: 'PUBLIC',
  allowedRoles: [],
  piiPolicy: 'BLOCK',
  conversationBufferSize: 20,
  rateLimitAnonymousPerHour: 20,
  rateLimitAuthenticatedPerHour: 60,
  emergencyBannerText: DEFAULT_EMERGENCY_BANNER_TEXT,
  provideCitations: false,
};
