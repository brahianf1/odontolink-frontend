import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  GridView as GridViewIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  SearchOff as SearchOffIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { getMyAttentions } from '../../services/api/practitionerService';
import type { AttentionResponseDTO } from '../../types/attention.types';
import { EmptyState } from '../../features/practitioner';
import PatientCard, {
  type PatientSummary,
} from '../../features/practitioner/components/patients/PatientCard';
import PatientListTable from '../../features/practitioner/components/patients/PatientListTable';

type ViewMode = 'cards' | 'list';

const groupByPatient = (attentions: AttentionResponseDTO[]): PatientSummary[] => {
  const map = new Map<number, PatientSummary>();
  attentions.forEach((att) => {
    const existing = map.get(att.patientId);
    if (existing) {
      existing.totalCount += 1;
      existing.attentions.push(att);
      if (att.status === 'IN_PROGRESS') existing.activeCount += 1;
    } else {
      map.set(att.patientId, {
        id: att.patientId,
        name: att.patientName,
        profilePictureUrl: att.patientProfilePictureUrl ?? null,
        totalCount: 1,
        activeCount: att.status === 'IN_PROGRESS' ? 1 : 0,
        attentions: [att],
      });
    }
  });

  return Array.from(map.values())
    .map((patient) => ({
      ...patient,
      attentions: [...patient.attentions].sort((a, b) => b.id - a.id),
    }))
    .sort((a, b) => {
      if (b.activeCount !== a.activeCount) return b.activeCount - a.activeCount;
      return a.name.localeCompare(b.name);
    });
};

export default function PatientsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(null);
  const [view, setView] = useState<ViewMode>('cards');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyAttentions();
        setPatients(groupByPatient(data));
      } catch (err) {
        console.error('Error loading patients:', err);
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const totalActive = useMemo(
    () => patients.reduce((acc, p) => acc + p.activeCount, 0),
    [patients]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(query));
  }, [patients, search]);

  const isSearching = search.trim().length > 0;

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Mis Pacientes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {patients.length} paciente{patients.length === 1 ? '' : 's'} único
            {patients.length === 1 ? '' : 's'} · {totalActive} atención
            {totalActive === 1 ? '' : 'es'} en curso
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={view}
          exclusive
          size="small"
          onChange={(_, next) => {
            if (next) setView(next as ViewMode);
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
              <GridViewIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title="Vista de lista">
            <ToggleButton value="list" aria-label="Vista de lista">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre de paciente…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, maxWidth: { sm: 420 } }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack spacing={2}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={96} />
          ))}
        </Stack>
      ) : patients.length === 0 ? (
        <EmptyState
          icon={<PeopleIcon />}
          title="Todavía no tenés pacientes"
          description="Cuando un paciente reserve un turno con una de tus ofertas y la atención clínica se inicie, va a aparecer acá agrupada por paciente."
          tone="neutral"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchOffIcon />}
          title="Sin resultados"
          description={`No encontramos pacientes que coincidan con "${search.trim()}". Probá con otro término.`}
          tone="neutral"
        />
      ) : view === 'cards' ? (
        <Stack spacing={2}>
          {filtered.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              expanded={expandedPatientId === patient.id}
              onToggle={() =>
                setExpandedPatientId((current) =>
                  current === patient.id ? null : patient.id
                )
              }
            />
          ))}
        </Stack>
      ) : (
        <PatientListTable patients={filtered} />
      )}

      {isSearching && filtered.length > 0 && !loading && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Mostrando {filtered.length} de {patients.length} pacientes
        </Typography>
      )}
    </Box>
  );
}
