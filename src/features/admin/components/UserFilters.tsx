import {
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { ADMIN_USER_ROLES, type AdminUserRole } from '../../../types/admin.types';
import { getRoleLabel } from '../utils/roleLabels';

type StatusFilter = 'all' | 'active' | 'inactive';

interface UserFiltersProps {
  search: string;
  role: AdminUserRole | '';
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: AdminUserRole | '') => void;
  onStatusChange: (value: StatusFilter) => void;
}

export default function UserFilters({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ width: '100%' }}
      >
        <TextField
          fullWidth
          size="small"
          label="Buscar por nombre, email o DNI"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')} aria-label="limpiar búsqueda">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />

        <TextField
          select
          size="small"
          label="Rol"
          value={role}
          onChange={(e) => onRoleChange(e.target.value as AdminUserRole | '')}
          sx={{ minWidth: { xs: '100%', md: 220 } }}
        >
          <MenuItem value="">Todos los roles</MenuItem>
          {ADMIN_USER_ROLES.map((option) => (
            <MenuItem key={option} value={option}>
              {getRoleLabel(option)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Estado"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          sx={{ minWidth: { xs: '100%', md: 180 } }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="active">Activos</MenuItem>
          <MenuItem value="inactive">Inactivos</MenuItem>
        </TextField>
      </Stack>
    </Box>
  );
}

export type { StatusFilter };
