import {
  Box,
  InputAdornment,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterAltOff as ClearIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import type { PractitionerDTO, FeedbackDashboardQuery } from '../../../types/supervisor.types';

interface FeedbackFiltersBarProps {
  query: FeedbackDashboardQuery;
  practitioners: PractitionerDTO[];
  practitionersLoading: boolean;
  onChange: (next: FeedbackDashboardQuery) => void;
  onReset: () => void;
}

type SortOption = `${NonNullable<FeedbackDashboardQuery['sortBy']>}_${'ASC' | 'DESC'}`;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'createdAt_DESC', label: 'Más recientes primero' },
  { value: 'createdAt_ASC', label: 'Más antiguos primero' },
  { value: 'practitionerId_ASC', label: 'Practicante A-Z' },
  { value: 'practitionerId_DESC', label: 'Practicante Z-A' },
  { value: 'patientId_ASC', label: 'Paciente A-Z' },
  { value: 'patientId_DESC', label: 'Paciente Z-A' },
];

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

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split('_') as [
      NonNullable<FeedbackDashboardQuery['sortBy']>,
      'ASC' | 'DESC',
    ];
    onChange({ ...query, sortBy, sortDirection, page: 0 });
  };

  const currentSort: SortOption = `${query.sortBy ?? 'createdAt'}_${query.sortDirection ?? 'DESC'}`;

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
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={query.endDate ?? ''}
          onChange={(e) => handleEndDateChange(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          select
          label="Ordenar"
          size="small"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SortIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

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
