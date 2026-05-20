export { default as AppointmentHistorySection } from './components/AppointmentHistorySection';
export { default as AppointmentStatusChip } from './components/AppointmentStatusChip';
export { default as AppointmentTimelineItem } from './components/AppointmentTimelineItem';
export { default as AttentionBreadcrumbs } from './components/AttentionBreadcrumbs';
export type { BreadcrumbCrumb } from './components/AttentionBreadcrumbs';
export { default as AttentionDetailHeader } from './components/AttentionDetailHeader';
export { default as AttentionStatusChip } from './components/AttentionStatusChip';
export { default as ConfirmAttentionActionDialog } from './components/ConfirmAttentionActionDialog';
export { default as PatientSummaryCard } from './components/PatientSummaryCard';
export { default as ProgressNoteItem } from './components/ProgressNoteItem';
export { default as ProgressNotesSection } from './components/ProgressNotesSection';
export { default as SectionHeader } from './components/SectionHeader';
export { default as TreatmentSummaryCard } from './components/TreatmentSummaryCard';

export {
  checkAttentionTermination,
  terminationBlockerMessage,
  type AttentionTerminationBlocker,
  type AttentionTerminationCheck,
} from './utils/attentionPredicates';
