export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ConfidenceMeta {
  level: ConfidenceLevel;
  label: string;
  color: 'success' | 'warning' | 'error';
}

export const confidenceMeta = (value: number): ConfidenceMeta => {
  if (value >= 70) return { level: 'high', label: 'Alta', color: 'success' };
  if (value >= 40) return { level: 'medium', label: 'Media', color: 'warning' };
  return { level: 'low', label: 'Baja', color: 'error' };
};
