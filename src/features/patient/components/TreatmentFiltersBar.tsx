import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import {
  Search as SearchIcon,
  RestartAlt as RestartAltIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import type {
  DayOfWeek,
  OfferedTreatmentSortField,
  SortDirection,
} from '../../../types/patient.types';
import type { TreatmentFilters } from '../hooks/useAvailableTreatments';

interface TreatmentFiltersBarProps {
  filters: TreatmentFilters;
  onChange: (next: Partial<TreatmentFilters>) => void;
  onReset: () => void;
  disabled?: boolean;
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

const SORT_OPTIONS: { value: OfferedTreatmentSortField; label: string }[] = [
  { value: 'treatmentName', label: 'Nombre' },
  { value: 'specialty', label: 'Especialidad' },
  { value: 'duration', label: 'Duración' },
  { value: 'offerStartDate', label: 'Inicio de oferta' },
  { value: 'offerEndDate', label: 'Fin de oferta' },
];

export default function TreatmentFiltersBar({
  filters,
  onChange,
  onReset,
  disabled = false,
}: TreatmentFiltersBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre del tratamiento, descripción o practicante…"
          value={filters.keyword}
          onChange={(e) => onChange({ keyword: e.target.value })}
          disabled={disabled}
          size="medium"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1.5fr 1fr 1fr auto',
            },
            gap: 2,
          }}
        >
          <TextField
            label="Especialidad"
            value={filters.specialty}
            onChange={(e) => onChange({ specialty: e.target.value })}
            placeholder="Ej: Endodoncia"
            disabled={disabled}
            size="small"
          />

          <TextField
            select
            label="Día disponible"
            value={filters.availability}
            onChange={(e) =>
              onChange({ availability: (e.target.value || '') as DayOfWeek | '' })
            }
            disabled={disabled}
            size="small"
          >
            <MenuItem value="">Cualquier día</MenuItem>
            {DAYS.map((d) => (
              <MenuItem key={d.value} value={d.value}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Ordenar por"
            value={filters.sortBy}
            onChange={(e) =>
              onChange({ sortBy: e.target.value as OfferedTreatmentSortField })
            }
            disabled={disabled}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SortIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                onChange({
                  sortDirection: (filters.sortDirection === 'ASC' ? 'DESC' : 'ASC') as SortDirection,
                })
              }
              disabled={disabled}
            >
              {filters.sortDirection === 'ASC' ? 'Ascendente' : 'Descendente'}
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={onReset}
              disabled={disabled}
            >
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
