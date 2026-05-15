import { Alert, Box, Paper, Stack, Typography, alpha } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ProgressNoteResponseDTO } from '../../../../types/attention.types';

interface ProgressNoteTimelineProps {
  notes: ProgressNoteResponseDTO[];
  emptyMessage?: string;
}

const formatRole = (role: string): string => {
  const normalized = role.toUpperCase().replace('ROLE_', '');
  if (normalized.startsWith('PRACT')) return 'Practicante';
  if (normalized.startsWith('SUPER') || normalized === 'DOCENTE') return 'Docente';
  if (normalized === 'PATIENT') return 'Paciente';
  if (normalized === 'ADMIN' || normalized === 'ADMINISTRATOR') return 'Administrador';
  return role;
};

/**
 * Vertical timeline of progress notes for a clinical case. We sort
 * chronologically (oldest first) so the evolution reads top-down like a
 * medical record.
 */
export default function ProgressNoteTimeline({ notes, emptyMessage }: ProgressNoteTimelineProps) {
  if (notes.length === 0) {
    return <Alert severity="info">{emptyMessage ?? 'No hay notas de evolución registradas.'}</Alert>;
  }

  const sorted = [...notes].sort(
    (a, b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime()
  );

  return (
    <Stack
      spacing={0}
      sx={{
        position: 'relative',
        pl: { xs: 3, sm: 4 },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: { xs: 10, sm: 14 },
          top: 8,
          bottom: 8,
          width: 2,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.25),
        },
      }}
    >
      {sorted.map((note, index) => (
        <Box
          key={note.id}
          sx={{
            position: 'relative',
            pb: index === sorted.length - 1 ? 0 : 3,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: { xs: -18, sm: -22 },
              top: 14,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              border: '3px solid',
              borderColor: 'background.paper',
              boxShadow: (t) => `0 0 0 1px ${t.palette.divider}`,
            }}
          />
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {format(parseISO(note.createdAt), "dd 'de' MMMM 'de' yyyy · HH:mm", { locale: es })}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                {note.authorName} · {formatRole(note.authorRole)}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
              {note.note}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Stack>
  );
}
