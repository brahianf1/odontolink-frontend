import { useMemo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  StarRate as StarIcon,
  Forum as ForumIcon,
  ArrowForward as ArrowForwardIcon,
  GroupAdd as GroupAddIcon,
  Insights as InsightsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuthStore } from '../../store/authStore';
import { useMyPractitioners } from '../../features/supervisor/hooks/useMyPractitioners';
import { useFeedbackDashboard } from '../../features/supervisor/hooks/useFeedbackDashboard';
import FeedbackMetricCard from '../../features/supervisor/components/FeedbackMetricCard';
import RatingDisplay from '../../features/supervisor/components/RatingDisplay';

const formatDate = (value: string): string => {
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

export default function SupervisorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { practitioners, loading: practitionersLoading } = useMyPractitioners();
  const { data, loading: feedbackLoading } = useFeedbackDashboard({ size: 5 });

  const recentFeedbacks = useMemo(() => data?.feedbacks.content ?? [], [data]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Hola{user?.firstName ? `, ${user.firstName}` : ''} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resumen de tu actividad como autoridad académica.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          mb: 3,
        }}
      >
        <FeedbackMetricCard
          title="Practicantes a cargo"
          icon={<SchoolIcon />}
          loading={practitionersLoading}
          value={practitioners.length}
          caption="Universo bajo tu supervisión"
        />
        <FeedbackMetricCard
          title="Promedio de calificación"
          icon={<StarIcon />}
          loading={feedbackLoading}
          value={
            data ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{data.averageRating.toFixed(2)}</span>
                <RatingDisplay value={data.averageRating} showValue={false} size="medium" />
              </Stack>
            ) : (
              '—'
            )
          }
          caption="Considerando todos los feedbacks recibidos"
        />
        <FeedbackMetricCard
          title="Feedbacks totales"
          icon={<ForumIcon />}
          loading={feedbackLoading}
          value={data ? data.totalFeedbacksCount.toLocaleString('es-AR') : '—'}
          caption="Sobre las atenciones de tus practicantes"
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
        }}
      >
        <Card variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Últimos feedbacks
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Comentarios recientes de pacientes
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/supervisor/feedback')}
              >
                Ver panel completo
              </Button>
            </Stack>
            <Divider sx={{ mb: 2 }} />

            {feedbackLoading ? (
              <Stack spacing={1.5}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Card variant="outlined" key={idx}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Cargando…
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : recentFeedbacks.length === 0 ? (
              <Alert severity="info">
                Aún no hay feedback registrado para los practicantes a tu cargo.
              </Alert>
            ) : (
              <Stack spacing={1.5}>
                {recentFeedbacks.map((feedback) => (
                  <Card key={feedback.id} variant="outlined">
                    <CardContent sx={{ py: 1.5 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {feedback.practitionerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feedback.treatmentName} · {feedback.patientName}
                          </Typography>
                        </Box>
                        <Stack alignItems="flex-end">
                          <RatingDisplay value={feedback.rating} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(feedback.createdAt)}
                          </Typography>
                        </Stack>
                      </Stack>
                      {feedback.comment && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 1,
                            fontStyle: 'italic',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          “{feedback.comment}”
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Accesos rápidos
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<GroupAddIcon />}
                  onClick={() => navigate('/supervisor/practitioners')}
                >
                  Practicantes a cargo
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<InsightsIcon />}
                  onClick={() => navigate('/supervisor/feedback')}
                >
                  Panel de feedback
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Practicantes
              </Typography>
              {practitionersLoading ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando…
                </Typography>
              ) : practitioners.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aún no tienes practicantes vinculados.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {practitioners.slice(0, 5).map((p) => (
                    <Stack
                      key={p.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
                        {p.user.firstName} {p.user.lastName}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${p.studyYear}° año`}
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Stack>
                  ))}
                  {practitioners.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      +{practitioners.length - 5} más
                    </Typography>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
