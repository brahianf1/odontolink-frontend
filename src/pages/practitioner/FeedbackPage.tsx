import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterAltOff as ClearFiltersIcon,
  MedicalServices as TreatmentIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMyAttentions } from '../../services/api/practitionerService';
import { getFeedbackForAttention } from '../../services/api/feedbackService';
import type { FeedbackResponseDTO } from '../../types/feedback.types';
import { isPatientRole } from '../../utils/roles';
import { averageScore } from '../../utils/feedbackScores';
import FeedbackScoresDisplay from '../../components/common/FeedbackScoresDisplay';

interface FlatFeedback extends FeedbackResponseDTO {
  treatmentNameLocal: string;
  patientNameLocal: string;
  avg: number;
}

type SortKey = 'date' | 'avg' | 'patient' | 'treatment';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [5, 10, 25];

export default function FeedbackPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allFeedbacks, setAllFeedbacks] = useState<FlatFeedback[]>([]);

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [detailTarget, setDetailTarget] = useState<FlatFeedback | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const attentions = await getMyAttentions();
      const nested = await Promise.all(
        attentions.map(async (att) => {
          try {
            const fbs = await getFeedbackForAttention(att.id);
            return fbs
              .filter((f) => isPatientRole(f.submittedByRole))
              .map((f) => ({
                ...f,
                treatmentNameLocal: att.treatmentName,
                patientNameLocal: att.patientName,
                avg: averageScore(f.scores),
              }));
          } catch {
            return [];
          }
        })
      );
      setAllFeedbacks(nested.flat());
    } catch {
      setError('Error al cargar el feedback recibido.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    let items = allFeedbacks;

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (f) =>
          f.patientNameLocal.toLowerCase().includes(q) ||
          f.treatmentNameLocal.toLowerCase().includes(q) ||
          f.submittedByName.toLowerCase().includes(q) ||
          (f.comment ?? '').toLowerCase().includes(q)
      );
    }

    if (startDate) {
      items = items.filter((f) => f.createdAt >= startDate);
    }
    if (endDate) {
      const endPlusOne = endDate + 'T23:59:59Z';
      items = items.filter((f) => f.createdAt <= endPlusOne);
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    items = [...items].sort((a, b) => {
      switch (sortKey) {
        case 'date':
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'avg':
          return dir * (a.avg - b.avg);
        case 'patient':
          return dir * a.patientNameLocal.localeCompare(b.patientNameLocal);
        case 'treatment':
          return dir * a.treatmentNameLocal.localeCompare(b.treatmentNameLocal);
        default:
          return 0;
      }
    });

    return items;
  }, [allFeedbacks, search, startDate, endDate, sortKey, sortDir]);

  const paged = useMemo(
    () => filtered.slice(page * pageSize, page * pageSize + pageSize),
    [filtered, page, pageSize]
  );

  const hasFilters = Boolean(search || startDate || endDate);

  const clearFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const totalFeedbacks = allFeedbacks.length;
  const overallAvg = totalFeedbacks > 0
    ? allFeedbacks.reduce((s, f) => s + f.avg, 0) / totalFeedbacks
    : 0;

  const uniqueTreatments = useMemo(
    () => new Set(allFeedbacks.map((f) => f.treatmentNameLocal)).size,
    [allFeedbacks]
  );

  const criterionAverages = useMemo(() => {
    if (allFeedbacks.length === 0) return [];
    const sums: Record<string, { total: number; count: number; displayName: string }> = {};
    for (const fb of allFeedbacks) {
      for (const s of fb.scores) {
        if (!sums[s.criterionCode]) {
          sums[s.criterionCode] = { total: 0, count: 0, displayName: s.criterionDisplayName };
        }
        sums[s.criterionCode].total += s.score;
        sums[s.criterionCode].count += 1;
      }
    }
    return Object.entries(sums).map(([code, v]) => ({
      code,
      displayName: v.displayName,
      avg: v.total / v.count,
    }));
  }, [allFeedbacks]);

  const formatDate = (value: string) => {
    try {
      return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
    } catch {
      return value;
    }
  };

  const formatDateLong = (value: string) => {
    try {
      return format(parseISO(value), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return value;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
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
            Feedback recibido
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Calificaciones y comentarios de tus pacientes sobre las atenciones completadas.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => void loadData()}
          disabled={loading}
        >
          Refrescar
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Empty state */}
      {totalFeedbacks === 0 ? (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <StarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No has recibido feedback de pacientes aún
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: 'auto' }}>
              Las calificaciones de tus pacientes aparecerán aquí una vez que completen
              la encuesta de evaluación al finalizar sus atenciones.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: `repeat(${3 + criterionAverages.length}, 1fr)`,
              },
              mb: 3,
            }}
          >
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ color: 'warning.main', fontSize: 32, mb: 0.5 }} />
                <Typography variant="h3" fontWeight={700}>
                  {overallAvg.toFixed(1)}
                </Typography>
                <Rating value={overallAvg} readOnly precision={0.1} size="small" sx={{ mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary" display="block">
                  Promedio general
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonIcon sx={{ color: 'info.main', fontSize: 32, mb: 0.5 }} />
                <Typography variant="h3" fontWeight={700}>
                  {totalFeedbacks}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {totalFeedbacks === 1 ? 'Calificación recibida' : 'Calificaciones recibidas'}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <TreatmentIcon sx={{ color: 'success.main', fontSize: 32, mb: 0.5 }} />
                <Typography variant="h3" fontWeight={700}>
                  {uniqueTreatments}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {uniqueTreatments === 1 ? 'Tratamiento evaluado' : 'Tratamientos evaluados'}
                </Typography>
              </CardContent>
            </Card>

            {criterionAverages.map((c) => (
              <Card key={c.code} variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 28, mb: 0.5 }} />
                  <Typography variant="h4" fontWeight={700}>
                    {c.avg.toFixed(1)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(c.avg / 5) * 100}
                    sx={{ height: 6, borderRadius: 3, my: 0.75 }}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {c.displayName}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Filters */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ pb: '16px !important' }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', md: 'center' }}
              >
                <TextField
                  placeholder="Buscar por paciente, tratamiento o comentario…"
                  size="small"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: { md: 2 }, minWidth: 200 }}
                />
                <TextField
                  label="Desde"
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="Hasta"
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  select
                  label="Ordenar"
                  size="small"
                  value={`${sortKey}_${sortDir}`}
                  onChange={(e) => {
                    const [k, d] = e.target.value.split('_') as [SortKey, SortDir];
                    setSortKey(k);
                    setSortDir(d);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SortIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="date_desc">Más recientes primero</MenuItem>
                  <MenuItem value="date_asc">Más antiguos primero</MenuItem>
                  <MenuItem value="avg_desc">Mayor calificación</MenuItem>
                  <MenuItem value="avg_asc">Menor calificación</MenuItem>
                  <MenuItem value="patient_asc">Paciente A-Z</MenuItem>
                  <MenuItem value="patient_desc">Paciente Z-A</MenuItem>
                  <MenuItem value="treatment_asc">Tratamiento A-Z</MenuItem>
                  <MenuItem value="treatment_desc">Tratamiento Z-A</MenuItem>
                </TextField>
                {hasFilters && (
                  <IconButton onClick={clearFilters} color="primary" sx={{ border: 1, borderColor: 'divider' }}>
                    <ClearFiltersIcon />
                  </IconButton>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Results count */}
          {hasFilters && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}

          {/* Feedback list */}
          {filtered.length === 0 ? (
            <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Sin resultados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Probá ajustando los filtros o la búsqueda.
                </Typography>
              </CardContent>
            </Card>
          ) : isMobile ? (
            /* Mobile: card list */
            <Stack spacing={1.5}>
              {paged.map((fb) => (
                <Card
                  key={fb.id}
                  variant="outlined"
                  sx={{ cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                  onClick={() => setDetailTarget(fb)}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {fb.patientNameLocal}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fb.treatmentNameLocal}
                        </Typography>
                      </Box>
                      <FeedbackScoresDisplay scores={fb.scores} variant="compact" />
                    </Stack>
                    {fb.comment && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          "{fb.comment}"
                        </Typography>
                      </>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {formatDate(fb.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            /* Desktop: table */
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tratamiento</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Calificación</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Comentario</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? Array.from({ length: pageSize }).map((_, i) => (
                        <TableRow key={i}>
                          {Array.from({ length: 5 }).map((__, c) => (
                            <TableCell key={c}><Skeleton variant="text" /></TableCell>
                          ))}
                        </TableRow>
                      ))
                    : paged.map((fb) => (
                        <TableRow
                          key={fb.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => setDetailTarget(fb)}
                        >
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(fb.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {fb.patientNameLocal}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={fb.treatmentNameLocal} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <FeedbackScoresDisplay scores={fb.scores} variant="compact" />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            <Typography
                              variant="body2"
                              color={fb.comment ? 'text.primary' : 'text.secondary'}
                              sx={{
                                fontStyle: fb.comment ? 'italic' : 'normal',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {fb.comment ? `"${fb.comment}"` : '— sin comentario —'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={PAGE_SIZE_OPTIONS}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </>
      )}

      {/* Detail dialog */}
      <Dialog
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {detailTarget && (
          <>
            <DialogTitle sx={{ pb: 1, pr: 6 }}>
              <Typography variant="h6" fontWeight={700}>
                Detalle del feedback
              </Typography>
              <IconButton
                aria-label="cerrar"
                onClick={() => setDetailTarget(null)}
                sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Paper
                variant="outlined"
                sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Paciente: <strong>{detailTarget.patientNameLocal}</strong>
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TreatmentIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Tratamiento: <strong>{detailTarget.treatmentNameLocal}</strong>
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateLong(detailTarget.createdAt)}
                  </Typography>
                </Stack>
              </Paper>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                Calificación por criterio
              </Typography>
              <FeedbackScoresDisplay scores={detailTarget.scores} variant="expanded" size="medium" />

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Comentario
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}
              >
                <Typography
                  variant="body2"
                  color={detailTarget.comment ? 'text.primary' : 'text.secondary'}
                  sx={{
                    fontStyle: detailTarget.comment ? 'italic' : 'normal',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {detailTarget.comment || 'El paciente no dejó un comentario.'}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDetailTarget(null)} variant="contained" fullWidth>
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
