import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import type { AiAgentInstructionPreviewResponseDTO } from '../../../../../types/aiAgent.types';

interface InstructionPreviewCardProps {
  preview: AiAgentInstructionPreviewResponseDTO;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function InstructionPreviewCard({
  preview,
  loading,
  onRefresh,
}: InstructionPreviewCardProps) {
  const hasGuardrails = preview.activeGuardrailLabels.length > 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Instrucción final compuesta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Combinación del system prompt con los guardrails activos.
            </Typography>
          </Box>
          {onRefresh && (
            <Tooltip title="Refrescar previsualización">
              <span>
                <IconButton onClick={onRefresh} disabled={loading} size="small">
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Stack>

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Guardrails activos
        </Typography>
        {hasGuardrails ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, rowGap: 1 }}>
            {preview.activeGuardrailLabels.map((label) => (
              <Chip key={label} label={label} size="small" color="primary" variant="outlined" />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No hay guardrails activos.
          </Typography>
        )}

        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Texto resultante
        </Typography>
        <Box
          sx={{
            p: 2,
            backgroundColor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: 320,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'ui-monospace, SFMono-Regular, "Courier New", monospace',
            fontSize: '0.85rem',
          }}
        >
          {preview.composedInstruction || (
            <Typography variant="body2" color="text.secondary">
              Sin contenido para mostrar.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
