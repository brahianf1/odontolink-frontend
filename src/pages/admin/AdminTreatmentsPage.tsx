import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Skeleton,
  TablePagination,
  Snackbar,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useTreatmentCatalog } from '../../features/admin/hooks/useTreatmentCatalog';
import CreateTreatmentDialog from '../../features/admin/components/CreateTreatmentDialog';
import TreatmentDetailDialog from '../../features/admin/components/TreatmentDetailDialog';
import type { TreatmentResponseDTO } from '../../types/practitioner.types';

interface FeedbackState {
  open: boolean;
  severity: 'success' | 'error';
  message: string;
}

const INITIAL_FEEDBACK: FeedbackState = { open: false, severity: 'success', message: '' };

const AREA_LABEL_SX = {
  display: 'inline-block',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  color: 'text.secondary',
  px: 1,
  py: 0.25,
  border: '1px solid',
  borderColor: 'divider',
  lineHeight: 1.4,
};

const truncate = (value: string | undefined, max: number): string => {
  if (!value) return '';
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
};

export default function AdminTreatmentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    treatments,
    filtered,
    areas,
    loading,
    error,
    search,
    area,
    setSearch,
    setArea,
    refresh,
    prependTreatment,
  } = useTreatmentCatalog();

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<TreatmentResponseDTO | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(INITIAL_FEEDBACK);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalCount = treatments.length;
  const areaCount = areas.length;

  const handleOpenDetail = (treatment: TreatmentResponseDTO) => {
    setSelected(treatment);
    setDetailOpen(true);
  };

  const handleCreateSuccess = (created: TreatmentResponseDTO) => {
    prependTreatment(created);
    setCreateOpen(false);
    setFeedback({
      open: true,
      severity: 'success',
      message: 'Tratamiento agregado al catálogo.',
    });
  };

  const handleCloseFeedback = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const isFiltered = search.trim() !== '' || area !== '';

  const renderLoading = () => (
    <Stack spacing={1.5}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={72} />
      ))}
    </Stack>
  );

  const renderEmpty = () => (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        py: { xs: 5, md: 7 },
        px: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        {isFiltered ? 'Sin resultados' : 'El catálogo está vacío'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {isFiltered
          ? 'Ajustá la búsqueda o el filtro de área para ver más tratamientos.'
          : 'Aún no se cargaron tratamientos al catálogo institucional.'}
      </Typography>
      {!isFiltered && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Crear el primer tratamiento
        </Button>
      )}
    </Box>
  );

  const renderDesktopTable = () => (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 0 }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha(theme.palette.text.primary, 0.02) }}>
            <TableCell sx={{ fontWeight: 700, width: '28%' }}>Tratamiento</TableCell>
            <TableCell sx={{ fontWeight: 700, width: '18%' }}>Área</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Descripción</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, width: 90 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((treatment) => (
            <TableRow key={treatment.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {treatment.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID #{treatment.id}
                </Typography>
              </TableCell>
              <TableCell>
                {treatment.area?.trim() ? (
                  <Box component="span" sx={AREA_LABEL_SX}>
                    {treatment.area}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Sin área
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
                  {treatment.description?.trim()
                    ? truncate(treatment.description, 160)
                    : '—'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Ver detalle">
                  <IconButton size="small" onClick={() => handleOpenDetail(treatment)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileList = () => (
    <Stack spacing={1.5}>
      {paginated.map((treatment) => (
        <Box
          key={treatment.id}
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
            cursor: 'pointer',
            transition: 'border-color 160ms ease',
            '&:hover': { borderColor: alpha(theme.palette.text.primary, 0.16) },
          }}
          onClick={() => handleOpenDetail(treatment)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOpenDetail(treatment);
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {treatment.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ID #{treatment.id}
              </Typography>
            </Box>
            {treatment.area?.trim() && (
              <Box component="span" sx={AREA_LABEL_SX}>
                {treatment.area}
              </Box>
            )}
          </Box>
          {treatment.description?.trim() && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                }}
              >
                {treatment.description}
              </Typography>
            </>
          )}
        </Box>
      ))}
    </Stack>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Catálogo de Tratamientos
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mt: 0.5, color: 'text.secondary' }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Catálogo maestro institucional
            </Typography>
            {!loading && (
              <>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'text.secondary',
                    opacity: 0.4,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
                >
                  {totalCount} {totalCount === 1 ? 'tratamiento' : 'tratamientos'} · {areaCount}{' '}
                  {areaCount === 1 ? 'área' : 'áreas'}
                </Typography>
              </>
            )}
          </Stack>
        </Box>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="text"
            color="inherit"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={() => void refresh()}
            disabled={loading}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', backgroundColor: 'transparent' },
              px: 1,
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ flex: { xs: 1, sm: 'unset' } }}
          >
            Nuevo Tratamiento
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          p: { xs: 2, md: 2.5 },
          mb: 3,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="Buscar por nombre, descripción o área"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearch('');
                      setPage(0);
                    }}
                    aria-label="limpiar búsqueda"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
          />
          <TextField
            select
            size="small"
            label="Área"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setPage(0);
            }}
            disabled={areas.length === 0}
            sx={{ minWidth: { xs: '100%', md: 240 } }}
          >
            <MenuItem value="">Todas las áreas</MenuItem>
            {areas.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 3, borderRadius: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => void refresh()}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        renderLoading()
      ) : filtered.length === 0 ? (
        renderEmpty()
      ) : (
        <Box>
          {isMobile ? renderMobileList() : renderDesktopTable()}
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
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

      <CreateTreatmentDialog
        open={createOpen}
        existingAreas={areas}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <TreatmentDetailDialog
        open={detailOpen}
        treatment={selected}
        onClose={() => setDetailOpen(false)}
      />

      <Snackbar
        open={feedback.open}
        autoHideDuration={4500}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={feedback.severity}
          variant="filled"
          onClose={handleCloseFeedback}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
