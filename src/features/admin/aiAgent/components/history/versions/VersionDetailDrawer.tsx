import {
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AiAgentConfigurationVersionResponseDTO } from '../../../../../../types/aiAgent.types';
import { retrievalMethodMeta } from '../../../utils/retrievalMethods';

interface VersionDetailDrawerProps {
  version: AiAgentConfigurationVersionResponseDTO | null;
  open: boolean;
  onClose: () => void;
}

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const parseGuardrailLabels = (snapshot?: string | null): string[] => {
  if (!snapshot) return [];
  try {
    const parsed = JSON.parse(snapshot);
    if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    // fallback: dividir por comas
    return snapshot
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

const parseMissingRequirements = (raw?: string | null): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

export default function VersionDetailDrawer({ version, open, onClose }: VersionDetailDrawerProps) {
  if (!version) return null;
  const guardrailLabels = parseGuardrailLabels(version.guardrailsLabelsSnapshot);
  const missing = parseMissingRequirements(version.missingRequirementsAtPublish);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.modal }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Versión {version.versionNumber}
          </Typography>
          <IconButton onClick={onClose} aria-label="Cerrar">
            <CloseIcon />
          </IconButton>
        </Stack>

        <Stack spacing={1.5}>
          <Field label="Nombre">{version.displayName || '—'}</Field>
          <Field label="Publicada">{formatDate(version.publishedAt)}</Field>
          {version.publishedByUserId && (
            <Field label="Publicada por (userId)">{String(version.publishedByUserId)}</Field>
          )}
          {version.publishedWithOverride && (
            <Chip label="Publicada con override" color="warning" size="small" />
          )}

          <Divider />

          <Field label="Método de recuperación">
            {retrievalMethodMeta(version.retrievalMethod).label}
          </Field>
          <Field label="Temperatura">{version.temperature.toFixed(2)}</Field>
          <Field label="Top-P">{version.topP.toFixed(2)}</Field>
          <Field label="Max tokens">{version.maxTokens != null ? String(version.maxTokens) : '—'}</Field>
          <Field label="k (documentos)">{version.k != null ? String(version.k) : '—'}</Field>

          <Divider />

          <Field label="System prompt">
            <Box
              sx={{
                p: 1.5,
                backgroundColor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
                maxHeight: 160,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.78rem',
              }}
            >
              {version.systemPromptCore || '—'}
            </Box>
          </Field>

          {version.welcomeMessage && (
            <Field label="Mensaje de bienvenida">
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: 120,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.85rem',
                }}
              >
                {version.welcomeMessage}
              </Box>
            </Field>
          )}

          {version.composedInstruction && (
            <Field label="Instrucción compuesta">
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  maxHeight: 160,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.78rem',
                }}
              >
                {version.composedInstruction}
              </Box>
            </Field>
          )}

          {guardrailLabels.length > 0 && (
            <Field label="Guardrails activos al publicar">
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                {guardrailLabels.map((label) => (
                  <Chip key={label} label={label} size="small" variant="outlined" color="primary" />
                ))}
              </Stack>
            </Field>
          )}

          {missing.length > 0 && (
            <Field label="Requisitos faltantes al publicar">
              <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1}>
                {missing.map((m, idx) => (
                  <Chip key={idx} label={m} size="small" color="warning" />
                ))}
              </Stack>
            </Field>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      {typeof children === 'string' ? (
        <Typography variant="body2" fontWeight={600}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Box>
  );
}
