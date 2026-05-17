import { z } from 'zod';

export const governanceFormSchema = z
  .object({
    requireSystemPrompt: z.boolean(),
    requireWelcomeMessage: z.boolean(),
    requireGuardrails: z.boolean(),
    minActiveGuardrails: z
      .number()
      .int('Debe ser un entero.')
      .min(0, 'Mínimo 0.')
      .max(50, 'Máximo 50.'),
    requireIndexedDocuments: z.boolean(),
    allowOverride: z.boolean(),
  })
  .refine(
    (data) => (data.requireGuardrails ? data.minActiveGuardrails >= 1 : true),
    {
      message:
        'Si exigís guardrails, debe haber al menos 1 guardrail activo como mínimo.',
      path: ['minActiveGuardrails'],
    }
  );

export type GovernanceFormValues = z.infer<typeof governanceFormSchema>;

export const DEFAULT_GOVERNANCE_VALUES: GovernanceFormValues = {
  requireSystemPrompt: true,
  requireWelcomeMessage: false,
  requireGuardrails: true,
  minActiveGuardrails: 1,
  requireIndexedDocuments: true,
  allowOverride: false,
};
