import type { RetrievalMethod } from '../../../../types/aiAgent.types';

export interface RetrievalMethodMeta {
  value: RetrievalMethod;
  label: string;
  description: string;
}

export const RETRIEVAL_METHODS: RetrievalMethodMeta[] = [
  {
    value: 'NONE',
    label: 'Sin transformación',
    description: 'Usa la consulta tal cual la escribe el usuario. Más rápido, menos preciso.',
  },
  {
    value: 'REWRITE',
    label: 'Reformulación (Rewrite)',
    description: 'Reescribe la consulta para optimizar la recuperación de información.',
  },
  {
    value: 'STEP_BACK',
    label: 'Paso atrás (Step Back)',
    description: 'Generaliza la consulta para encontrar contexto más amplio antes de responder.',
  },
  {
    value: 'SUB_QUERIES',
    label: 'Subconsultas (Sub-queries)',
    description: 'Divide la consulta en varias sub-preguntas y combina los resultados.',
  },
];

export const retrievalMethodMeta = (method: RetrievalMethod): RetrievalMethodMeta => {
  const found = RETRIEVAL_METHODS.find((m) => m.value === method);
  return found ?? RETRIEVAL_METHODS[0];
};
