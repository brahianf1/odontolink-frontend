import { Box, Paper, Stack, Typography } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ProgressNoteResponseDTO } from '../../../types/attention.types';
import StatusChip, { type StatusTone } from '../../../components/common/StatusChip';
import UserAvatar from '../../../components/common/UserAvatar';

const ROLE_LABELS: Record<string, string> = {
  ROLE_PRACTITIONER: 'Practicante',
  ROLE_SUPERVISOR: 'Docente',
  ROLE_ADMIN: 'Administrador',
};

const ROLE_TONES: Record<string, StatusTone> = {
  ROLE_PRACTITIONER: 'primary',
  ROLE_SUPERVISOR: 'secondary',
  ROLE_ADMIN: 'warning',
};

interface ProgressNoteItemProps {
  note: ProgressNoteResponseDTO;
}

const formatDateTime = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

/**
 * One progress note rendered as a paper card. The role of the author is
 * displayed as a tonal chip (using the shared StatusChip) so it stays
 * legible across all theme variants without per-author tinting.
 */
export default function ProgressNoteItem({ note }: ProgressNoteItemProps) {
  const roleLabel = ROLE_LABELS[note.authorRole] ?? note.authorRole;
  const roleTone = ROLE_TONES[note.authorRole] ?? 'neutral';

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <UserAvatar
          src={note.authorProfilePictureUrl}
          name={note.authorName}
          size={40}
          sx={(theme) => ({
            fontSize: '0.875rem',
            fontWeight: 700,
            border: `1px solid ${theme.palette.divider}`,
          })}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 0.5 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" fontWeight={600}>
                {note.authorName}
              </Typography>
              <StatusChip label={roleLabel} tone={roleTone} size="small" />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(note.createdAt)}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, whiteSpace: 'pre-wrap', color: 'text.primary', lineHeight: 1.55 }}
          >
            {note.note}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
