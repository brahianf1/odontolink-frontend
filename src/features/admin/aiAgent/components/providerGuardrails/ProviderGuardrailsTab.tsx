import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link as MuiLink,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useProviderGuardrails } from '../../hooks/useProviderGuardrails';
import { useAiAgentContext } from '../AiAgentContext';
import ProviderGuardrailsTable from './ProviderGuardrailsTable';
import ProviderGuardrailAttachmentDialog from './ProviderGuardrailAttachmentDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';
import type {
  ProviderGuardrailResponseDTO,
  UpdateProviderGuardrailAttachmentRequestDTO,
} from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';

const HIGHLIGHT_DURATION_MS = 2200;

export default function ProviderGuardrailsTab() {
  const {
    items,
    loading,
    refreshing,
    mutatingId,
    error,
    bootstrapInfo,
    bootstrapLoading,
    refreshFromList,
    refreshFromProvider,
    updateAttachment,
  } = useProviderGuardrails();
  const { notifySuccess, notifyError, configuration } = useAiAgentContext();
  const [editTarget, setEditTarget] = useState<ProviderGuardrailResponseDTO | null>(null);
  const [recentId, setRecentId] = useState<number | null>(null);
  const [confirmRefreshOpen, setConfirmRefreshOpen] = useState(false);
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

  const handleRefreshFromProvider = async () => {
    try {
      await refreshFromProvider();
      notifySuccess('Catálogo sincronizado correctamente.');
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo sincronizar con el proveedor.');
      notifyError(mapped.message);
    }
  };

  // El refresh es autoritativo: pisa el espejo local con lo que reporta DO.
  // Si la config está en DRAFT, confirmamos antes para no perder los toggles
  // pendientes de publicar. Si está PUBLISHED o no hay items todavía, no hay
  // nada que pisar, va directo.
  const onClickHeaderRefresh = () => {
    if (configuration?.lifecycle === 'DRAFT' && items.length > 0) {
      setConfirmRefreshOpen(true);
    } else {
      void handleRefreshFromProvider();
    }
  };

  const handleConfirmRefresh = async () => {
    await handleRefreshFromProvider();
    setConfirmRefreshOpen(false);
  };

  const handleToggle = async (item: ProviderGuardrailResponseDTO, nextAttached: boolean) => {
    try {
      const updated = await updateAttachment(item.id, {
        attached: nextAttached,
        priority: item.priority,
      });
      highlight(updated.id);
      const name = updated.displayName ?? '(sin nombre)';
      notifySuccess(
        nextAttached
          ? `Filtro "${name}" activado. Aplicalo publicando el agente.`
          : `Filtro "${name}" desactivado. Aplicalo publicando el agente.`
      );
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo actualizar el filtro.');
      notifyError(mapped.message);
    }
  };

  const handleSubmitEdit = async (payload: UpdateProviderGuardrailAttachmentRequestDTO) => {
    if (!editTarget) return;
    try {
      const updated = await updateAttachment(editTarget.id, payload);
      highlight(updated.id);
      notifySuccess('Filtro actualizado. Aplicá los cambios publicando el agente.');
      setEditTarget(null);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo actualizar el filtro.');
      notifyError(mapped.message);
    }
  };

  // Preferir el dashboardUrl del bootstrap-info (trae la ruta /resources lista
  // para el "Add guardrails"). Fallback al construido con providerAgentId.
  const fallbackDashboardUrl = configuration?.providerAgentId
    ? `https://cloud.digitalocean.com/gen-ai/agents/${configuration.providerAgentId}`
    : null;
  const dashboardUrl = bootstrapInfo?.providerDashboardUrl ?? fallbackDashboardUrl;

  const showEmptyState = !loading && !error && items.length === 0;
  const showBootstrapLoading = showEmptyState && bootstrapLoading && !bootstrapInfo;
  const showBootstrapBanner =
    showEmptyState && !bootstrapLoading && bootstrapInfo?.catalogEmpty === true;
  const showEmptyFallback =
    showEmptyState &&
    !bootstrapLoading &&
    (bootstrapInfo === null || bootstrapInfo.catalogEmpty === false);

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
              Filtros de plataforma
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Guardrails nativos del proveedor (DigitalOcean Gradient): jailbreak, datos sensibles
              y moderación de contenido.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
            }
            onClick={onClickHeaderRefresh}
            disabled={refreshing || loading}
          >
            Refrescar desde el proveedor
          </Button>
        </Stack>

        {/* Alert info "configuración fina" — solo visible cuando NO estamos en
            empty state. Cuando se muestra el banner de bootstrap, el deep link
            al dashboard ya está incluido en él y duplicar sería ruido. */}
        {!showEmptyState && (
          <Alert severity="info" sx={{ mb: 2 }}>
            La configuración fina de cada filtro (categorías de datos sensibles, texto que mostrar al
            disparar) se gestiona desde el dashboard de DigitalOcean. Acá solo decidís cuáles están
            activos y con qué prioridad.
            {dashboardUrl ? (
              <Box sx={{ mt: 1 }}>
                <MuiLink
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontWeight: 600,
                  }}
                >
                  Abrir dashboard del agente <OpenInNewIcon fontSize="inherit" />
                </MuiLink>
              </Box>
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                El link al dashboard estará disponible una vez publicado el agente.
              </Typography>
            )}
          </Alert>
        )}

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void refreshFromList()}>
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : loading ? (
          <Stack spacing={1}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={56} />
            ))}
          </Stack>
        ) : showBootstrapLoading ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : showBootstrapBanner ? (
          <Alert severity="info" icon={<SecurityIcon fontSize="inherit" />} sx={{ mb: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Sincronizá los filtros con DigitalOcean
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los filtros (Jailbreak, Sensitive Data, Content Moderation) son recursos de
              DigitalOcean que no pueden listarse desde nuestra API. Para registrarlos en este
              panel, vinculá al menos uno desde el dashboard de DO una sola vez:
            </Typography>
            <Box
              component="ol"
              sx={{
                pl: 3,
                my: 1.5,
                '& li': { mb: 0.5, fontSize: '0.875rem' },
              }}
            >
              <li>Abrí el dashboard del agente en DigitalOcean.</li>
              <li>
                Andá a la pestaña <strong>Resources</strong>.
              </li>
              <li>
                Click en <strong>Add guardrails</strong> y seleccioná los que quieras.
              </li>
              <li>
                Volvé acá y pulsá <strong>"Ya lo vinculé, refrescar"</strong>.
              </li>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Después podés gestionar attach/detach y prioridad desde acá sin volver al dashboard.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {dashboardUrl ? (
                <Button
                  variant="contained"
                  startIcon={<OpenInNewIcon />}
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  component="a"
                >
                  Abrir dashboard de DigitalOcean
                </Button>
              ) : (
                <Tooltip title="Disponible una vez publicado el agente">
                  <span>
                    <Button variant="contained" startIcon={<OpenInNewIcon />} disabled>
                      Abrir dashboard de DigitalOcean
                    </Button>
                  </span>
                </Tooltip>
              )}
              <Button
                variant="outlined"
                startIcon={
                  refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
                }
                onClick={() => void handleRefreshFromProvider()}
                disabled={refreshing}
              >
                Ya lo vinculé, refrescar
              </Button>
            </Stack>
          </Alert>
        ) : showEmptyFallback ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" fontWeight={600} gutterBottom>
              Todavía no se sincronizó el catálogo de filtros
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, maxWidth: 480, mx: 'auto' }}
            >
              Estos son filtros pre-built (jailbreak, datos sensibles, moderación de contenido)
              que DigitalOcean ofrece y que podés activar para tu agente.
            </Typography>
            <Button
              variant="contained"
              startIcon={
                refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
              }
              onClick={() => void handleRefreshFromProvider()}
              disabled={refreshing}
            >
              Sincronizar desde el proveedor
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Los cambios se aplicarán cuando publiques el agente.
            </Typography>
            <ProviderGuardrailsTable
              items={items}
              mutatingId={mutatingId}
              recentId={recentId}
              onEdit={(item) => setEditTarget(item)}
              onToggle={handleToggle}
            />
          </Box>
        )}

        <ProviderGuardrailAttachmentDialog
          open={editTarget !== null}
          target={editTarget}
          saving={mutatingId !== null}
          onClose={() => setEditTarget(null)}
          onSubmit={handleSubmitEdit}
        />

        <ConfirmDialog
          open={confirmRefreshOpen}
          title="Tenés cambios sin publicar"
          message="Refrescar va a pisar los cambios pendientes en filtros con lo que reporta DigitalOcean. ¿Continuar?"
          confirmLabel="Refrescar igual"
          cancelLabel="Cancelar"
          confirmColor="warning"
          loading={refreshing}
          onConfirm={() => void handleConfirmRefresh()}
          onClose={() => setConfirmRefreshOpen(false)}
        />
      </CardContent>
    </Card>
  );
}
