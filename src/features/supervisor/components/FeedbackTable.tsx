import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Box,
  Stack,
  Skeleton,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { FormatQuote as QuoteIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import FeedbackScoresDisplay from '../../../components/common/FeedbackScoresDisplay';
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

  const items = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;
  const currentPage = page?.page ?? 0;
  const pageSize = page?.size ?? 10;

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

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          <Stack spacing={0} divider={<Divider sx={{ borderColor: theme.palette.outlineVariant }} />}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Box key={idx} sx={{ p: 2 }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={0} divider={<Divider sx={{ borderColor: theme.palette.outlineVariant }} />}>
            {items.map((feedback) => (
              <Box key={feedback.id} sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="titleSmall" fontWeight={700}>
                      {feedback.practitionerName}
                    </Typography>
                    <Typography variant="labelSmall" color="text.secondary">
                      {feedback.patientName} · {formatDate(feedback.createdAt)}
                    </Typography>
                  </Box>
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
        )}
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
                  <TableRow key={feedback.id} hover>
                    <TableCell>
                      <Typography variant="bodySmall" color="text.secondary">
                        {formatDate(feedback.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="bodyMedium" fontWeight={600}>
                        {feedback.practitionerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="bodyMedium">{feedback.patientName}</Typography>
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
    </Box>
  );
}
