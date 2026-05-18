import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useEmergencyKeywords } from '../../hooks/useEmergencyKeywords';
import { useAiAgentContext } from '../AiAgentContext';
import EmergencyKeywordsTable from './EmergencyKeywordsTable';
import EmergencyKeywordFormDialog from './EmergencyKeywordFormDialog';
import DeleteEmergencyKeywordDialog from './DeleteEmergencyKeywordDialog';
import type { EmergencyKeywordResponseDTO } from '../../../../../types/aiAgent.types';
import type { EmergencyKeywordFormValues } from '../../schemas/emergencyKeyword.schemas';
import { mapAiAgentError } from '../../utils/apiErrors';

const HIGHLIGHT_DURATION_MS = 2200;

const SUGGESTED_SEED = [
  'sangrado',
  'dolor agudo',
  'dolor severo',
  'traumatismo',
  'fiebre alta',
  'hinchazón severa',
  'infección severa',
  'fractura',
  'accidente',
  'perdí un diente',
  'emergencia',
];

export default function EmergencyKeywordsTab() {
  const { keywords, loading, mutatingId, error, refresh, create, update, remove, toggleActive } =
    useEmergencyKeywords();
  const { notifySuccess, notifyError } = useAiAgentContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmergencyKeywordResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmergencyKeywordResponseDTO | null>(null);
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

  const openEdit = (k: EmergencyKeywordResponseDTO) => {
    setEditTarget(k);
    setFormOpen(true);
  };

  const handleSubmit = async (values: EmergencyKeywordFormValues) => {
    try {
      if (editTarget) {
        const updated = await update(editTarget.id, {
          term: values.term,
          active: values.active,
        });
        highlight(updated.id);
        notifySuccess(`Palabra "${values.term}" actualizada.`);
      } else {
        const created = await create({ term: values.term, active: values.active });
        highlight(created.id);
        notifySuccess(`Palabra "${values.term}" agregada.`);
      }
      setFormOpen(false);
      setEditTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo guardar la palabra.');
      const isDuplicate =
        mapped.status === 422 &&
        /duplicad|existe|ya está|unicidad|already/i.test(mapped.message);
      notifyError(
        isDuplicate
          ? `Ya existe una palabra equivalente (la comparación ignora mayúsculas y acentos).`
          : mapped.message
      );
    }
  };

  const handleToggle = async (k: EmergencyKeywordResponseDTO, nextActive: boolean) => {
    try {
      const updated = await toggleActive(k, nextActive);
      highlight(updated.id);
      notifySuccess(
        nextActive ? `Palabra "${k.term}" activada.` : `Palabra "${k.term}" desactivada.`
      );
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo cambiar el estado de la palabra.');
      notifyError(mapped.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const term = deleteTarget.term;
    try {
      await remove(deleteTarget.id);
      notifySuccess(`Palabra "${term}" eliminada.`);
      setDeleteTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo eliminar la palabra.');
      notifyError(mapped.message);
    }
  };

  const isEmpty = !loading && !error && keywords.length === 0;

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
              Palabras de emergencia
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuando un usuario incluye alguna de estas palabras en su mensaje, el bot prepende el
              banner de emergencia configurado.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Agregar palabra
          </Button>
        </Stack>

        <Tooltip
          title="El detector cachea la lista activa por hasta 1 minuto. Los cambios pueden tardar ese tiempo en aplicarse a las nuevas conversaciones."
          arrow
        >
          <Alert
            icon={<AccessTimeIcon fontSize="inherit" />}
            severity="info"
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Los cambios tardan hasta 1 minuto en aplicarse a nuevas conversaciones.
          </Alert>
        </Tooltip>

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
        ) : isEmpty ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" fontWeight={600} gutterBottom>
              Aún no hay palabras configuradas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sugeridas para empezar: {SUGGESTED_SEED.join(', ')}.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Agregar la primera palabra
            </Button>
          </Box>
        ) : (
          <EmergencyKeywordsTable
            keywords={keywords}
            mutatingId={mutatingId}
            recentId={recentId}
            onEdit={openEdit}
            onDelete={(k) => setDeleteTarget(k)}
            onToggleActive={handleToggle}
          />
        )}

        <EmergencyKeywordFormDialog
          open={formOpen}
          target={editTarget}
          saving={mutatingId !== null}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
          onSubmit={handleSubmit}
        />
        <DeleteEmergencyKeywordDialog
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
