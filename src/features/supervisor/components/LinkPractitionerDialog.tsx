import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Checkbox,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import { Search as SearchIcon, GroupAdd as GroupAddIcon } from '@mui/icons-material';
import { usePractitionerSearch } from '../hooks/usePractitionerSearch';
import { linkMultiplePractitioners } from '../../../services/api/supervisorService';
import { mapSupervisorError } from '../utils/supervisorApiErrors';
import type { PractitionerDTO } from '../../../types/supervisor.types';

interface LinkPractitionerDialogProps {
  open: boolean;
  alreadyLinkedIds: Set<number>;
  onClose: () => void;
  onSuccess: (linked: PractitionerDTO[]) => void;
  onError: (message: string) => void;
}

export default function LinkPractitionerDialog({
  open,
  alreadyLinkedIds,
  onClose,
  onSuccess,
  onError,
}: LinkPractitionerDialogProps) {
  const { results, loading, error, query, setQuery } = usePractitionerSearch(open);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const availableResults = useMemo(
    () => results.filter((p) => !alreadyLinkedIds.has(p.id)),
    [results, alreadyLinkedIds]
  );

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    if (submitting) return;
    setSelectedIds(new Set());
    setQuery('');
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    setSubmitting(true);
    try {
      await linkMultiplePractitioners({ practitionerIds: ids });
      const linkedPractitioners = availableResults.filter((p) => selectedIds.has(p.id));
      onSuccess(linkedPractitioners);
      setSelectedIds(new Set());
      setQuery('');
      onClose();
    } catch (err) {
      const mapped = mapSupervisorError(err, 'No se pudieron vincular los practicantes.');
      onError(mapped.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupAddIcon color="primary" />
        Vincular practicantes
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          autoFocus
          placeholder="Buscar por nombre, apellido, DNI o legajo…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {selectedIds.size > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
            <Chip
              color="primary"
              label={`${selectedIds.size} seleccionado${selectedIds.size === 1 ? '' : 's'}`}
              size="small"
            />
            <Button size="small" onClick={() => setSelectedIds(new Set())}>
              Limpiar selección
            </Button>
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : availableResults.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {query.trim()
                ? 'No se encontraron practicantes que coincidan con la búsqueda.'
                : 'Comienza a escribir para buscar practicantes disponibles.'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
            <Divider />
            <List disablePadding>
              {availableResults.map((p) => {
                const checked = selectedIds.has(p.id);
                const initials = `${(p.user.firstName?.[0] ?? '?').toUpperCase()}${(
                  p.user.lastName?.[0] ?? ''
                ).toUpperCase()}`;
                return (
                  <ListItem
                    key={p.id}
                    onClick={() => toggleSelected(p.id)}
                    sx={{
                      cursor: 'pointer',
                      borderBottom: 1,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    secondaryAction={
                      <Checkbox edge="end" checked={checked} tabIndex={-1} disableRipple />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                        {initials}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600}>
                          {p.user.firstName} {p.user.lastName}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          Legajo {p.studentId} · DNI {p.user.dni || '—'} · {p.studyYear}° año
                        </Typography>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || selectedIds.size === 0}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <GroupAddIcon />}
        >
          Vincular {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
