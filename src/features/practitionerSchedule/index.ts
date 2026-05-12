export { useAppointments } from './hooks/useAppointments';
export { default as DailyAgendaView } from './components/DailyAgendaView';
export { default as CalendarView } from './components/CalendarView';
export { default as ViewSwitcher } from './components/ViewSwitcher';
export { default as CancelAppointmentDialog } from './components/CancelAppointmentDialog';
export { default as AppointmentDetailsDialog } from './components/AppointmentDetailsDialog';
export { default as StatusBadge } from './components/StatusBadge';
export { default as AppointmentCard } from './components/AppointmentCard';
export { STATUS_CONFIG } from './types/schedule.types';
export type {
  AppointmentStatus,
  ScheduleViewMode,
  StatusConfig,
} from './types/schedule.types';
