export const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIMES: Record<string, string> = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'application/json': '.json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const ALLOWED_EXTENSIONS = new Set(Object.values(ALLOWED_MIMES));

const ALLOWED_LABEL = 'PDF, TXT, MD, CSV, JSON, DOCX';

const getExtension = (filename: string): string | null => {
  const lower = filename.toLowerCase();
  const idx = lower.lastIndexOf('.');
  if (idx < 0) return null;
  return lower.slice(idx);
};

export const isAllowedFile = (file: File): boolean => {
  if (file.type && file.type in ALLOWED_MIMES) return true;
  const ext = getExtension(file.name);
  return ext !== null && ALLOWED_EXTENSIONS.has(ext);
};

export const validateFile = (file: File): string | null => {
  if (file.size === 0) {
    return 'El archivo está vacío. Subí un archivo con contenido.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'El archivo supera el tamaño máximo permitido (10 MB).';
  }
  if (!isAllowedFile(file)) {
    return `Tipo de archivo no soportado. Permitidos: ${ALLOWED_LABEL}.`;
  }
  return null;
};

export const ACCEPT_ATTR = Array.from(
  new Set([
    ...Object.keys(ALLOWED_MIMES),
    ...Object.values(ALLOWED_MIMES),
  ])
).join(',');

export const formatBytes = (bytes: number | null | undefined): string => {
  if (bytes == null || bytes === 0) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};
