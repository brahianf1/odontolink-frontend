import { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AutoStories as FaqIcon,
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Sync as ReindexIcon,
} from '@mui/icons-material';
import { useKnowledgeBase } from '../../hooks/useKnowledgeBase';
import { useKbStatusPolling } from '../../hooks/useKbStatusPolling';
import { useAiAgentContext } from '../AiAgentContext';
import DocumentsTable from './DocumentsTable';
import KbStatusFilter from './KbStatusFilter';
import UploadFileDialog from './UploadFileDialog';
import AddFaqDialog from './AddFaqDialog';
import EditDocumentDialog from './EditDocumentDialog';
import DeleteDocumentDialog from './DeleteDocumentDialog';
import IndexingJobBanner from './IndexingJobBanner';
import { mapAiAgentError, mapKbUploadError } from '../../utils/apiErrors';
import type {
  KnowledgeBaseDocumentResponseDTO,
  KnowledgeBaseDocumentStatus,
  UpdateKnowledgeBaseDocumentRequestDTO,
} from '../../../../../types/aiAgent.types';

export default function KnowledgeBaseTab() {
  const {
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
  } = useKnowledgeBase();
  const { notifySuccess, notifyError, isUnconfigured, refreshHealth } = useAiAgentContext();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<KnowledgeBaseDocumentResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeBaseDocumentResponseDTO | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const documents = page?.content ?? [];

  useKbStatusPolling({
    documents,
    enabled: documents.length > 0,
    onUpdate: patchDocument,
  });

  const handleUpload = useCallback(
    async (title: string, file: File) => {
      try {
        await uploadFile(title, file);
        setUploadOpen(false);
        notifySuccess(`Documento "${title}" subido. Se está indexando.`);
      } catch (err) {
        const mapped = mapKbUploadError(err, 'No se pudo subir el documento.');
        notifyError(mapped.message);
      }
    },
    [notifyError, notifySuccess, uploadFile]
  );

  const handleAddFaq = useCallback(
    async (title: string, content: string) => {
      try {
        await addFaq({ title, content });
        setFaqOpen(false);
        notifySuccess(`FAQ "${title}" creada.`);
      } catch (err) {
        const mapped = mapKbUploadError(err, 'No se pudo crear la FAQ.');
        notifyError(mapped.message);
      }
    },
    [addFaq, notifyError, notifySuccess]
  );

  const handleEditSubmit = useCallback(
    async (id: number, payload: UpdateKnowledgeBaseDocumentRequestDTO) => {
      try {
        await updateDoc(id, payload);
        setEditTarget(null);
        notifySuccess('Documento actualizado.');
      } catch (err) {
        const mapped = mapAiAgentError(err, 'No se pudo actualizar el documento.');
        notifyError(mapped.message);
      }
    },
    [notifyError, notifySuccess, updateDoc]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const title = deleteTarget.title;
    try {
      await removeDoc(deleteTarget.id);
      setDeleteTarget(null);
      notifySuccess(`Documento "${title}" eliminado.`);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo eliminar el documento.');
      notifyError(mapped.message);
    }
  }, [deleteTarget, notifyError, notifySuccess, removeDoc]);

  const handleRefreshStatus = useCallback(
    async (doc: KnowledgeBaseDocumentResponseDTO) => {
      try {
        await refreshDocStatus(doc.id);
      } catch (err) {
        const mapped = mapAiAgentError(err, 'No se pudo refrescar el estado.');
        notifyError(mapped.message);
      }
    },
    [notifyError, refreshDocStatus]
  );

  const handleDownload = useCallback(
    async (doc: KnowledgeBaseDocumentResponseDTO) => {
      try {
        const { blob, filename } = await download(doc.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        const mapped = mapAiAgentError(err, 'No se pudo descargar el documento.');
        notifyError(mapped.message);
      }
    },
    [download, notifyError]
  );

  const handleReindex = useCallback(async () => {
    setReindexing(true);
    try {
      const job = await reindex();
      setActiveJobId(job.jobId);
      notifySuccess('Re-indexación iniciada.');
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo iniciar la re-indexación.');
      notifyError(mapped.message);
    } finally {
      setReindexing(false);
    }
  }, [notifyError, notifySuccess, reindex]);

  const totalElements = page?.totalElements ?? 0;
  const pageNumber = query.page ?? 0;
  const pageSize = query.size ?? 10;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Base de conocimiento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Archivos y FAQs que alimentan la recuperación del agente IA.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" rowGap={1}>
            <Tooltip
              title={
                isUnconfigured
                  ? 'Configurá el agente antes de gestionar la base de conocimiento.'
                  : ''
              }
              arrow
              disableHoverListener={!isUnconfigured}
            >
              <span>
                <Button
                  variant="outlined"
                  startIcon={<FaqIcon />}
                  onClick={() => setFaqOpen(true)}
                  disabled={uploading || isUnconfigured}
                >
                  Agregar FAQ
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                isUnconfigured
                  ? 'Configurá el agente antes de gestionar la base de conocimiento.'
                  : ''
              }
              arrow
              disableHoverListener={!isUnconfigured}
            >
              <span>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadOpen(true)}
                  disabled={uploading || isUnconfigured}
                >
                  Subir archivo
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {isUnconfigured && (
          <Alert severity="info" sx={{ mb: 2 }}>
            La base de conocimiento se sincroniza con el proveedor de IA usando el agente
            configurado. Completá la configuración inicial para habilitar la subida de documentos y
            la creación de FAQs.
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        <IndexingJobBanner
          jobId={activeJobId}
          onDismiss={() => setActiveJobId(null)}
          onComplete={() => {
            void refresh();
            void refreshHealth();
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <KbStatusFilter
            value={query.status ?? ''}
            onChange={(v) => setStatusFilter(v === '' ? undefined : (v as KnowledgeBaseDocumentStatus))}
            disabled={loading}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => void refresh()}
              disabled={loading}
            >
              Refrescar
            </Button>
            <Tooltip
              title={
                isUnconfigured
                  ? 'Configurá el agente antes de re-indexar la base de conocimiento.'
                  : ''
              }
              arrow
              disableHoverListener={!isUnconfigured}
            >
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  color="warning"
                  startIcon={<ReindexIcon />}
                  onClick={handleReindex}
                  disabled={reindexing || isUnconfigured}
                >
                  Re-indexar todo
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refresh()}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : loading ? (
          <Stack spacing={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} />
            ))}
          </Stack>
        ) : (
          <DocumentsTable
            documents={documents}
            totalElements={totalElements}
            page={pageNumber}
            pageSize={pageSize}
            mutatingId={mutatingId}
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
            onEdit={(d) => setEditTarget(d)}
            onDownload={handleDownload}
            onRefreshStatus={handleRefreshStatus}
            onDelete={(d) => setDeleteTarget(d)}
          />
        )}

        <UploadFileDialog
          open={uploadOpen}
          uploading={uploading}
          onClose={() => setUploadOpen(false)}
          onSubmit={handleUpload}
        />
        <AddFaqDialog
          open={faqOpen}
          submitting={uploading}
          onClose={() => setFaqOpen(false)}
          onSubmit={handleAddFaq}
        />
        <EditDocumentDialog
          open={editTarget !== null}
          target={editTarget}
          saving={mutatingId !== null}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEditSubmit}
        />
        <DeleteDocumentDialog
          open={deleteTarget !== null}
          target={deleteTarget}
          deleting={mutatingId !== null}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      </CardContent>
    </Card>
  );
}
