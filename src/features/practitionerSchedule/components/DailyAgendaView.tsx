import { useMemo } from 'react';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { addDays, isSameDay, parseISO, startOfDay } from 'date-fns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AppointmentResponseDTO } from '../../../types/attention.types';
import AppointmentCard from './AppointmentCard';

interface DailyAgendaViewProps {
  appointments: AppointmentResponseDTO[];
  mutatingId: number | null;
  onComplete: (id: number) => void;
  onNoShow: (id: number) => void;
  onCancelRequest: (appointment: AppointmentResponseDTO) => void;
}

interface Bucket {
  key: 'today' | 'tomorrow' | 'later';
  title: string;
  subtitle: string;
  items: AppointmentResponseDTO[];
}

const compareByTime = (
  a: AppointmentResponseDTO,
  b: AppointmentResponseDTO
): number =>
  parseISO(a.appointmentTime).getTime() - parseISO(b.appointmentTime).getTime();

export default function DailyAgendaView({
  appointments,
  mutatingId,
  onComplete,
  onNoShow,
  onCancelRequest,
}: DailyAgendaViewProps) {
  const buckets = useMemo<Bucket[]>(() => {
    const today = startOfDay(new Date());
    const tomorrow = addDays(today, 1);

    const sorted = [...appointments].sort(compareByTime);

    const todays: AppointmentResponseDTO[] = [];
    const tomorrows: AppointmentResponseDTO[] = [];
    const later: AppointmentResponseDTO[] = [];

    sorted.forEach((appt) => {
      const day = parseISO(appt.appointmentTime);
      if (isSameDay(day, today)) todays.push(appt);
      else if (isSameDay(day, tomorrow)) tomorrows.push(appt);
      else later.push(appt);
    });

    return [
      {
        key: 'today',
        title: 'Hoy',
        subtitle: format(today, "EEEE, dd 'de' MMMM", { locale: es }),
        items: todays,
      },
      {
        key: 'tomorrow',
        title: 'Mañana',
        subtitle: format(tomorrow, "EEEE, dd 'de' MMMM", { locale: es }),
        items: tomorrows,
      },
      {
        key: 'later',
        title: 'Próximamente',
        subtitle: 'Otros turnos agendados',
        items: later,
      },
    ];
  }, [appointments]);

  return (
    <Stack spacing={4}>
      {buckets.map((bucket) => (
        <Box key={bucket.key}>
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1.5}
            sx={{ mb: 2, flexWrap: 'wrap' }}
          >
            <Typography variant="h5" fontWeight={700}>
              {bucket.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textTransform: 'capitalize' }}
            >
              {bucket.subtitle}
            </Typography>
            <Chip
              label={`${bucket.items.length} turno${bucket.items.length === 1 ? '' : 's'}`}
              size="small"
              variant="outlined"
              sx={{ ml: 'auto' }}
            />
          </Stack>

          {bucket.items.length === 0 ? (
            <Card variant="outlined">
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  color: 'text.secondary',
                }}
              >
                <EventBusyIcon />
                <Typography variant="body2">
                  No hay turnos para {bucket.title.toLowerCase()}.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {bucket.items.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  busy={mutatingId === appt.id}
                  onComplete={onComplete}
                  onNoShow={onNoShow}
                  onCancelRequest={onCancelRequest}
                />
              ))}
            </Stack>
          )}
        </Box>
      ))}
    </Stack>
  );
}
