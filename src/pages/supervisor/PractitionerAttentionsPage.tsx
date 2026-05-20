import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  TablePagination,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePractitionerAttentions } from '../../features/supervisor/hooks/usePractitionerAttentions';
import { useMyPractitioners } from '../../features/supervisor/hooks/useMyPractitioners';
import { AttentionStatusChip } from '../../features/attentions';
import type { AttentionStatus } from '../../types/attention.types';

type StatusFilter = 'ALL' | AttentionStatus;

const formatDate = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

export default function PractitionerAttentionsPage() {
  const navigate = useNavigate();
  const { practitionerId } = useParams<{ practitionerId: string }>();
  const numericId = practitionerId ? Number(practitionerId) : null;

  const { attentions, loading, error, refresh } = usePractitionerAttentions(numericId);
  const { practitioners } = useMyPractitioners();

  const practitioner = useMemo(
    () => practitioners.find((p) => p.id === numericId) ?? null,
    [practitioners, numericId]
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return attentions;
    return attentions.filter((a) => a.status === statusFilter);
  }, [attentions, statusFilter]);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const renderSkeleton = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {['Inicio', 'Paciente', 'Tratamiento', 'Turnos', 'Estado', 'Acciones'].map((h) => (
              <TableCell key={h}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 6 }).map((__, c) => (
                <TableCell key={c}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1.5 }}>
        <MuiLink component={RouterLink} to="/supervisor/practitioners" underline="hover">
          Practicantes
        </MuiLink>
        <Typography color="text.primary">
          {practitioner ? `${practitioner.user.firstName} ${practitioner.user.lastName}` : 'Atenciones'}
        </Typography>
      </Breadcrumbs>

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
            Auditoría de atenciones
          </Typography>
          {practitioner ? (
            <Typography variant="body2" color="text.secondary">
              {practitioner.user.firstName} {practitioner.user.lastName} · Legajo{' '}
              {practitioner.studentId} · {practitioner.studyYear}° año
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Casos clínicos a su cargo
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/supervisor/practitioners')}
          >
            Volver
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refresh()}
            disabled={loading}
          >
            Refrescar
          </Button>
        </Stack>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
            <TextField
              select
              size="small"
              label="Filtrar por estado"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(0);
              }}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">Todos los estados</MenuItem>
              <MenuItem value="IN_PROGRESS">En curso</MenuItem>
              <MenuItem value="COMPLETED">Finalizadas</MenuItem>
              <MenuItem value="CANCELLED">Canceladas</MenuItem>
            </TextField>
            <Chip
              label={`${filtered.length} atención${filtered.length === 1 ? '' : 'es'}`}
              size="small"
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        renderSkeleton()
      ) : filtered.length === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {attentions.length === 0
                ? 'Este practicante no tiene atenciones registradas'
                : 'No hay atenciones con el filtro seleccionado'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Inicio</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tratamiento</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Turnos
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(a.startDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {a.patientName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{a.treatmentName}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={a.appointments.length} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <AttentionStatusChip status={a.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Auditar atención">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `/supervisor/practitioners/${numericId}/attentions/${a.id}`
                            )
                          }
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Box>
      )}
    </Box>
  );
}
