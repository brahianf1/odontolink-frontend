import {
  Box,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { FilterAltOff as ClearIcon } from '@mui/icons-material';
import type { PractitionerDTO, FeedbackDashboardQuery } from '../../../types/supervisor.types';

interface FeedbackFiltersBarProps {
  query: FeedbackDashboardQuery;
  practitioners: PractitionerDTO[];
  practitionersLoading: boolean;
  onChange: (next: FeedbackDashboardQuery) => void;
  onReset: () => void;
}

export default function FeedbackFiltersBar({
  query,
  practitioners,
  practitionersLoading,
  onChange,
  onReset,
}: FeedbackFiltersBarProps) {
  const handlePractitionerChange = (value: string) => {
    onChange({
      ...query,
      practitionerId: value ? Number(value) : undefined,
      page: 0,
    });
  };

  const handleStartDateChange = (value: string) => {
    onChange({ ...query, startDate: value || undefined, page: 0 });
  };

  const handleEndDateChange = (value: string) => {
    onChange({ ...query, endDate: value || undefined, page: 0 });
  };

  const hasActiveFilters =
    Boolean(query.practitionerId) || Boolean(query.startDate) || Boolean(query.endDate);

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', md: 'flex-end' }}
      >
        <TextField
          select
          label="Practicante"
          size="small"
          value={query.practitionerId ?? ''}
          onChange={(e) => handlePractitionerChange(e.target.value)}
          disabled={practitionersLoading}
          sx={{ minWidth: 240, flex: { md: 1 } }}
        >
          <MenuItem value="">
            <em>Todos los practicantes</em>
          </MenuItem>
          {practitioners.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.user.firstName} {p.user.lastName} · Legajo {p.studentId}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Desde"
          type="date"
          size="small"
          value={query.startDate ?? ''}
          onChange={(e) => handleStartDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />

        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={query.endDate ?? ''}
          onChange={(e) => handleEndDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 160 }}
        />

        <Tooltip title="Limpiar filtros">
          <span>
            <IconButton
              onClick={onReset}
              disabled={!hasActiveFilters}
              color="primary"
              sx={{ border: 1, borderColor: 'divider' }}
            >
              <ClearIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
