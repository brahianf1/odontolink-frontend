import { useEffect, useMemo, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import {
  createViewMonthGrid,
  createViewWeek,
  createViewDay,
} from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createCurrentTimePlugin } from '@schedule-x/current-time';
import { createScrollControllerPlugin } from '@schedule-x/scroll-controller';
import '@schedule-x/theme-default/dist/index.css';
import type { AppointmentResponseDTO } from '../../../types/attention.types';
import {
  buildStatusCalendars,
  getLocalTimeZone,
  toScheduleXEvents,
  type ScheduleXEvent,
} from '../services/scheduleMappers';
import { useScheduleDensityStore } from '../store/scheduleDensityStore';
import {
  DENSITY_TOKENS,
  type DensityTokens,
} from '../types/schedule.types';

type EventsService = ReturnType<typeof createEventsServicePlugin>;

interface CalendarViewProps {
  appointments: AppointmentResponseDTO[];
  onEventClick?: (appointment: AppointmentResponseDTO) => void;
}

const DAY_BOUNDARIES = { start: '07:00', end: '21:00' } as const;

/**
 * Picks a sensible initial scroll position so the practitioner lands close to
 * "now" instead of the day's start. We bias one hour above the current hour so
 * the red current-time indicator sits roughly in the upper third of the
 * visible area (Google Calendar / Outlook convention). Clamped to the
 * configured day boundaries so we never scroll past the visible range.
 */
const computeInitialScroll = (): string => {
  const [boundaryStartH] = DAY_BOUNDARIES.start.split(':').map(Number);
  const [boundaryEndH] = DAY_BOUNDARIES.end.split(':').map(Number);
  const nowH = new Date().getHours();
  const target = Math.max(boundaryStartH, Math.min(boundaryEndH - 1, nowH - 1));
  return `${String(target).padStart(2, '0')}:00`;
};

interface CalendarViewInnerProps extends CalendarViewProps {
  tokens: DensityTokens;
}

/**
 * Inner component owning the schedule-x lifecycle. `useNextCalendarApp` runs
 * `createCalendar` exactly once (empty deps), so the only safe way to apply a
 * new gridHeight is to remount this subtree. The outer `CalendarView` keys
 * this component by density to achieve that without touching internal state.
 */
function CalendarViewInner({
  appointments,
  onEventClick,
  tokens,
}: CalendarViewInnerProps) {
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
    dayBoundaries: DAY_BOUNDARIES,
    // 14h × 2 rows/30min = 28 rows. gridHeight is driven by the practitioner's
    // density preference (DENSITY_TOKENS): 840 → ~30px/row (compact), 1120 →
    // ~40px (comfortable, default), 1400 → ~50px (spacious). The outer
    // container constrains the viewport; schedule-x scrolls internally when
    // the grid is taller than the available space.
    weekOptions: { gridHeight: tokens.gridHeight, nDays: 7, gridStep: 30 },
    plugins: [
      (() => {
        const service = createEventsServicePlugin();
        eventsServiceRef.current = service;
        return service;
      })(),
      createCurrentTimePlugin({ fullWeekWidth: true }),
      createScrollControllerPlugin({ initialScroll: computeInitialScroll() }),
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
        // Container is viewport-aware so it never forces the page to scroll on
        // smaller laptops: 70vh adapts to the screen, 720px caps the maximum
        // on larger displays, and 480px keeps it usable on short viewports.
        // The grid scrolls internally inside this window when taller.
        height: { xs: 'calc(100vh - 260px)', md: 'min(70vh, 720px)' },
        minHeight: 480,
        '& .sx-react-calendar-wrapper': {
          height: '100%',
        },
        // ── Compact toolbar overrides ──
        // Default schedule-x header is ~77px (~150px when wrapped). We bring
        // it to ~52px (Apple Calendar / Outlook Web / Cal.com standard).
        '& .sx__calendar-header': {
          padding: { xs: '6px 10px', sm: '8px 12px' },
          gap: { xs: '6px', sm: '10px' },
        },
        '& .sx__calendar-header-content': {
          gap: { xs: '6px', sm: '10px' },
        },
        '& .sx__forward-backward-navigation': { height: '36px' },
        '& .sx__calendar-header .sx__date-input': {
          padding: '6px 10px',
          fontSize: '0.875rem',
        },
        '& .sx__calendar-header .sx__today-button': {
          padding: '6px 10px',
          fontSize: '0.875rem',
        },
        '& .sx__view-selection-selected-item': {
          padding: '6px 10px',
          fontSize: '0.875rem',
        },
        '& .sx__range-heading': {
          fontSize: { xs: '0.95rem', sm: '1rem' },
          maxWidth: { xs: '8rem', sm: '14rem' },
        },
        '& .sx__is-calendar-small .sx__calendar-header': {
          padding: '6px 8px',
          gap: '6px',
        },
        // ── Density-driven day header overrides ──
        // Default `.sx__week-grid__date` stacks: 12px padding + 12px day name
        // + 4px gap + 40px (2em) date circle + 12px padding = ~80px tall.
        // We drive padding and the date-number circle from the density tokens
        // so the user can pick how much vertical space the day strip uses.
        '& .sx__week-grid__date': {
          padding: `${tokens.dateColumnPaddingY} 0 !important`,
          gap: '2px',
        },
        '& .sx__week-grid__day-name': {
          fontSize: `${tokens.dayNameFontSize} !important`,
        },
        '& .sx__week-grid__date-number': {
          width: `${tokens.dateNumberSize} !important`,
          height: `${tokens.dateNumberSize} !important`,
          fontSize: `${tokens.dateNumberFontSize} !important`,
        },
      }}
    >
      {calendarApp && <ScheduleXCalendar calendarApp={calendarApp} />}
    </Box>
  );
}

export default function CalendarView(props: CalendarViewProps) {
  const density = useScheduleDensityStore((s) => s.density);
  const tokens = DENSITY_TOKENS[density];
  // Density change → remount the inner subtree so schedule-x rebuilds with
  // the new gridHeight (the library has no public API to change it
  // imperatively). Scroll position resets but the scroll-controller plugin
  // re-anchors to the current time, which is the right default anyway.
  return <CalendarViewInner key={density} tokens={tokens} {...props} />;
}
