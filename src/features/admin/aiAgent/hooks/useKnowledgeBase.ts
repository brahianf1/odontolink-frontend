import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addFaqDocument,
  addFileDocument,
  deleteDocument,
  downloadDocument,
  listDocuments,
  refreshDocumentStatus,
  triggerReindex,
  updateDocument,
} from '../../../../services/api/aiAgentService';
import type { PageResponse } from '../../../../types/common.types';
import type {
  AddFaqDocumentRequestDTO,
  IndexingJobStatusResponseDTO,
  KbDocumentsQuery,
  KnowledgeBaseDocumentResponseDTO,
  KnowledgeBaseDocumentStatus,
  UpdateKnowledgeBaseDocumentRequestDTO,
} from '../../../../types/aiAgent.types';
import { mapAiAgentError } from '../utils/apiErrors';
import { useAiAgentContext } from '../components/AiAgentContext';

export interface UseKnowledgeBaseResult {
  page: PageResponse<KnowledgeBaseDocumentResponseDTO> | null;
  loading: boolean;
  mutatingId: number | null;
  uploading: boolean;
  error: string | null;
  query: KbDocumentsQuery;
  setStatusFilter: (status?: KnowledgeBaseDocumentStatus) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => Promise<void>;
  uploadFile: (title: string, file: File) => Promise<KnowledgeBaseDocumentResponseDTO>;
  addFaq: (payload: AddFaqDocumentRequestDTO) => Promise<KnowledgeBaseDocumentResponseDTO>;
  updateDoc: (
    id: number,
    payload: UpdateKnowledgeBaseDocumentRequestDTO
  ) => Promise<KnowledgeBaseDocumentResponseDTO>;
  removeDoc: (id: number) => Promise<void>;
  refreshDocStatus: (id: number) => Promise<KnowledgeBaseDocumentResponseDTO>;
  reindex: () => Promise<IndexingJobStatusResponseDTO>;
  download: (id: number) => Promise<{ blob: Blob; filename: string; contentType: string }>;
  patchDocument: (doc: KnowledgeBaseDocumentResponseDTO) => void;
}

const DEFAULT_PAGE_SIZE = 10;

const isTerminalStatus = (status: KnowledgeBaseDocumentStatus): boolean =>
  status === 'INDEXED' || status === 'FAILED';

export function useKnowledgeBase(): UseKnowledgeBaseResult {
  const { refreshHealth } = useAiAgentContext();
  const [page, setPage] = useState<PageResponse<KnowledgeBaseDocumentResponseDTO> | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<KbDocumentsQuery>({ page: 0, size: DEFAULT_PAGE_SIZE });
  const mountedRef = useRef(true);
  const statusByIdRef = useRef<Map<number, KnowledgeBaseDocumentStatus>>(new Map());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const trackStatuses = useCallback((docs: KnowledgeBaseDocumentResponseDTO[]) => {
    statusByIdRef.current.clear();
    docs.forEach((d) => statusByIdRef.current.set(d.id, d.status));
  }, []);

  const fetchPage = useCallback(
    async (q: KbDocumentsQuery) => {
      setLoading(true);
      setError(null);
      try {
        const data = await listDocuments(q);
        if (!mountedRef.current) return;
        setPage(data);
        trackStatuses(data.content);
      } catch (err) {
        const mapped = mapAiAgentError(err, 'No se pudieron cargar los documentos.');
        if (!mountedRef.current) return;
        setError(mapped.message);
        setPage(null);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [trackStatuses]
  );

  useEffect(() => {
    void fetchPage(query);
  }, [query, fetchPage]);

  const setStatusFilter = useCallback((status?: KnowledgeBaseDocumentStatus) => {
    setQuery((prev) => ({ ...prev, status, page: 0 }));
  }, []);

  const setPageNumber = useCallback((p: number) => {
    setQuery((prev) => ({ ...prev, page: p }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setQuery((prev) => ({ ...prev, size, page: 0 }));
  }, []);

  const refresh = useCallback(async () => {
    await fetchPage(query);
  }, [fetchPage, query]);

  const patchDocument = useCallback(
    (doc: KnowledgeBaseDocumentResponseDTO) => {
      const prevStatus = statusByIdRef.current.get(doc.id);
      statusByIdRef.current.set(doc.id, doc.status);
      setPage((prev) => {
        if (!prev) return prev;
        const idx = prev.content.findIndex((d) => d.id === doc.id);
        if (idx === -1) return prev;
        const nextContent = [...prev.content];
        nextContent[idx] = doc;
        return { ...prev, content: nextContent };
      });
      // Si un documento llegó a un estado terminal, puede haber cambiado
      // requireIndexedDocuments en health → refrescar en background.
      if (
        prevStatus !== undefined &&
        prevStatus !== doc.status &&
        isTerminalStatus(doc.status)
      ) {
        void refreshHealth();
      }
    },
    [refreshHealth]
  );

  const uploadFile = useCallback(
    async (title: string, file: File) => {
      setUploading(true);
      try {
        const created = await addFileDocument(title, file);
        await fetchPage(query);
        void refreshHealth();
        return created;
      } finally {
        if (mountedRef.current) setUploading(false);
      }
    },
    [fetchPage, query, refreshHealth]
  );

  const addFaq = useCallback(
    async (payload: AddFaqDocumentRequestDTO) => {
      setUploading(true);
      try {
        const created = await addFaqDocument(payload);
        await fetchPage(query);
        void refreshHealth();
        return created;
      } finally {
        if (mountedRef.current) setUploading(false);
      }
    },
    [fetchPage, query, refreshHealth]
  );

  const updateDoc = useCallback(
    async (id: number, payload: UpdateKnowledgeBaseDocumentRequestDTO) => {
      setMutatingId(id);
      try {
        const updated = await updateDocument(id, payload);
        patchDocument(updated);
        // El rename no afecta health; cambio de content de FAQ sí (vuelve a INDEXING).
        if (payload.content !== undefined) {
          void refreshHealth();
        }
        return updated;
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [patchDocument, refreshHealth]
  );

  const removeDoc = useCallback(
    async (id: number) => {
      setMutatingId(id);
      try {
        await deleteDocument(id);
        await fetchPage(query);
        void refreshHealth();
      } finally {
        if (mountedRef.current) setMutatingId(null);
      }
    },
    [fetchPage, query, refreshHealth]
  );

  const refreshDocStatus = useCallback(
    async (id: number) => {
      const updated = await refreshDocumentStatus(id);
      patchDocument(updated);
      return updated;
    },
    [patchDocument]
  );

  const reindex = useCallback(async () => {
    return triggerReindex();
  }, []);

  const download = useCallback(async (id: number) => downloadDocument(id), []);

  return {
    page,
    loading,
    mutatingId,
    uploading,
    error,
    query,
    setStatusFilter,
    setPage: setPageNumber,
    setPageSize,
    refresh,
    uploadFile,
    addFaq,
    updateDoc,
    removeDoc,
    refreshDocStatus,
    reindex,
    download,
    patchDocument,
  };
}
