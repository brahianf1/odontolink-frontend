import { Box, Paper, Typography, Stack, Chip, Avatar } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ProgressNoteResponseDTO } from '../../../types/attention.types';

interface ProgressNoteItemProps {
  note: ProgressNoteResponseDTO;
}

const ROLE_LABELS: Record<string, string> = {
  ROLE_PRACTITIONER: 'Practicante',
  ROLE_SUPERVISOR: 'Docente',
  ROLE_ADMIN: 'Administrador',
};

const ROLE_COLORS: Record<string, 'primary' | 'secondary' | 'warning' | 'default'> = {
  ROLE_PRACTITIONER: 'primary',
  ROLE_SUPERVISOR: 'secondary',
  ROLE_ADMIN: 'warning',
};

const formatDateTime = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

export default function ProgressNoteItem({ note }: ProgressNoteItemProps) {
  const initials = (note.authorName || '?')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 36, height: 36 }}>
          {initials}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" fontWeight={600}>
                {note.authorName}
              </Typography>
              <Chip
                size="small"
                label={ROLE_LABELS[note.authorRole] ?? note.authorRole}
                color={ROLE_COLORS[note.authorRole] ?? 'default'}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(note.createdAt)}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{ mt: 1, whiteSpace: 'pre-wrap', color: 'text.primary' }}
          >
            {note.note}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
