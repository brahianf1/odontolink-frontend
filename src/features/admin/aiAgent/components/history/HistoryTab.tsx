import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useVersions } from '../../hooks/useVersions';
import { useAuditEvents } from '../../hooks/useAuditEvents';
import { useAiAgentContext } from '../AiAgentContext';
import VersionsTable from './versions/VersionsTable';
import VersionDetailDrawer from './versions/VersionDetailDrawer';
import RollbackConfirmDialog from './versions/RollbackConfirmDialog';
import AuditLogTable from './audit/AuditLogTable';
import AuditFiltersBar from './audit/AuditFiltersBar';
import type { AiAgentConfigurationVersionResponseDTO } from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';

type HistorySubtab = 'versions' | 'audit';

export default function HistoryTab() {
  const [subtab, setSubtab] = useState<HistorySubtab>('versions');
  const { notifySuccess, notifyError } = useAiAgentContext();

  const versionsHook = useVersions();
  const auditHook = useAuditEvents();

  const [viewVersion, setViewVersion] =
    useState<AiAgentConfigurationVersionResponseDTO | null>(null);
  const [rollbackTarget, setRollbackTarget] =
    useState<AiAgentConfigurationVersionResponseDTO | null>(null);

  const handleConfirmRollback = async () => {
    if (!rollbackTarget) return;
    try {
      await versionsHook.rollback(rollbackTarget.versionNumber);
      notifySuccess(`Se restauró la versión v${rollbackTarget.versionNumber}.`);
      setRollbackTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo restaurar la versión.');
      notifyError(mapped.message);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Historial del agente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Versiones publicadas y eventos de auditoría administrativa.
          </Typography>
        </Box>

        <Tabs
          value={subtab}
          onChange={(_, v) => setSubtab(v as HistorySubtab)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab value="versions" label="Versiones" />
          <Tab value="audit" label="Audit log" />
        </Tabs>

        {subtab === 'versions' && (
          <>
            {versionsHook.error ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void versionsHook.refresh()}>
                    Reintentar
                  </Button>
                }
              >
                {versionsHook.error}
              </Alert>
            ) : versionsHook.loading && !versionsHook.page ? (
              <Stack spacing={1}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={48} />
                ))}
              </Stack>
            ) : (
              <VersionsTable
                versions={versionsHook.page?.content ?? []}
                totalElements={versionsHook.page?.totalElements ?? 0}
                page={versionsHook.query.page ?? 0}
                pageSize={versionsHook.query.size ?? 10}
                rollingBackVersion={versionsHook.rollingBackVersion}
                onPageChange={versionsHook.setPage}
                onPageSizeChange={versionsHook.setPageSize}
                onView={(v) => setViewVersion(v)}
                onRollback={(v) => setRollbackTarget(v)}
              />
            )}
          </>
        )}

        {subtab === 'audit' && (
          <>
            <AuditFiltersBar
              query={auditHook.query}
              onChange={(q) => auditHook.setQuery(q)}
              disabled={auditHook.loading}
            />
            {auditHook.error ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => void auditHook.refresh()}>
                    Reintentar
                  </Button>
                }
              >
                {auditHook.error}
              </Alert>
            ) : auditHook.loading && !auditHook.page ? (
              <Stack spacing={1}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={42} />
                ))}
              </Stack>
            ) : (
              <AuditLogTable
                events={auditHook.page?.content ?? []}
                totalElements={auditHook.page?.totalElements ?? 0}
                page={auditHook.query.page ?? 0}
                pageSize={auditHook.query.size ?? 25}
                onPageChange={auditHook.setPage}
                onPageSizeChange={auditHook.setPageSize}
              />
            )}
          </>
        )}

        <VersionDetailDrawer
          version={viewVersion}
          open={viewVersion !== null}
          onClose={() => setViewVersion(null)}
        />
        <RollbackConfirmDialog
          open={rollbackTarget !== null}
          target={rollbackTarget}
          rollingBack={versionsHook.rollingBackVersion !== null}
          onCancel={() => setRollbackTarget(null)}
          onConfirm={handleConfirmRollback}
        />
      </CardContent>
    </Card>
  );
}
