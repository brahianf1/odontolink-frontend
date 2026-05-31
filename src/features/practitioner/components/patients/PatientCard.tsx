import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Divider,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import {
  AssignmentTurnedIn as AttentionsIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import type { AttentionResponseDTO } from '../../../../types/attention.types';
import StatusChip from '../../../../components/common/StatusChip';
import UserAvatar from '../../../../components/common/UserAvatar';
import PatientAttentionsList from './PatientAttentionsList';

export interface PatientSummary {
  id: number;
  name: string;
  profilePictureUrl: string | null;
  attentions: AttentionResponseDTO[];
  totalCount: number;
  activeCount: number;
}

interface PatientCardProps {
  patient: PatientSummary;
  expanded: boolean;
  onToggle: () => void;
}

export default function PatientCard({ patient, expanded, onToggle }: PatientCardProps) {
  const hasActive = patient.activeCount > 0;

  return (
    <Card
      sx={(theme) => ({
        borderRadius: 3,
        border: '1px solid',
        borderColor: hasActive ? alpha(theme.palette.primary.main, 0.35) : 'divider',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      })}
    >
      <CardActionArea
        onClick={onToggle}
        aria-expanded={expanded}
        aria-label={`Atenciones de ${patient.name}`}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
              <UserAvatar
                src={patient.profilePictureUrl}
                name={patient.name}
                size={52}
                sx={(theme) => ({
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  border: `1px solid ${theme.palette.divider}`,
                })}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {patient.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                  <StatusChip
                    label={`${patient.totalCount} atención${patient.totalCount === 1 ? '' : 'es'}`}
                    tone="neutral"
                  />
                  {hasActive && (
                    <StatusChip label={`${patient.activeCount} en curso`} tone="primary" />
                  )}
                </Stack>
              </Box>
            </Box>

            <ExpandMoreIcon
              sx={{
                color: 'text.secondary',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0,
              }}
            />
          </Box>
        </CardContent>
      </CardActionArea>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AttentionsIcon fontSize="small" sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
              Atenciones del paciente
            </Typography>
          </Stack>
          <PatientAttentionsList attentions={patient.attentions} />
        </Box>
      </Collapse>
    </Card>
  );
}
