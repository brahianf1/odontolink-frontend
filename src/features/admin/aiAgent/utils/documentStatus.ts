import type { KnowledgeBaseDocumentStatus } from '../../../../types/aiAgent.types';

export interface DocumentStatusMeta {
  label: string;
  color: 'default' | 'info' | 'success' | 'error' | 'warning';
}

export const documentStatusMeta = (status: KnowledgeBaseDocumentStatus): DocumentStatusMeta => {
  switch (status) {
    case 'PENDING_UPLOAD':
      return { label: 'Subida pendiente', color: 'default' };
    case 'UPLOADED':
      return { label: 'Subido', color: 'info' };
    case 'REGISTERED':
      return { label: 'Registrado', color: 'info' };
    case 'INDEXING':
      return { label: 'Indexando', color: 'info' };
    case 'INDEXED':
      return { label: 'Indexado', color: 'success' };
    case 'FAILED':
      return { label: 'Fallido', color: 'error' };
  }
};

const TRANSITIONAL = new Set<KnowledgeBaseDocumentStatus>([
  'PENDING_UPLOAD',
  'UPLOADED',
  'REGISTERED',
  'INDEXING',
]);

export const isTransitionalStatus = (status: KnowledgeBaseDocumentStatus): boolean =>
  TRANSITIONAL.has(status);

const TERMINAL = new Set<KnowledgeBaseDocumentStatus>(['INDEXED', 'FAILED']);

export const isTerminalStatus = (status: KnowledgeBaseDocumentStatus): boolean =>
  TERMINAL.has(status);
