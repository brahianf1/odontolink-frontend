import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import type { TreatmentsFilter } from '../../store/treatmentsViewStore';

interface OfferStatusFilterProps {
  value: TreatmentsFilter;
  counts: Record<TreatmentsFilter, number>;
  onChange: (filter: TreatmentsFilter) => void;
}

const OPTIONS: ReadonlyArray<{ value: TreatmentsFilter; label: string }> = [
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'PAUSED', label: 'Pausadas' },
  { value: 'EXPIRED', label: 'Vencidas' },
  { value: 'INACTIVE', label: 'Archivadas' },
  { value: 'ALL', label: 'Todas' },
];

/**
 * Material 3 segmented buttons. Buckets are mutually exclusive — each offer
 * lands in exactly one filter. We hide empty buckets except for ACTIVE
 * (which is the page's default landing) and ALL (always available as
 * escape hatch).
 */
export default function OfferStatusFilter({ value, counts, onChange }: OfferStatusFilterProps) {
  const visible = OPTIONS.filter(
    (opt) => opt.value === 'ACTIVE' || opt.value === 'ALL' || (counts[opt.value] ?? 0) > 0
  );

  if (visible.length <= 1) return null;

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      onChange={(_, next) => {
        if (next) onChange(next as TreatmentsFilter);
      }}
      sx={{
        flexWrap: 'wrap',
        gap: 0.5,
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 999,
          px: 1.75,
          py: 0.5,
          border: '1px solid',
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderColor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' },
          },
        },
      }}
    >
      {visible.map((opt) => {
        const count = counts[opt.value] ?? 0;
        return (
          <ToggleButton key={opt.value} value={opt.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <span>{opt.label}</span>
              <Typography
                component="span"
                variant="caption"
                sx={{
                  fontWeight: 700,
                  opacity: 0.85,
                  bgcolor: (t) =>
                    value === opt.value ? 'rgba(255,255,255,0.18)' : t.palette.action.hover,
                  px: 0.75,
                  py: 0.1,
                  borderRadius: 1,
                  minWidth: 18,
                  textAlign: 'center',
                }}
              >
                {count}
              </Typography>
            </Box>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}
