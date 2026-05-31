import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterAltOff as ClearFiltersIcon,
  FormatQuote as QuoteIcon,
  MedicalServices as TreatmentIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMyAttentions } from '../../services/api/practitionerService';
import { getFeedbackForAttention } from '../../services/api/feedbackService';
import type { FeedbackResponseDTO } from '../../types/feedback.types';
import { isPatientRole } from '../../utils/roles';
import { averageScore } from '../../utils/feedbackScores';
import FeedbackScoresDisplay from '../../components/common/FeedbackScoresDisplay';
import UserAvatar from '../../components/common/UserAvatar';

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

  const uniquePatients = useMemo(
    () => new Set(allFeedbacks.map((f) => f.patientNameLocal)).size,
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
        <Paper
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            backgroundColor: theme.palette.surfaces.containerLow,
            border: `1px solid ${theme.palette.outlineVariant}`,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.surfaces.container,
              border: `1px solid ${theme.palette.outlineVariant}`,
            }}
          >
            <StarIcon sx={{ fontSize: 36, color: 'text.disabled' }} />
          </Box>
          <Typography variant="titleLarge" fontWeight={600} gutterBottom>
            Sin feedback recibido
          </Typography>
          <Typography variant="bodyMedium" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto' }}>
            Las calificaciones de tus pacientes aparecerán aquí una vez que completen
            la encuesta de evaluación al finalizar sus atenciones.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* ── Summary section ── */}
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
              mb: 3,
            }}
          >
            {/* Hero KPI — overall score */}
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.primary.container,
                color: theme.palette.primary.onContainer,
                border: `1px solid ${theme.palette.outlineVariant}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="displayMedium" fontWeight={700} sx={{ lineHeight: 1 }}>
                {overallAvg.toFixed(1)}
              </Typography>
              <Rating
                value={overallAvg}
                readOnly
                precision={0.1}
                size="large"
                sx={{ my: 1.5 }}
              />
              <Typography variant="titleMedium" fontWeight={600}>
                Promedio general
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                sx={{ mt: 2 }}
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ borderColor: 'inherit', opacity: 0.3 }}
                  />
                }
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="titleLarge" fontWeight={700}>
                    {totalFeedbacks}
                  </Typography>
                  <Typography variant="labelSmall">
                    {totalFeedbacks === 1 ? 'evaluación' : 'evaluaciones'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="titleLarge" fontWeight={700}>
                    {uniquePatients}
                  </Typography>
                  <Typography variant="labelSmall">
                    {uniquePatients === 1 ? 'paciente' : 'pacientes'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Per-criterion scorecard */}
            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                backgroundColor: theme.palette.surfaces.containerLow,
                border: `1px solid ${theme.palette.outlineVariant}`,
              }}
            >
              <Typography variant="titleMedium" fontWeight={700} sx={{ mb: 2.5 }}>
                Rendimiento por criterio
              </Typography>
              {criterionAverages.length === 0 ? (
                <Typography variant="bodyMedium" color="text.secondary">
                  Sin datos de criterio disponibles.
                </Typography>
              ) : (
                <Stack spacing={2.5}>
                  {criterionAverages.map((c) => {
                    const pct = (c.avg / 5) * 100;
                    return (
                      <Box key={c.code}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="baseline"
                          sx={{ mb: 0.75 }}
                        >
                          <Typography variant="bodyMedium" fontWeight={500}>
                            {c.displayName}
                          </Typography>
                          <Typography variant="titleMedium" fontWeight={700}>
                            {c.avg.toFixed(1)}
                            <Typography
                              component="span"
                              variant="labelSmall"
                              color="text.secondary"
                              sx={{ ml: 0.25 }}
                            >
                              /5
                            </Typography>
                          </Typography>
                        </Stack>
                        <Box
                          sx={{
                            height: 8,
                            width: '100%',
                            backgroundColor: theme.palette.surfaces.containerHigh,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${pct}%`,
                              backgroundColor: theme.palette.primary.main,
                              transition: `width ${theme.motion?.duration?.short3 ?? 200}ms ${theme.motion?.easing?.standard ?? 'ease'}`,
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Box>

          {/* ── Filters ── */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: theme.palette.surfaces.containerLow,
              border: `1px solid ${theme.palette.outlineVariant}`,
            }}
          >
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
                <Tooltip title="Limpiar filtros">
                  <IconButton
                    onClick={clearFilters}
                    color="primary"
                    sx={{ border: `1px solid ${theme.palette.outlineVariant}` }}
                  >
                    <ClearFiltersIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Paper>

          {/* Results count */}
          {hasFilters && (
            <Typography variant="labelMedium" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}

          {/* ── Feedback list ── */}
          {filtered.length === 0 ? (
            <Paper
              sx={{
                textAlign: 'center',
                py: 6,
                px: 3,
                backgroundColor: theme.palette.surfaces.containerLow,
                border: `1px solid ${theme.palette.outlineVariant}`,
              }}
            >
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="titleMedium" fontWeight={600} gutterBottom>
                Sin resultados
              </Typography>
              <Typography variant="bodyMedium" color="text.secondary">
                Probá ajustando los filtros o la búsqueda.
              </Typography>
            </Paper>
          ) : isMobile ? (
            <Stack spacing={1.5}>
              {paged.map((fb) => (
                <Paper
                  key={fb.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    backgroundColor: theme.palette.surfaces.containerLow,
                    border: `1px solid ${theme.palette.outlineVariant}`,
                    transition: `border-color ${theme.motion?.duration?.short3 ?? 200}ms`,
                    '&:hover': { borderColor: theme.palette.primary.main },
                  }}
                  onClick={() => setDetailTarget(fb)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                      <UserAvatar
                        src={fb.patientProfilePictureUrl}
                        name={fb.patientNameLocal}
                        size={36}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="titleSmall" fontWeight={700} noWrap>
                          {fb.patientNameLocal}
                        </Typography>
                        <Typography variant="labelSmall" color="text.secondary">
                          {fb.treatmentNameLocal}
                        </Typography>
                      </Box>
                    </Stack>
                    <FeedbackScoresDisplay scores={fb.scores} variant="compact" />
                  </Stack>
                  {fb.comment && (
                    <>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <QuoteIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.25, flexShrink: 0 }} />
                        <Typography
                          variant="bodySmall"
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
                          {fb.comment}
                        </Typography>
                      </Stack>
                    </>
                  )}
                  <Typography variant="labelSmall" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {formatDate(fb.createdAt)}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                backgroundColor: theme.palette.surfaces.containerLow,
                border: `1px solid ${theme.palette.outlineVariant}`,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{ backgroundColor: theme.palette.surfaces.container }}
                  >
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
                            <Typography variant="bodySmall" color="text.secondary">
                              {formatDate(fb.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <UserAvatar
                                src={fb.patientProfilePictureUrl}
                                name={fb.patientNameLocal}
                                size={32}
                              />
                              <Typography variant="bodyMedium" fontWeight={600}>
                                {fb.patientNameLocal}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fb.treatmentNameLocal}
                              size="small"
                              sx={{
                                backgroundColor: theme.palette.tertiary.container,
                                color: theme.palette.tertiary.onContainer,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <FeedbackScoresDisplay scores={fb.scores} variant="compact" />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 300 }}>
                            {fb.comment ? (
                              <Stack direction="row" spacing={0.75} alignItems="flex-start">
                                <QuoteIcon sx={{ fontSize: 14, color: 'text.disabled', mt: 0.3, flexShrink: 0 }} />
                                <Typography
                                  variant="bodySmall"
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
                                  {fb.comment}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant="bodySmall" color="text.disabled">
                                Sin comentario
                              </Typography>
                            )}
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

      {/* ── Detail dialog ── */}
      <Dialog
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        maxWidth="sm"
        fullWidth
      >
        {detailTarget && (
          <>
            <DialogTitle sx={{ pb: 1, pr: 6 }}>
              <Typography variant="titleLarge" fontWeight={700}>
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
              {/* Context card */}
              <Paper
                sx={{
                  p: 2.5,
                  mb: 3,
                  backgroundColor: theme.palette.surfaces.container,
                  border: `1px solid ${theme.palette.outlineVariant}`,
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UserAvatar
                      src={detailTarget.patientProfilePictureUrl}
                      name={detailTarget.patientNameLocal}
                      size={32}
                      sx={{
                        backgroundColor: theme.palette.primary.container,
                        color: theme.palette.primary.onContainer,
                      }}
                    />
                    <Box>
                      <Typography variant="titleSmall" fontWeight={600}>
                        {detailTarget.patientNameLocal}
                      </Typography>
                      <Typography variant="labelSmall" color="text.secondary">
                        Paciente
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<TreatmentIcon />}
                      label={detailTarget.treatmentNameLocal}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.tertiary.container,
                        color: theme.palette.tertiary.onContainer,
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: 'inherit' },
                      }}
                    />
                    <Chip
                      label={formatDate(detailTarget.createdAt)}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.surfaces.containerHigh,
                        fontWeight: 500,
                      }}
                    />
                  </Stack>
                </Stack>
              </Paper>

              {/* Scores */}
              <Typography variant="titleSmall" fontWeight={700} sx={{ mb: 2 }}>
                Calificación por criterio
              </Typography>
              <Box
                sx={{
                  p: 2.5,
                  mb: 3,
                  backgroundColor: theme.palette.surfaces.containerLow,
                  border: `1px solid ${theme.palette.outlineVariant}`,
                }}
              >
                <FeedbackScoresDisplay scores={detailTarget.scores} variant="expanded" size="medium" />
              </Box>

              {/* Comment */}
              <Typography variant="titleSmall" fontWeight={700} gutterBottom>
                Comentario
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: detailTarget.comment
                    ? theme.palette.surfaces.containerLow
                    : 'transparent',
                  border: `1px solid ${theme.palette.outlineVariant}`,
                }}
              >
                {detailTarget.comment ? (
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <QuoteIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.25, flexShrink: 0 }} />
                    <Typography
                      variant="bodyMedium"
                      sx={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}
                    >
                      {detailTarget.comment}
                    </Typography>
                  </Stack>
                ) : (
                  <Typography variant="bodyMedium" color="text.secondary">
                    El paciente no dejó un comentario.
                  </Typography>
                )}
              </Paper>

              <Typography variant="labelSmall" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                {formatDateLong(detailTarget.createdAt)}
              </Typography>
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
