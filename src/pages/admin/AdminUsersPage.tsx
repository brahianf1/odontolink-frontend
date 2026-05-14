import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  Menu,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Skeleton,
  Paper,
  Snackbar,
  ListItemIcon,
  ListItemText,
  TablePagination,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  PersonOff as PersonOffIcon,
  RestartAlt as RestartAltIcon,
  PersonAddAlt1 as PersonAddIcon,
  SchoolOutlined as SchoolIcon,
  AssignmentInd as SupervisorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAdminUsers } from '../../features/admin/hooks/useAdminUsers';
import UserFilters from '../../features/admin/components/UserFilters';
import UserRoleChip from '../../features/admin/components/UserRoleChip';
import UserStatusChip from '../../features/admin/components/UserStatusChip';
import ConfirmDialog from '../../features/admin/components/ConfirmDialog';
import UserFormDialog, {
  type UserFormMode,
} from '../../features/admin/components/UserFormDialog';
import {
  deactivateUser,
  reactivateUser,
} from '../../services/api/adminService';
import type { AdminUserDTO } from '../../types/admin.types';

interface FeedbackState {
  open: boolean;
  severity: 'success' | 'error' | 'info';
  message: string;
}

const INITIAL_FEEDBACK: FeedbackState = { open: false, severity: 'success', message: '' };

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  try {
    return format(parseISO(value), "dd 'de' MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

export default function AdminUsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    users,
    loading,
    error,
    search,
    role,
    status,
    setSearch,
    setRole,
    setStatus,
    refresh,
    replaceUser,
    prependUser,
  } = useAdminUsers();

  const [createAnchor, setCreateAnchor] = useState<HTMLElement | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<UserFormMode>('create-patient');
  const [editingUser, setEditingUser] = useState<AdminUserDTO | null>(null);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    user: AdminUserDTO | null;
    action: 'deactivate' | 'reactivate';
  }>({ open: false, user: null, action: 'deactivate' });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(INITIAL_FEEDBACK);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return users.slice(start, start + rowsPerPage);
  }, [users, page, rowsPerPage]);

  const handleOpenCreateMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCreateAnchor(event.currentTarget);
  };

  const handleCloseCreateMenu = () => setCreateAnchor(null);

  const handleStartCreate = (mode: UserFormMode) => {
    setEditingUser(null);
    setFormMode(mode);
    setFormOpen(true);
    handleCloseCreateMenu();
  };

  const handleStartEdit = (user: AdminUserDTO) => {
    setEditingUser(user);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleFormSuccess = (user: AdminUserDTO, mode: UserFormMode) => {
    setFormOpen(false);
    setEditingUser(null);
    if (mode === 'edit') {
      replaceUser(user);
      setFeedback({ open: true, severity: 'success', message: 'Perfil actualizado correctamente.' });
    } else {
      prependUser(user);
      setFeedback({
        open: true,
        severity: 'success',
        message: 'Usuario creado exitosamente.',
      });
    }
  };

  const openDeactivate = (user: AdminUserDTO) => {
    setConfirm({ open: true, user, action: 'deactivate' });
  };

  const openReactivate = (user: AdminUserDTO) => {
    setConfirm({ open: true, user, action: 'reactivate' });
  };

  const handleConfirmAction = async () => {
    if (!confirm.user) return;
    setConfirmLoading(true);
    try {
      const result =
        confirm.action === 'deactivate'
          ? await deactivateUser(confirm.user.id)
          : await reactivateUser(confirm.user.id);
      replaceUser(result);
      setFeedback({
        open: true,
        severity: 'success',
        message:
          confirm.action === 'deactivate'
            ? 'Usuario dado de baja correctamente.'
            : 'Usuario reactivado correctamente.',
      });
      setConfirm({ open: false, user: null, action: 'deactivate' });
    } catch (err) {
      const message =
        (err as { message?: string })?.message || 'No se pudo completar la operación.';
      setFeedback({ open: true, severity: 'error', message });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCloseFeedback = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setFeedback((prev) => ({ ...prev, open: false }));
  };

  const renderTableSkeleton = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            {['Usuario', 'Rol', 'Estado', 'Creado', 'Acciones'].map((heading) => (
              <TableCell key={heading}>{heading}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderEmpty = () => (
    <Card variant="outlined" sx={{ textAlign: 'center', py: 6 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No se encontraron usuarios
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ajusta los filtros o crea un nuevo usuario para comenzar.
        </Typography>
      </CardContent>
    </Card>
  );

  const renderDesktopTable = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'background.default' }}>
            <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>DNI</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Alta</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginated.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                    {(user.firstName?.[0] ?? '?').toUpperCase()}
                    {(user.lastName?.[0] ?? '').toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <UserRoleChip role={user.role} />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{user.dni || '—'}</Typography>
              </TableCell>
              <TableCell>
                <UserStatusChip active={user.active} />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(user.createdAt)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="Editar perfil">
                    <IconButton size="small" onClick={() => handleStartEdit(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {user.active ? (
                    <Tooltip title="Dar de baja">
                      <IconButton size="small" color="error" onClick={() => openDeactivate(user)}>
                        <PersonOffIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Reactivar">
                      <IconButton size="small" color="success" onClick={() => openReactivate(user)}>
                        <RestartAltIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileList = () => (
    <Stack spacing={1.5}>
      {paginated.map((user) => (
        <Card key={user.id} variant="outlined">
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main' }}>
                  {(user.firstName?.[0] ?? '?').toUpperCase()}
                  {(user.lastName?.[0] ?? '').toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={700} noWrap>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <UserStatusChip active={user.active} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <UserRoleChip role={user.role} />
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                DNI: {user.dni || '—'} · Alta: {formatDate(user.createdAt)}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon fontSize="small" />}
                onClick={() => handleStartEdit(user)}
                fullWidth
              >
                Editar
              </Button>
              {user.active ? (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<PersonOffIcon fontSize="small" />}
                  onClick={() => openDeactivate(user)}
                  fullWidth
                >
                  Baja
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<RestartAltIcon fontSize="small" />}
                  onClick={() => openReactivate(user)}
                  fullWidth
                >
                  Reactivar
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra el ciclo de vida de pacientes, practicantes y docentes.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refresh()}
            disabled={loading}
            sx={{ flex: { xs: 1, sm: 'unset' } }}
          >
            Refrescar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateMenu}
            sx={{ flex: { xs: 1, sm: 'unset' } }}
          >
            Nuevo Usuario
          </Button>
        </Stack>
        <Menu
          anchorEl={createAnchor}
          open={!!createAnchor}
          onClose={handleCloseCreateMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleStartCreate('create-patient')}>
            <ListItemIcon>
              <PersonAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Paciente" secondary="Datos médicos opcionales" />
          </MenuItem>
          <MenuItem onClick={() => handleStartCreate('create-practitioner')}>
            <ListItemIcon>
              <SchoolIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Practicante" secondary="Estudiante de odontología" />
          </MenuItem>
          <MenuItem onClick={() => handleStartCreate('create-supervisor')}>
            <ListItemIcon>
              <SupervisorIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Docente" secondary="Supervisor académico" />
          </MenuItem>
        </Menu>
      </Box>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <UserFilters
            search={search}
            role={role}
            status={status}
            onSearchChange={setSearch}
            onRoleChange={setRole}
            onStatusChange={setStatus}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => void refresh()}>
          {error}
        </Alert>
      )}

      {loading ? (
        renderTableSkeleton()
      ) : users.length === 0 ? (
        renderEmpty()
      ) : (
        <Box>
          {isMobile ? renderMobileList() : renderDesktopTable()}

          <TablePagination
            component="div"
            count={users.length}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Box>
      )}

      <UserFormDialog
        open={formOpen}
        mode={formMode}
        user={editingUser}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={confirm.open}
        title={confirm.action === 'deactivate' ? 'Dar de baja usuario' : 'Reactivar usuario'}
        message={
          confirm.action === 'deactivate'
            ? `¿Confirmas dar de baja a ${confirm.user?.firstName ?? ''} ${confirm.user?.lastName ?? ''}? El usuario perderá acceso al sistema.`
            : `¿Confirmas reactivar a ${confirm.user?.firstName ?? ''} ${confirm.user?.lastName ?? ''}? El usuario podrá volver a iniciar sesión.`
        }
        confirmLabel={confirm.action === 'deactivate' ? 'Dar de baja' : 'Reactivar'}
        confirmColor={confirm.action === 'deactivate' ? 'error' : 'success'}
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirm({ open: false, user: null, action: 'deactivate' })}
      />

      <Snackbar
        open={feedback.open}
        autoHideDuration={4500}
        onClose={handleCloseFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseFeedback}
          severity={feedback.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
