import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { NoteAlt as NoteAltIcon } from '@mui/icons-material';
import type { ProgressNoteResponseDTO } from '../../../types/attention.types';
import SectionHeader from './SectionHeader';
import ProgressNoteItem from './ProgressNoteItem';

interface ProgressNotesSectionProps {
  notes: ProgressNoteResponseDTO[];
  /**
   * Optional action slot rendered next to the section title — used by
   * the practitioner detail page to expose "Agregar evolución" when the
   * attention is still in progress. The supervisor audit page leaves
   * this undefined.
   */
  headerAction?: ReactNode;
  caption?: string;
  emptyMessage?: string;
}

export default function ProgressNotesSection({
  notes,
  headerAction,
  caption,
  emptyMessage,
}: ProgressNotesSectionProps) {
  const sorted = useMemo(
    () =>
      [...notes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notes]
  );

  return (
    <Card variant="outlined">
      <CardContent>
        <SectionHeader
          icon={<NoteAltIcon />}
          title="Notas de evolución"
          caption={caption}
          action={headerAction}
        />
        {sorted.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage ?? 'Aún no se han registrado notas de evolución para esta atención.'}
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {sorted.map((note) => (
              <ProgressNoteItem key={note.id} note={note} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
