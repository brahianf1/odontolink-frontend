import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import type { ScheduleViewMode } from '../types/schedule.types';

interface ViewSwitcherProps {
  value: ScheduleViewMode;
  onChange: (next: ScheduleViewMode) => void;
}

export default function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, next: ScheduleViewMode | null) => {
        if (next) onChange(next);
      }}
      size="small"
      aria-label="Cambiar vista de agenda"
      sx={{
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          px: { xs: 1.5, sm: 2.5 },
          py: 0.75,
          fontWeight: 600,
          borderRadius: 0,
        },
      }}
    >
      <ToggleButton value="daily" aria-label="Agenda diaria">
        <ViewAgendaIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
        <span style={{ display: 'inline' }}>Agenda Diaria</span>
      </ToggleButton>
      <ToggleButton value="planning" aria-label="Vista de planificación">
        <CalendarMonthIcon fontSize="small" sx={{ mr: { xs: 0, sm: 1 } }} />
        <span style={{ display: 'inline' }}>Planificación</span>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
