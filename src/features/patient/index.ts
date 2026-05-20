export { default as AppointmentBookingDialog } from './components/AppointmentBookingDialog';
export { default as AppointmentCard } from './components/AppointmentCard';
export { default as CancelByPatientDialog } from './components/CancelByPatientDialog';
export { default as EmptyState } from './components/EmptyState';
export { default as TreatmentCard } from './components/TreatmentCard';
export { default as TreatmentFiltersBar } from './components/TreatmentFiltersBar';

export { useAvailableSlots } from './hooks/useAvailableSlots';
export {
  useAvailableTreatments,
  DEFAULT_FILTERS,
} from './hooks/useAvailableTreatments';
export type { TreatmentFilters } from './hooks/useAvailableTreatments';
export { useMyAppointments } from './hooks/useMyAppointments';
export { useMyAttentions } from './hooks/useMyAttentions';

export {
  PatientFeedbackProvider,
  usePatientFeedback,
} from './context/PatientFeedbackProvider';

export {
  getAppointmentStatusLabel,
  getAppointmentStatusTone,
  getAttentionStatusLabel,
  getAttentionStatusTone,
} from './utils/appointmentStatus';

export { mapBusinessError } from './utils/apiErrors';
