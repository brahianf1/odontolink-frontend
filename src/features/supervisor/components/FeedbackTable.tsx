import { useCallback, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  CompareArrows as CompareIcon,
  FormatQuote as QuoteIcon,
  MedicalServices as TreatmentIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import FeedbackScoresDisplay from '../../../components/common/FeedbackScoresDisplay';
import UserAvatar from '../../../components/common/UserAvatar';
import { getFeedbackForAttention } from '../../../services/api/feedbackService';
import { isPractitionerRole } from '../../../utils/roles';
import type { PageResponse } from '../../../types/common.types';
import type { FeedbackResponseDTO } from '../../../types/feedback.types';

interface FeedbackTableProps {
  page: PageResponse<FeedbackResponseDTO> | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const formatDate = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

const formatDateLong = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return value;
  }
};

const renderSkeletonRows = (count: number) =>
  Array.from({ length: count }).map((_, idx) => (
    <TableRow key={idx}>
      {Array.from({ length: 6 }).map((__, cell) => (
        <TableCell key={cell}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
    </TableRow>
  ));

export default function FeedbackTable({
  page,
  loading,
  onPageChange,
  onPageSizeChange,
}: FeedbackTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [detailTarget, setDetailTarget] = useState<FeedbackResponseDTO | null>(null);
  const [reverseOpen, setReverseOpen] = useState(false);
  const [reverseFeedback, setReverseFeedback] = useState<FeedbackResponseDTO | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);

  const items = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;
  const currentPage = page?.page ?? 0;
  const pageSize = page?.size ?? 10;

  const loadReverseFeedback = useCallback(async (attentionId: number) => {
    setReverseLoading(true);
    setReverseError(null);
    setReverseFeedback(null);
    try {
      const all = await getFeedbackForAttention(attentionId);
      const prToP = all.find((f) => isPractitionerRole(f.submittedByRole)) ?? null;
      setReverseFeedback(prToP);
      if (!prToP) setReverseError('El practicante no dejó evaluación para esta atención.');
    } catch {
      setReverseError('No se pudo cargar la evaluación del practicante.');
    } finally {
      setReverseLoading(false);
    }
  }, []);

  const handleOpenDetail = (feedback: FeedbackResponseDTO) => {
    setDetailTarget(feedback);
    setReverseOpen(false);
    setReverseFeedback(null);
    setReverseError(null);
  };

  const handleToggleReverse = () => {
    if (!reverseOpen && detailTarget) {
      setReverseOpen(true);
      void loadReverseFeedback(detailTarget.attentionId);
    } else {
      setReverseOpen(false);
    }
  };

  const handleCloseDetail = () => {
    setDetailTarget(null);
    setReverseOpen(false);
    setReverseFeedback(null);
    setReverseError(null);
  };

  if (!loading && items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
        <Typography variant="titleMedium" fontWeight={600} color="text.secondary" gutterBottom>
          Sin evaluaciones para mostrar
        </Typography>
        <Typography variant="bodyMedium" color="text.secondary">
          Ajustá los filtros o volvé más tarde.
        </Typography>
      </Box>
    );
  }

  const renderDetailDialog = () => (
    <Dialog
      open={detailTarget !== null}
      onClose={handleCloseDetail}
      maxWidth="sm"
      fullWidth
    >
      {detailTarget && (
        <>
          <DialogTitle sx={{ pb: 1, pr: 6 }}>
            <Typography variant="titleLarge" fontWeight={700}>
              Detalle de evaluación
            </Typography>
            <IconButton
              aria-label="cerrar"
              onClick={handleCloseDetail}
              sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {/* Context */}
            <Paper
              sx={{
                p: 2.5,
                mb: 3,
                backgroundColor: theme.palette.surfaces.container,
                border: `1px solid ${theme.palette.outlineVariant}`,
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <UserAvatar
                    src={detailTarget.patientProfilePictureUrl}
                    name={detailTarget.patientName}
                    size={32}
                    sx={{
                      backgroundColor: theme.palette.primary.container,
                      color: theme.palette.primary.onContainer,
                    }}
                  />
                  <Box>
                    <Typography variant="titleSmall" fontWeight={600}>
                      {detailTarget.patientName}
                    </Typography>
                    <Typography variant="labelSmall" color="text.secondary">
                      evaluó a {detailTarget.practitionerName}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<TreatmentIcon />}
                    label={detailTarget.treatmentName}
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
                    sx={{ backgroundColor: theme.palette.surfaces.containerHigh, fontWeight: 500 }}
                  />
                </Stack>
              </Stack>
            </Paper>

            {/* P→Pr scores */}
            <Typography variant="titleSmall" fontWeight={700} sx={{ mb: 2 }}>
              Calificación del paciente
            </Typography>
            <Box
              sx={{
                p: 2.5, mb: 2,
                backgroundColor: theme.palette.surfaces.containerLow,
                border: `1px solid ${theme.palette.outlineVariant}`,
              }}
            >
              <FeedbackScoresDisplay scores={detailTarget.scores} variant="expanded" size="medium" />
            </Box>

            {/* Comment */}
            {detailTarget.comment ? (
              <Paper
                sx={{
                  p: 2, mb: 3,
                  backgroundColor: theme.palette.surfaces.containerLow,
                  border: `1px solid ${theme.palette.outlineVariant}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <QuoteIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                  <Typography variant="bodyMedium" sx={{ fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                    {detailTarget.comment}
                  </Typography>
                </Stack>
              </Paper>
            ) : (
              <Typography variant="bodySmall" color="text.secondary" sx={{ mb: 3 }}>
                El paciente no dejó un comentario.
              </Typography>
            )}

            <Typography variant="labelSmall" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {formatDateLong(detailTarget.createdAt)}
            </Typography>

            {/* Reverse feedback toggle */}
            <Divider sx={{ borderColor: theme.palette.outlineVariant }} />
            <Button
              startIcon={<CompareIcon />}
              endIcon={
                <ExpandMoreIcon
                  sx={{
                    transform: reverseOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms',
                  }}
                />
              }
              onClick={handleToggleReverse}
              sx={{ mt: 1, textTransform: 'none', fontWeight: 600 }}
              fullWidth
            >
              {reverseOpen ? 'Ocultar evaluación del practicante' : 'Ver cómo calificó el practicante al paciente'}
            </Button>

            <Collapse in={reverseOpen}>
              <Box sx={{ mt: 2 }}>
                {reverseLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={28} />
                  </Box>
                )}
                {reverseError && !reverseLoading && (
                  <Alert severity="info" sx={{ mt: 1 }}>{reverseError}</Alert>
                )}
                {reverseFeedback && !reverseLoading && (
                  <Paper
                    sx={{
                      p: 2.5,
                      backgroundColor: theme.palette.surfaces.container,
                      border: `1px solid ${theme.palette.outlineVariant}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <UserAvatar
                        src={reverseFeedback.practitionerProfilePictureUrl}
                        name={reverseFeedback.practitionerName}
                        size={28}
                        sx={{
                          backgroundColor: theme.palette.tertiary.container,
                          color: theme.palette.tertiary.onContainer,
                        }}
                      />
                      <Typography variant="titleSmall" fontWeight={600}>
                        {reverseFeedback.practitionerName}
                      </Typography>
                      <Typography variant="labelSmall" color="text.secondary">
                        evaluó a {reverseFeedback.patientName}
                      </Typography>
                    </Stack>

                    <FeedbackScoresDisplay scores={reverseFeedback.scores} variant="expanded" size="small" />

                    {reverseFeedback.comment && (
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2 }}>
                        <QuoteIcon sx={{ fontSize: 16, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
                        <Typography variant="bodySmall" sx={{ fontStyle: 'italic' }}>
                          {reverseFeedback.comment}
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                )}
              </Box>
            </Collapse>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={handleCloseDetail} variant="contained" fullWidth>
              Cerrar
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );

  if (isMobile) {
    return (
      <Box>
        <Stack spacing={0} divider={<Divider sx={{ borderColor: theme.palette.outlineVariant }} />}>
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <Box key={idx} sx={{ p: 2 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" />
                </Box>
              ))
            : items.map((feedback) => (
                <Box
                  key={feedback.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: `background-color ${theme.motion?.duration?.short3 ?? 200}ms`,
                    '&:hover': { backgroundColor: theme.palette.surfaces.container },
                  }}
                  onClick={() => handleOpenDetail(feedback)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                      <UserAvatar
                        src={feedback.practitionerProfilePictureUrl}
                        name={feedback.practitionerName}
                        size={36}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="titleSmall" fontWeight={700} noWrap>
                          {feedback.practitionerName}
                        </Typography>
                        <Typography variant="labelSmall" color="text.secondary">
                          {feedback.patientName} · {formatDate(feedback.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                    <FeedbackScoresDisplay scores={feedback.scores} variant="compact" />
                  </Stack>
                  <Typography variant="labelSmall" color="text.secondary" sx={{ mt: 0.5 }}>
                    {feedback.treatmentName}
                  </Typography>
                  {feedback.comment && (
                    <Stack direction="row" spacing={0.5} alignItems="flex-start" sx={{ mt: 1 }}>
                      <QuoteIcon sx={{ fontSize: 13, color: 'text.disabled', mt: 0.2, flexShrink: 0 }} />
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
                        {feedback.comment}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              ))}
        </Stack>
        <TablePagination
          component="div"
          count={totalElements}
          page={currentPage}
          onPageChange={(_e, newPage) => onPageChange(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage="Por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
        {renderDetailDialog()}
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ backgroundColor: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.surfaces.container }}>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Practicante</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Paciente</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tratamiento</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Calificación</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Comentario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? renderSkeletonRows(pageSize)
              : items.map((feedback) => (
                  <TableRow
                    key={feedback.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleOpenDetail(feedback)}
                  >
                    <TableCell>
                      <Typography variant="bodySmall" color="text.secondary">
                        {formatDate(feedback.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UserAvatar
                          src={feedback.practitionerProfilePictureUrl}
                          name={feedback.practitionerName}
                          size={32}
                        />
                        <Typography variant="bodyMedium" fontWeight={600}>
                          {feedback.practitionerName}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UserAvatar
                          src={feedback.patientProfilePictureUrl}
                          name={feedback.patientName}
                          size={32}
                        />
                        <Typography variant="bodyMedium">{feedback.patientName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="bodySmall">{feedback.treatmentName}</Typography>
                    </TableCell>
                    <TableCell>
                      <FeedbackScoresDisplay scores={feedback.scores} variant="compact" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      {feedback.comment ? (
                        <Stack direction="row" spacing={0.5} alignItems="flex-start">
                          <QuoteIcon sx={{ fontSize: 13, color: 'text.disabled', mt: 0.3, flexShrink: 0 }} />
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
                            {feedback.comment}
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
      <TablePagination
        component="div"
        count={totalElements}
        page={currentPage}
        onPageChange={(_e, newPage) => onPageChange(newPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="Por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
      {renderDetailDialog()}
    </Box>
  );
}
