import type { ReactElement } from 'react';
import { Chip, type ChipProps, alpha } from '@mui/material';
import {
  Archive,
  CheckCircleOutline,
  EventBusy,
  Inventory2Outlined,
  PauseCircleOutline,
  Schedule,
} from '@mui/icons-material';
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

/**
 * Tonal-surface chip following Material 3 guidance. Tones are deliberately
 * limited to success / info / secondary / neutral — there is no `error`
 * tone anywhere in the offer state vocabulary. Error is reserved for
 * destructive actions (delete confirm) and validation failures.
 */
export default function OfferStatusChip({ status, size = 'small' }: OfferStatusChipProps) {
  const info = displayInfo(status);
  return (
    <Chip
      size={size}
      icon={ICONS[status]}
      label={info.label}
      sx={(theme) => {
        const palette =
          info.tone === 'neutral'
            ? theme.palette.grey
            : theme.palette[info.tone];
        const main =
          (palette as { main?: string; 700?: string }).main ??
          (palette as { 700?: string })[700] ??
          theme.palette.text.primary;
        return {
          bgcolor: alpha(main, 0.12),
          color: main,
          fontWeight: 600,
          border: `1px solid ${alpha(main, 0.2)}`,
          '& .MuiChip-icon': { color: main },
        };
      }}
    />
  );
}
