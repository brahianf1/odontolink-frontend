import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { GridView, ViewList } from '@mui/icons-material';
import type { TreatmentsViewMode } from '../../store/treatmentsViewStore';

interface TreatmentsViewSwitcherProps {
  value: TreatmentsViewMode;
  onChange: (view: TreatmentsViewMode) => void;
}

export default function TreatmentsViewSwitcher({
  value,
  onChange,
}: TreatmentsViewSwitcherProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      onChange={(_, next) => {
        if (next) onChange(next as TreatmentsViewMode);
      }}
      sx={{
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          borderColor: 'divider',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
          },
        },
      }}
    >
      <Tooltip title="Vista de tarjetas">
        <ToggleButton value="cards" aria-label="Vista de tarjetas">
          <GridView fontSize="small" />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Vista de lista">
        <ToggleButton value="list" aria-label="Vista de lista">
          <ViewList fontSize="small" />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}
