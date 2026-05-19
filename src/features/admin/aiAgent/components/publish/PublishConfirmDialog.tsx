import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle as OkIcon,
  ErrorOutline as WarnIcon,
  Publish as PublishIcon,
  CloudOff as CloudOffIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { ParsedRequirement } from '../../../../../types/aiAgent.types';
import { mapAiAgentError } from '../../utils/apiErrors';
import {
  parseRequirements,
  requirementLabel,
} from '../../utils/missingRequirements';
import {
  computeLocalRequirements,
  mergeRequirements,
} from '../../utils/localRequirements';
import { useAiAgentContext } from '../AiAgentContext';

interface PublishConfirmDialogProps {
  open: boolean;
  publishing: boolean;
  allowOverride: boolean;
  onClose: () => void;
  onConfirm: (override: boolean) => Promise<void>;
}

export default function PublishConfirmDialog({
  open,
  publishing,
  allowOverride,
  onClose,
  onConfirm,
}: PublishConfirmDialogProps) {
  const navigate = useNavigate();
  const { health, healthLoading, healthError, isUnconfigured, configuration, governance } =
    useAiAgentContext();

  const [override, setOverride] = useState(false);
  const [serverRequirements, setServerRequirements] = useState<ParsedRequirement[] | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [providerDown, setProviderDown] = useState(false);
  const [providerBadConfig, setProviderBadConfig] = useState(false);
  const [notConfiguredError, setNotConfiguredError] = useState(false);

  useEffect(() => {
    if (!open) {
      setOverride(false);
      setServerRequirements(null);
      setServerError(null);
      setProviderDown(false);
      setProviderBadConfig(false);
      setNotConfiguredError(false);
    }
  }, [open]);

  // Si el publish devolvió 422 con missingRequirements parseados, usamos esos
  // (autoritativos del momento del intento). Si no, mostramos la unión de
  // (health backend) + (lo que podemos derivar localmente con certeza) para
  // que el admin no se sorprenda con un error que ya era predecible.
  const requirementsBase = mergeRequirements(
    parseRequirements(health?.missingRequirements),
    computeLocalRequirements(configuration, governance)
  );
  const requirements = serverRequirements ?? requirementsBase;
  const hasRequirements = requirements.length > 0;
  const providerReachable = health?.providerReachable ?? true;
  const showOverrideCheckbox = allowOverride && hasRequirements;
  const showNotConfigured = isUnconfigured || notConfiguredError;

  const handleConfirm = async () => {
    setServerError(null);
    setProviderDown(false);
    setProviderBadConfig(false);
    try {
      await onConfirm(override);
    } catch (err) {
      const mapped = mapAiAgentError(err, 'No se pudo publicar el agente.');
      if (mapped.isProviderDown) {
        setProviderDown(true);
      } else if (mapped.isProviderBadConfig) {
        setProviderBadConfig(true);
      } else if (mapped.isNotConfigured) {
        setNotConfiguredError(true);
      } else if (mapped.isConfigInvalid) {
        setServerRequirements(mapped.missingRequirements ?? []);
      }
      setServerError(mapped.message);
    }
  };

  const handleGoToWizard = () => {
    onClose();
    navigate('/admin/ai-agent/configuration');
  };

  return (
    <Dialog open={open} onClose={publishing ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Publicar agente IA</DialogTitle>
      <DialogContent dividers>
        {healthLoading ? (
          <Box aria-live="polite" sx={{ py: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={24} height={24} />
              <Typography variant="body2" sx={{ width: 320 }}>
                <Skeleton variant="text" />
              </Typography>
            </Stack>
          </Box>
        ) : showNotConfigured ? (
          <Alert severity="warning" icon={<WarnIcon />}>
            El agente todavía no fue configurado. Completá la configuración inicial antes de
            publicar.
          </Alert>
        ) : healthError ? (
          <Alert severity="error">{healthError}</Alert>
        ) : (
          <Stack spacing={2}>
            {!providerReachable && (
              <Alert severity="error" icon={<CloudOffIcon />}>
                {health?.providerErrorDetail ||
                  'El proveedor de IA no está disponible en este momento. Intentalo más tarde.'}
              </Alert>
            )}
            {hasRequirements ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Faltan requisitos para publicar:
                </Typography>
                <List dense disablePadding>
                  {requirements.map((req, idx) => (
                    <ListItem key={idx} disableGutters sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <WarnIcon color="warning" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={requirementLabel(req)} />
                    </ListItem>
                  ))}
                </List>
                {showOverrideCheckbox && (
                  <FormControlLabel
                    sx={{ mt: 1 }}
                    control={
                      <Checkbox
                        checked={override}
                        onChange={(e) => setOverride(e.target.checked)}
                        disabled={publishing}
                      />
                    }
                    label="Forzar publicación (override administrativo)"
                  />
                )}
              </Box>
            ) : providerReachable ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <OkIcon color="success" />
                <Typography variant="body2">
                  Todos los requisitos están cumplidos. ¿Querés publicar el agente?
                </Typography>
              </Stack>
            ) : null}
            {providerDown && (
              <Alert severity="error">
                El proveedor de IA no respondió. Reintentá en unos minutos.
              </Alert>
            )}
            {providerBadConfig && (
              <Alert severity="error">
                El proveedor rechazó la configuración. Revisá los parámetros del modelo y los
                prompts.
              </Alert>
            )}
            {serverError && !providerDown && !providerBadConfig && (
              <Alert severity="error">{serverError}</Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {showNotConfigured ? (
          <>
            <Button onClick={onClose}>Cerrar</Button>
            <Button variant="contained" onClick={handleGoToWizard}>
              Configurar ahora
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={publishing}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={
                publishing ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PublishIcon />
                )
              }
              onClick={handleConfirm}
              disabled={
                publishing ||
                healthLoading ||
                !providerReachable ||
                (hasRequirements && !override)
              }
            >
              {publishing ? 'Publicando…' : 'Publicar'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
