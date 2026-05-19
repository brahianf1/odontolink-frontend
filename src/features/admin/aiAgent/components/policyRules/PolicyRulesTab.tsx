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
import { usePolicyRules } from '../../hooks/usePolicyRules';
import { useAiAgentContext } from '../AiAgentContext';
import PolicyRulesTable from './PolicyRulesTable';
import PolicyRuleFormDialog from './PolicyRuleFormDialog';
import DeletePolicyRuleDialog from './DeletePolicyRuleDialog';
import type {
  PolicyRuleRequestDTO,
  PolicyRuleResponseDTO,
} from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';

const HIGHLIGHT_DURATION_MS = 2200;

export default function PolicyRulesTab() {
  const { policyRules, loading, mutatingId, error, refresh, create, update, remove, setActive } =
    usePolicyRules();
  const { notifySuccess, notifyError, isUnconfigured } = useAiAgentContext();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PolicyRuleResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PolicyRuleResponseDTO | null>(null);
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

  const openEdit = (rule: PolicyRuleResponseDTO) => {
    setEditTarget(rule);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: PolicyRuleRequestDTO) => {
    try {
      if (editTarget) {
        const updated = await update(editTarget.id, payload);
        highlight(updated.id);
        notifySuccess(`Regla "${payload.label}" actualizada.`);
      } else {
        const created = await create(payload);
        highlight(created.id);
        notifySuccess(`Regla "${payload.label}" creada.`);
      }
      setFormOpen(false);
      setEditTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo guardar la regla.');
      notifyError(mapped.message);
    }
  };

  const handleToggle = async (rule: PolicyRuleResponseDTO, nextActive: boolean) => {
    try {
      const updated = await setActive(rule.id, nextActive);
      highlight(updated.id);
      notifySuccess(
        nextActive ? `Regla "${rule.label}" activada.` : `Regla "${rule.label}" desactivada.`
      );
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo cambiar el estado de la regla.');
      notifyError(mapped.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const label = deleteTarget.label;
    try {
      await remove(deleteTarget.id);
      notifySuccess(`Regla "${label}" eliminada.`);
      setDeleteTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo eliminar la regla.');
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
              Reglas de comportamiento del agente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reglas en español que se concatenan al <em>system prompt</em> del agente. Aparecen
              dentro del campo <strong>Instruction</strong> en el dashboard de DigitalOcean (no
              como guardrails separados).
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Nueva regla
          </Button>
        </Stack>

        {isUnconfigured && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Podés crear y editar reglas ahora. Se aplicarán automáticamente cuando publiques el
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
          <PolicyRulesTable
            policyRules={policyRules}
            mutatingId={mutatingId}
            recentId={recentId}
            onEdit={openEdit}
            onDelete={(rule) => setDeleteTarget(rule)}
            onToggleActive={handleToggle}
          />
        )}

        <PolicyRuleFormDialog
          open={formOpen}
          target={editTarget}
          saving={mutatingId !== null}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
          onSubmit={handleSubmit}
        />
        <DeletePolicyRuleDialog
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
