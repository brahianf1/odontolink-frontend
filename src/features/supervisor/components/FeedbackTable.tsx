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
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
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
      <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay feedback para mostrar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajusta los filtros o vuelve más tarde.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Box>
        {loading ? (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card variant="outlined" key={idx}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" />
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            {items.map((feedback) => (
              <Card key={feedback.id} variant="outlined">
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {feedback.practitionerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(feedback.createdAt)}
                      </Typography>
                    </Box>
                    <FeedbackScoresDisplay scores={feedback.scores} variant="compact" />
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Paciente: <strong>{feedback.patientName}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Tratamiento: <strong>{feedback.treatmentName}</strong>
                  </Typography>
                  {feedback.comment && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                      “{feedback.comment}”
                    </Typography>
                  )}
                </CardContent>
              </Card>
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
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
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
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(feedback.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {feedback.practitionerName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{feedback.patientName}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{feedback.treatmentName}</Typography>
                    </TableCell>
                    <TableCell>
                      <FeedbackScoresDisplay scores={feedback.scores} variant="compact" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <Typography
                        variant="body2"
                        color={feedback.comment ? 'text.primary' : 'text.secondary'}
                        sx={{
                          fontStyle: feedback.comment ? 'italic' : 'normal',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {feedback.comment ? `“${feedback.comment}”` : '— sin comentario —'}
                      </Typography>
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
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </Box>
  );
}
