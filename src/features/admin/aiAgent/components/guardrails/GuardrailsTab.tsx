import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useGuardrails } from '../../hooks/useGuardrails';
import { useAiAgentContext } from '../AiAgentContext';
import GuardrailsTable from './GuardrailsTable';
import GuardrailFormDialog from './GuardrailFormDialog';
import DeleteGuardrailDialog from './DeleteGuardrailDialog';
import type {
  GuardrailRequestDTO,
  GuardrailResponseDTO,
} from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';

const HIGHLIGHT_DURATION_MS = 2200;

export default function GuardrailsTab() {
  const { guardrails, loading, mutatingId, error, refresh, create, update, remove, setActive } =
    useGuardrails();
  const { notifySuccess, notifyError, isUnconfigured } = useAiAgentContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<GuardrailResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GuardrailResponseDTO | null>(null);
  const [recentId, setRecentId] = useState<number | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const highlight = useCallback((id: number) => {
    setRecentId(id);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => setRecentId(null), HIGHLIGHT_DURATION_MS);
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (g: GuardrailResponseDTO) => {
    setEditTarget(g);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: GuardrailRequestDTO) => {
    try {
      if (editTarget) {
        const updated = await update(editTarget.id, payload);
        highlight(updated.id);
        notifySuccess(`Guardrail "${payload.label}" actualizado.`);
      } else {
        const created = await create(payload);
        highlight(created.id);
        notifySuccess(`Guardrail "${payload.label}" creado.`);
      }
      setFormOpen(false);
      setEditTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo guardar el guardrail.');
      notifyError(mapped.message);
    }
  };

  const handleToggle = async (g: GuardrailResponseDTO, nextActive: boolean) => {
    try {
      const updated = await setActive(g.id, nextActive);
      highlight(updated.id);
      notifySuccess(
        nextActive ? `Guardrail "${g.label}" activado.` : `Guardrail "${g.label}" desactivado.`
      );
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo cambiar el estado del guardrail.');
      notifyError(mapped.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const label = deleteTarget.label;
    try {
      await remove(deleteTarget.id);
      notifySuccess(`Guardrail "${label}" eliminado.`);
      setDeleteTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo eliminar el guardrail.');
      notifyError(mapped.message);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Guardrails
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reglas que el agente debe respetar en cada respuesta. Los guardrails activos se
              añaden al prompt final.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nuevo guardrail
          </Button>
        </Stack>

        {isUnconfigured && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Podés crear y editar guardrails ahora. Se aplicarán automáticamente cuando publiques el
            agente por primera vez.
          </Alert>
        )}

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
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={48} />
            ))}
          </Stack>
        ) : (
          <GuardrailsTable
            guardrails={guardrails}
            mutatingId={mutatingId}
            recentId={recentId}
            onEdit={openEdit}
            onDelete={(g) => setDeleteTarget(g)}
            onToggleActive={handleToggle}
          />
        )}

        <GuardrailFormDialog
          open={formOpen}
          target={editTarget}
          saving={mutatingId !== null}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
          onSubmit={handleSubmit}
        />
        <DeleteGuardrailDialog
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
