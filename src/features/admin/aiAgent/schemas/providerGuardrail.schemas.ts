import { z } from 'zod';

export const providerGuardrailAttachmentSchema = z.object({
  attached: z.boolean(),
  priority: z
    .number()
    .int('Debe ser un entero.')
    .min(0, 'No puede ser negativo.')
    .max(9999, 'Máximo 9999.'),
});

export type ProviderGuardrailAttachmentFormValues = z.infer<
  typeof providerGuardrailAttachmentSchema
>;
