import type { ReactElement } from 'react';
import {
  Archive,
  CheckCircleOutline,
  EventBusy,
  Inventory2Outlined,
  PauseCircleOutline,
  Schedule,
} from '@mui/icons-material';
import type { ChipProps } from '@mui/material';
import StatusChip, { type StatusTone } from '../../../../components/common/StatusChip';
import { displayInfo, type OfferDisplayStatus } from '../../utils/offerStatus';

interface OfferStatusChipProps {
  status: OfferDisplayStatus;
  size?: ChipProps['size'];
}

const ICONS: Record<OfferDisplayStatus, ReactElement> = {
  ACTIVE: <CheckCircleOutline sx={{ fontSize: '1rem !important' }} />,
  SCHEDULED: <Schedule sx={{ fontSize: '1rem !important' }} />,
  QUOTA_FULL: <Inventory2Outlined sx={{ fontSize: '1rem !important' }} />,
  EXPIRED: <EventBusy sx={{ fontSize: '1rem !important' }} />,
  PAUSED: <PauseCircleOutline sx={{ fontSize: '1rem !important' }} />,
  INACTIVE: <Archive sx={{ fontSize: '1rem !important' }} />,
};

const TONE_MAP: Record<OfferDisplayStatus, StatusTone> = {
  ACTIVE: 'success',
  SCHEDULED: 'info',
  QUOTA_FULL: 'warning',
  EXPIRED: 'neutral',
  PAUSED: 'secondary',
  INACTIVE: 'neutral',
};

/**
 * Status chip for the practitioner's offered treatments. Delegates the
 * tonal treatment to the shared StatusChip so light/dark contrast is
 * handled centrally, and overrides the tone mapping when the semantic
 * differs from the original display palette.
 */
export default function OfferStatusChip({ status, size = 'small' }: OfferStatusChipProps) {
  const info = displayInfo(status);
  return (
    <StatusChip
      label={info.label}
      tone={TONE_MAP[status]}
      icon={ICONS[status]}
      size={size}
    />
  );
}
