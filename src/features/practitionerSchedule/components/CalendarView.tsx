import { useEffect, useMemo, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';

type EventsService = ReturnType<typeof createEventsServicePlugin>;
import { createCurrentTimePlugin } from '@schedule-x/current-time';
import '@schedule-x/theme-default/dist/index.css';
import type { AppointmentResponseDTO } from '../../../types/attention.types';
import {
  buildStatusCalendars,
  getLocalTimeZone,
  toScheduleXEvents,
  type ScheduleXEvent,
} from '../services/scheduleMappers';

interface CalendarViewProps {
  appointments: AppointmentResponseDTO[];
  onEventClick?: (appointment: AppointmentResponseDTO) => void;
}

export default function CalendarView({
  appointments,
  onEventClick,
}: CalendarViewProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Keep a stable reference to the events service so we can update events
  // without recreating the calendar instance (which would reset the view).
  const eventsServiceRef = useRef<EventsService | null>(null);

  const initialEvents = useMemo<ScheduleXEvent[]>(
    () => toScheduleXEvents(appointments),
    // We intentionally compute initial events only on first render; further
    // changes are pushed through eventsService.set(...) below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const calendarApp = useNextCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    defaultView: 'week',
    events: initialEvents,
    calendars: buildStatusCalendars(),
    locale: 'es-ES',
    isDark,
    firstDayOfWeek: 1,
    // Without this, schedule-x defaults to 'UTC' and rotates every event's
    // wall-clock via withTimeZone. Anchoring the calendar to the practitioner's
    // own zone keeps the rendered hour identical to the naive timestamp the
    // backend sends and matches what the daily agenda displays.
    timezone: getLocalTimeZone(),
    dayBoundaries: { start: '07:00', end: '21:00' },
    // gridStep: 30 → renders a row every 30 min so sub-hour appointments
    // (45/30/15 min) snap to a visible gridline. gridHeight scales accordingly:
    // 14h window × 2 rows/h = 28 rows × ~30px ≈ 840px (Google Calendar density).
    weekOptions: { gridHeight: 840, nDays: 7, gridStep: 30 },
    plugins: [
      (() => {
        const service = createEventsServicePlugin();
        eventsServiceRef.current = service;
        return service;
      })(),
      createCurrentTimePlugin({ fullWeekWidth: true }),
    ],
    callbacks: {
      onEventClick: (event) => {
        const payload = (event as ScheduleXEvent)._payload;
        if (payload && onEventClick) onEventClick(payload);
      },
    },
  });

  // Sync events whenever the source array changes.
  useEffect(() => {
    const service = eventsServiceRef.current;
    if (!service) return;
    service.set(toScheduleXEvents(appointments));
  }, [appointments]);

  return (
    <Box
      sx={{
        // Schedule-X exposes CSS variables we can tune to match the MUI theme.
        '--sx-color-primary': theme.palette.primary.main,
        '--sx-color-on-primary': theme.palette.primary.contrastText,
        '--sx-color-primary-container': theme.palette.primary.light,
        '--sx-color-on-primary-container': theme.palette.primary.contrastText,
        '--sx-color-background': theme.palette.background.paper,
        '--sx-color-surface': theme.palette.background.paper,
        '--sx-color-on-surface': theme.palette.text.primary,
        // Mobile keeps a viewport-relative height (mobile scrolls internally);
        // desktop fits the full 14h × 2 rows = 28 lines of 30min grid plus
        // schedule-x's toolbar without forcing an inner scroll.
        height: { xs: 'calc(100vh - 280px)', md: 920 },
        minHeight: 520,
        '& .sx-react-calendar-wrapper': {
          height: '100%',
        },
      }}
    >
      {calendarApp && <ScheduleXCalendar calendarApp={calendarApp} />}
    </Box>
  );
}
