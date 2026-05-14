import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Skeleton,
  Alert,
  Button,
  Divider,
  LinearProgress,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ManageAccounts as ManageAccountsIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { listUsers } from '../../services/api/adminService';
import type { AdminUserDTO } from '../../types/admin.types';
import { useAuthStore } from '../../store/authStore';

interface KpiCardProps {
  label: string;
  value: number | string;
  context?: string;
  emphasized?: boolean;
  loading?: boolean;
}

const KpiCard = ({ label, value, context, emphasized = false, loading = false }: KpiCardProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        px: { xs: 2.5, md: 3 },
        py: { xs: 2.5, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'border-color 160ms ease',
        '&:hover': {
          borderColor: alpha(theme.palette.text.primary, 0.16),
        },
        '&::before': emphasized
          ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: theme.palette.primary.main,
            }
          : undefined,
      }}
    >
      <Typography
        variant="overline"
        sx={{
          color: 'text.secondary',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width={80} sx={{ fontSize: '2.5rem' }} />
      ) : (
        <Typography
          variant="h3"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            fontSize: { xs: '2rem', md: '2.25rem' },
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </Typography>
      )}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '0.8125rem',
          minHeight: '1.25rem',
        }}
      >
        {loading ? <Skeleton width={120} /> : context}
      </Typography>
    </Box>
  );
};

interface CompositionRow {
  label: string;
  value: number;
  share: number;
}

interface CompositionSectionProps {
  rows: CompositionRow[];
  activeCount: number;
  totalCount: number;
  loading: boolean;
}

const CompositionSection = ({
  rows,
  activeCount,
  totalCount,
  loading,
}: CompositionSectionProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        p: { xs: 2.5, md: 3.5 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em' }}>
          Composición
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
          Distribución por rol
        </Typography>
      </Box>

      <Stack spacing={2.5} sx={{ flex: 1 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Box key={index}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="rectangular" height={6} sx={{ mt: 1 }} />
              </Box>
            ))
          : rows.map((row) => (
              <Box key={row.label}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                  <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {row.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.25 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {row.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontVariantNumeric: 'tabular-nums',
                        minWidth: 36,
                        textAlign: 'right',
                      }}
                    >
                      {row.share.toFixed(0)}%
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={row.share}
                  sx={{
                    height: 6,
                    borderRadius: 0,
                    backgroundColor: alpha(theme.palette.text.primary, 0.06),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        row.value === 0
                          ? alpha(theme.palette.text.primary, 0.12)
                          : theme.palette.primary.main,
                    },
                  }}
                />
              </Box>
            ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Estado del padrón
        </Typography>
        {loading ? (
          <Skeleton width={140} />
        ) : (
          <Typography
            variant="body2"
            sx={{ color: 'text.primary', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
          >
            {activeCount} de {totalCount} activos
          </Typography>
        )}
      </Box>
    </Box>
  );
};

interface QuickActionRowProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  onClick: () => void;
}

const QuickActionRow = ({ title, description, icon, onClick }: QuickActionRowProps) => {
  const theme = useTheme();
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.75,
        cursor: 'pointer',
        outline: 'none',
        transition: 'background-color 120ms ease',
        '&:hover, &:focus-visible': {
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
        },
        '&:focus-visible': {
          outline: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
          outlineOffset: -2,
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.4, mt: 0.25 }}
        >
          {description}
        </Typography>
      </Box>
      <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
    </Box>
  );
};

const startOfCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

const calculateShare = (count: number, total: number): number => {
  if (total === 0) return 0;
  return (count / total) * 100;
};

const formatNewThisMonth = (count: number): string => {
  if (count === 0) return 'Sin altas este mes';
  if (count === 1) return '+1 alta este mes';
  return `+${count} altas este mes`;
};

const formatShareContext = (count: number, total: number): string => {
  if (total === 0) return 'Sin datos';
  const share = calculateShare(count, total);
  return `${share.toFixed(0)}% del total`;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'No se pudo cargar el resumen del sistema.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((item) => item.active).length;
    const patients = users.filter((item) => item.role === 'ROLE_PATIENT').length;
    const practitioners = users.filter((item) => item.role === 'ROLE_PRACTITIONER').length;
    const supervisors = users.filter((item) => item.role === 'ROLE_SUPERVISOR').length;
    const admins = users.filter((item) => item.role === 'ROLE_ADMIN').length;

    const monthStart = startOfCurrentMonth();
    const newThisMonth = users.filter((item) => {
      if (!item.createdAt) return false;
      const created = new Date(item.createdAt);
      return !Number.isNaN(created.getTime()) && created >= monthStart;
    }).length;

    return {
      total,
      active,
      patients,
      practitioners,
      supervisors,
      admins,
      newThisMonth,
    };
  }, [users]);

  const compositionRows: CompositionRow[] = useMemo(
    () => [
      {
        label: 'Pacientes',
        value: metrics.patients,
        share: calculateShare(metrics.patients, metrics.total),
      },
      {
        label: 'Practicantes',
        value: metrics.practitioners,
        share: calculateShare(metrics.practitioners, metrics.total),
      },
      {
        label: 'Docentes',
        value: metrics.supervisors,
        share: calculateShare(metrics.supervisors, metrics.total),
      },
      {
        label: 'Administradores',
        value: metrics.admins,
        share: calculateShare(metrics.admins, metrics.total),
      },
    ],
    [metrics]
  );

  const greeting = user?.firstName ? `Hola, ${user.firstName}` : 'Hola';

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
          >
            {greeting}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Resumen del sistema
          </Typography>
        </Box>
        <Button
          variant="text"
          color="inherit"
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={() => void loadUsers()}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary', backgroundColor: 'transparent' },
            px: 1,
          }}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 3, borderRadius: 0 }}
          action={
            <Button color="inherit" size="small" onClick={() => void loadUsers()}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Usuarios totales"
            value={metrics.total}
            context={formatNewThisMonth(metrics.newThisMonth)}
            emphasized
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Pacientes"
            value={metrics.patients}
            context={formatShareContext(metrics.patients, metrics.total)}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Practicantes"
            value={metrics.practitioners}
            context={formatShareContext(metrics.practitioners, metrics.total)}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            label="Docentes"
            value={metrics.supervisors}
            context={formatShareContext(metrics.supervisors, metrics.total)}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <CompositionSection
            rows={compositionRows}
            activeCount={metrics.active}
            totalCount={metrics.total}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, pt: { xs: 2.5, md: 3.5 }, pb: 2 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.08em' }}>
                Accesos
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                Operación
              </Typography>
            </Box>
            <Divider />
            <Box sx={{ py: 1 }}>
              <QuickActionRow
                title="Gestión de usuarios"
                description="Crear, editar y dar de baja cuentas"
                icon={<ManageAccountsIcon fontSize="small" />}
                onClick={() => navigate('/admin/users')}
              />
              <QuickActionRow
                title="Configuración institucional"
                description="Parámetros, horarios y políticas"
                icon={<SettingsIcon fontSize="small" />}
                onClick={() => navigate('/admin/settings')}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
