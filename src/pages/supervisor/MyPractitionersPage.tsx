import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  GroupAdd as GroupAddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMyPractitioners } from '../../features/supervisor/hooks/useMyPractitioners';
import PractitionerCard from '../../features/supervisor/components/PractitionerCard';
import LinkPractitionerDialog from '../../features/supervisor/components/LinkPractitionerDialog';
import ConfirmActionDialog from '../../features/supervisor/components/ConfirmActionDialog';
import { unlinkPractitioner } from '../../services/api/supervisorService';
import { mapSupervisorError } from '../../features/supervisor/utils/supervisorApiErrors';
import type { PractitionerDTO } from '../../types/supervisor.types';

interface FeedbackState {
  open: boolean;
  severity: 'success' | 'error' | 'info';
  message: string;
}

const INITIAL_FEEDBACK: FeedbackState = { open: false, severity: 'success', message: '' };

export default function MyPractitionersPage() {
  const navigate = useNavigate();
  const { practitioners, loading, error, refresh, removeLocal } = useMyPractitioners();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<PractitionerDTO | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(INITIAL_FEEDBACK);
  const [search, setSearch] = useState('');

  const linkedIds = useMemo(() => new Set(practitioners.map((p) => p.id)), [practitioners]);

  const filteredPractitioners = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-AR');
    if (!term) return practitioners;
    return practitioners.filter((p) => {
      const haystack = `${p.user.firstName} ${p.user.lastName} ${p.user.dni} ${p.studentId} ${p.user.email}`
        .toLocaleLowerCase('es-AR');
      return haystack.includes(term);
    });
  }, [practitioners, search]);

  const handleViewAttentions = (practitioner: PractitionerDTO) => {
    navigate(`/supervisor/practitioners/${practitioner.id}/attentions`);
  };

  const handleConfirmUnlink = async () => {
    if (!unlinkTarget) return;
    setUnlinkLoading(true);
    try {
      await unlinkPractitioner(unlinkTarget.id);
      removeLocal(unlinkTarget.id);
      setFeedback({
        open: true,
        severity: 'success',
        message: `${unlinkTarget.user.firstName} ${unlinkTarget.user.lastName} fue desvinculado.`,
      });
      setUnlinkTarget(null);
    } catch (err) {
      const mapped = mapSupervisorError(err, 'No se pudo desvincular al practicante.');
      setFeedback({ open: true, severity: 'error', message: mapped.message });
    } finally {
      setUnlinkLoading(false);
    }
  };

  const handleLinkSuccess = (linked: PractitionerDTO[]) => {
    void refresh();
    setFeedback({
      open: true,
      severity: 'success',
      message:
        linked.length === 1
          ? `${linked[0].user.firstName} ${linked[0].user.lastName} fue vinculado a tu supervisión.`
          : `${linked.length} practicantes vinculados a tu supervisión.`,
    });
  };

  const handleCloseFeedback = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Practicantes a cargo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestiona los practicantes bajo tu supervisión académica.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refresh()}
            disabled={loading}
            sx={{ flex: { xs: 1, sm: 'unset' } }}
          >
            Refrescar
          </Button>
          <Button
            variant="contained"
            startIcon={<GroupAddIcon />}
            onClick={() => setLinkDialogOpen(true)}
            sx={{ flex: { xs: 1, sm: 'unset' } }}
          >
            Vincular practicantes
          </Button>
        </Stack>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre, DNI, legajo o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => void refresh()}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} variant="outlined">
              <CardContent>
                <Skeleton variant="circular" width={48} height={48} />
                <Skeleton variant="text" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : filteredPractitioners.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {practitioners.length === 0
                ? 'Aún no tienes practicantes a cargo'
                : 'No se encontraron practicantes con esa búsqueda'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {practitioners.length === 0
                ? 'Comienza vinculando practicantes para auditar sus atenciones.'
                : 'Prueba con otro término de búsqueda.'}
            </Typography>
            {practitioners.length === 0 && (
              <Button
                variant="contained"
                startIcon={<GroupAddIcon />}
                onClick={() => setLinkDialogOpen(true)}
              >
                Vincular practicantes
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {filteredPractitioners.map((p) => (
            <PractitionerCard
              key={p.id}
              practitioner={p}
              onViewAttentions={handleViewAttentions}
              onUnlink={setUnlinkTarget}
            />
          ))}
        </Box>
      )}

      <LinkPractitionerDialog
        open={linkDialogOpen}
        alreadyLinkedIds={linkedIds}
        onClose={() => setLinkDialogOpen(false)}
        onSuccess={handleLinkSuccess}
        onError={(message) => setFeedback({ open: true, severity: 'error', message })}
      />

      <ConfirmActionDialog
        open={Boolean(unlinkTarget)}
        title="Desvincular practicante"
        message={
          unlinkTarget
            ? `¿Confirmas desvincular a ${unlinkTarget.user.firstName} ${unlinkTarget.user.lastName} de tu supervisión? Dejarás de tener acceso a sus atenciones.`
            : ''
        }
        confirmLabel="Desvincular"
        confirmColor="error"
        loading={unlinkLoading}
        onConfirm={handleConfirmUnlink}
        onClose={() => setUnlinkTarget(null)}
      />

      <Snackbar
        open={feedback.open}
        autoHideDuration={4500}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
