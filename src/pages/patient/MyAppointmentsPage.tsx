import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { EventBusy as EventBusyIcon } from '@mui/icons-material';
import type { AppointmentResponseDTO } from '../../types/appointment.types';
import {
  AppointmentCard,
  CancelByPatientDialog,
  EmptyState,
  useMyAppointments,
} from '../../features/patient';

export default function MyAppointmentsPage() {
  const navigate = useNavigate();
  const { appointments, loading, cancellingId, error, cancel } = useMyAppointments();

  const [cancelTarget, setCancelTarget] = useState<AppointmentResponseDTO | null>(null);

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()
      ),
    [appointments]
  );

  const handleCancel = async (reason: string) => {
    if (!cancelTarget) return;
    const ok = await cancel(cancelTarget.id, reason);
    if (ok) setCancelTarget(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}
        >
          Mis Turnos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Estos son tus próximos turnos programados. Puedes cancelarlos si lo necesitas.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </Stack>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={<EventBusyIcon sx={{ fontSize: 36 }} />}
          title="No tienes turnos programados"
          description="Cuando reserves un turno aparecerá aquí con todos los detalles para que no se te pase."
          actionLabel="Buscar tratamientos"
          onAction={() => navigate('/patient/treatments')}
        />
      ) : (
        <Stack spacing={2}>
          {sorted.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              cancelling={cancellingId === appointment.id}
              onCancel={setCancelTarget}
            />
          ))}
        </Stack>
      )}

      <CancelByPatientDialog
        open={Boolean(cancelTarget)}
        appointment={cancelTarget}
        loading={cancellingId !== null && cancellingId === cancelTarget?.id}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
      />
    </Box>
  );
}
