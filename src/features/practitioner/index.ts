export { useOfferedTreatments } from './hooks/useOfferedTreatments';
export type { ReactivateOutcome } from './hooks/useOfferedTreatments';
export { useMyAttentions } from './hooks/useMyAttentions';
export { useAttentionDetail } from './hooks/useAttentionDetail';

export { default as OfferWizardDialog } from './components/catalog/OfferWizardDialog';
export { default as OfferEditDialog } from './components/catalog/OfferEditDialog';
export { default as DeleteOfferConfirmDialog } from './components/catalog/DeleteOfferConfirmDialog';
export { default as PauseOfferDialog } from './components/catalog/PauseOfferDialog';
export { default as AvailabilitySlotsField } from './components/catalog/AvailabilitySlotsField';
export { default as TreatmentCard } from './components/catalog/TreatmentCard';
export { default as TreatmentList } from './components/catalog/TreatmentList';
export { default as OfferStatusChip } from './components/catalog/OfferStatusChip';
export { default as OfferStatusFilter } from './components/catalog/OfferStatusFilter';
export { default as TreatmentsViewSwitcher } from './components/catalog/TreatmentsViewSwitcher';

export { default as AttentionCard } from './components/attentions/AttentionCard';
export { default as AddProgressNoteDialog } from './components/attentions/AddProgressNoteDialog';
export { default as CancelAttentionDialog } from './components/attentions/CancelAttentionDialog';

export { default as EmptyState } from './components/common/EmptyState';

export { useTreatmentsViewStore } from './store/treatmentsViewStore';
export type { TreatmentsViewMode, TreatmentsFilter } from './store/treatmentsViewStore';

export { DAYS_OF_WEEK, DAY_LABELS } from './utils/dayOfWeek';
export type { DayOfWeek } from './utils/dayOfWeek';
export {
  deriveDisplayStatus,
  deriveBucket,
  displayInfo,
  isEditableStatus,
} from './utils/offerStatus';
export type { OfferDisplayStatus, OfferBucket } from './utils/offerStatus';
export {
  checkAttentionTermination,
  terminationBlockerMessage,
} from './utils/attentionPredicates';
export type { AttentionTerminationCheck } from './utils/attentionPredicates';
export { mapPractitionerError } from './utils/apiErrors';
