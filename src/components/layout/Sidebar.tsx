import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useTheme,
  alpha,
  Chip,
  // Avatar, // Temporarily unused - User info section is hidden
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MedicalServices as TreatmentsIcon,
  EventNote as AppointmentsIcon,
  AssignmentTurnedIn as AttentionsIcon,
  People as PatientsIcon,
  StarBorder as FeedbackIcon,
  ChatBubbleOutline as ChatIcon,
  LocalHospital as LocalHospitalIcon,
  AccountCircle as ProfileIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  ManageAccounts as ManageAccountsIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: number;
  description?: string;
}

interface MenuSection {
  title?: string;
  items: NavItem[];
}

export default function Sidebar({ drawerWidth, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuthStore();

  // Temporarily unused - User info section is hidden
  // const getRoleDisplayName = (role?: string): string => {
  //   if (!role) return '';
  //   const normalizedRole = role.toUpperCase();
  //   switch (normalizedRole) {
  //     case 'PATIENT':
  //       return 'Paciente';
  //     case 'PRACTITIONER':
  //       return 'Practicante';
  //     case 'SUPERVISOR':
  //     case 'DOCENTE':
  //       return 'Docente';
  //     case 'ADMINISTRATOR':
  //     case 'ADMIN':
  //       return 'Administrador';
  //     default:
  //       return role;
  //   }
  // };

  const getMenuSections = (): MenuSection[] => {
    if (!user || !user.role) {
      return [];
    }
    
    // Normalize role: remove ROLE_ prefix if exists and convert to lowercase
    const role = user.role.replace('ROLE_', '').toLowerCase();

    if (role === 'patient') {
      return [
        {
          title: 'Principal',
          items: [
            { 
              text: 'Dashboard', 
              icon: <DashboardIcon />, 
              path: '/patient/dashboard',
              description: 'Panel principal'
            },
          ],
        },
        {
          title: 'Gestión',
          items: [
            { 
              text: 'Tratamientos', 
              icon: <TreatmentsIcon />, 
              path: '/patient/treatments',
              description: 'Buscar tratamientos'
            },
            { 
              text: 'Mis Turnos', 
              icon: <AppointmentsIcon />, 
              path: '/patient/appointments',
              description: 'Ver mis citas'
            },
            { 
              text: 'Mis Atenciones', 
              icon: <AttentionsIcon />, 
              path: '/patient/attentions',
              description: 'Historial clínico'
            },
          ],
        },
        {
          title: 'Comunicación',
          items: [
            { 
              text: 'Feedback Recibido', 
              icon: <FeedbackIcon />, 
              path: '/patient/feedback',
              description: 'Ver el feedback recibido'
            },
            { 
              text: 'Mensajes', 
              icon: <ChatIcon />, 
              path: '/patient/chat',
              description: 'Chat con practicantes'
            },
          ],
        },
        {
          items: [
            { 
              text: 'Mi Perfil', 
              icon: <ProfileIcon />, 
              path: '/patient/profile',
              description: 'Configuración'
            },
          ],
        },
      ];
    }

    if (role === 'practitioner') {
      return [
        {
          title: 'Principal',
          items: [
            { 
              text: 'Dashboard', 
              icon: <DashboardIcon />, 
              path: '/practitioner/dashboard',
              description: 'Panel principal'
            },
          ],
        },
        {
          title: 'Gestión de Pacientes',
          items: [
            { 
              text: 'Turnos', 
              icon: <AppointmentsIcon />, 
              path: '/practitioner/appointments',
              description: 'Gestionar citas'
            },
            { 
              text: 'Atenciones', 
              icon: <AttentionsIcon />, 
              path: '/practitioner/attentions',
              description: 'Casos clínicos'
            },
            { 
              text: 'Pacientes', 
              icon: <PatientsIcon />, 
              path: '/practitioner/patients',
              description: 'Mis pacientes'
            },
          ],
        },
        {
          title: 'Servicios',
          items: [
            { 
              text: 'Tratamientos', 
              icon: <TreatmentsIcon />, 
              path: '/practitioner/treatments',
              description: 'Mi catálogo'
            },
            { 
              text: 'Feedback', 
              icon: <FeedbackIcon />, 
              path: '/practitioner/feedback',
              description: 'Calificaciones'
            },
          ],
        },
        {
          title: 'Comunicación',
          items: [
            { 
              text: 'Mensajes', 
              icon: <ChatIcon />, 
              path: '/practitioner/chat',
              description: 'Chat con pacientes'
            },
          ],
        },
        {
          items: [
            { 
              text: 'Mi Perfil', 
              icon: <ProfileIcon />, 
              path: '/practitioner/profile',
              description: 'Configuración'
            },
          ],
        },
      ];
    }

    if (role === 'supervisor' || role === 'docente') {
      return [
        {
          title: 'Principal',
          items: [
            { 
              text: 'Dashboard', 
              icon: <DashboardIcon />, 
              path: '/supervisor/dashboard',
              description: 'Panel principal'
            },
          ],
        },
        {
          title: 'Supervisión',
          items: [
            { 
              text: 'Practicantes', 
              icon: <SchoolIcon />, 
              path: '/supervisor/practitioners',
              description: 'Ver practicantes'
            },
            { 
              text: 'Feedback', 
              icon: <FeedbackIcon />, 
              path: '/supervisor/feedback',
              description: 'Calificaciones'
            },
          ],
        },
        {
          items: [
            { 
              text: 'Mi Perfil', 
              icon: <ProfileIcon />, 
              path: '/supervisor/profile',
              description: 'Configuración'
            },
          ],
        },
      ];
    }

    if (role === 'administrator' || role === 'admin') {
      return [
        {
          title: 'Principal',
          items: [
            { 
              text: 'Dashboard', 
              icon: <DashboardIcon />, 
              path: '/admin/dashboard',
              description: 'Panel principal'
            },
          ],
        },
        {
          title: 'Administración',
          items: [
            {
              text: 'Usuarios',
              icon: <ManageAccountsIcon />,
              path: '/admin/users',
              description: 'Gestionar usuarios'
            },
            {
              text: 'Tratamientos',
              icon: <CategoryIcon />,
              path: '/admin/treatments',
              description: 'Catálogo maestro'
            },
            {
              text: 'Configuración',
              icon: <SettingsIcon />,
              path: '/admin/settings',
              description: 'Parámetros del sistema'
            },
          ],
        },
      ];
    }

    return [];
  };

  const menuSections = getMenuSections();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) {
      onMobileClose();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Logo/Brand Section */}
      <Toolbar
        sx={{
          minHeight: { xs: 64, sm: 70 },
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <LocalHospitalIcon
          sx={{
            fontSize: 32,
            color: 'primary.main',
          }}
        />
        <Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: '1.3rem',
              lineHeight: 1,
            }}
          >
            OdontoLink
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
            }}
          >
            Sistema de Gestión
          </Typography>
        </Box>
      </Toolbar>

      <Divider />

      {/* User Info Section - Temporarily Hidden */}
      {/* <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                color: 'text.primary',
                fontSize: '0.875rem',
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                display: 'block',
              }}
            >
              {getRoleDisplayName(user?.role)}
            </Typography>
          </Box>
        </Box>
      </Box> */}

      {/* Navigation Menu */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 1.5,
          // Custom Scrollbar Styling
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
            borderRadius: '10px',
            margin: '8px 0',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            borderRadius: '10px',
            border: '2px solid transparent',
            backgroundClip: 'content-box',
            transition: 'background-color 0.3s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.35),
            },
          },
          // Firefox scrollbar
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.2)} transparent`,
        }}
      >
        {menuSections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {section.title && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1.5,
                  display: 'block',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {section.title}
              </Typography>
            )}
            <List sx={{ px: 2, py: 0 }}>
              {section.items.map((item) => {
                const active = isActive(item.path);
                
                return (
                  <ListItem
                    key={item.path}
                    disablePadding
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={active}
                      sx={{
                        position: 'relative',
                        py: 1.5,
                        px: 2,
                        minHeight: 56,
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: active
                          ? alpha(theme.palette.primary.main, 0.08)
                          : 'transparent',
                        borderLeft: active 
                          ? `3px solid ${theme.palette.primary.main}`
                          : '3px solid transparent',
                        '&:hover': {
                          backgroundColor: active
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.action.hover, 0.04),
                          borderLeft: `3px solid ${
                            active 
                              ? theme.palette.primary.main 
                              : alpha(theme.palette.primary.main, 0.3)
                          }`,
                        },
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 44,
                          color: active ? 'primary.main' : 'text.secondary',
                          transition: 'color 0.2s',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        secondary={!active ? item.description : undefined}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                          fontWeight: active ? 600 : 500,
                          color: active ? 'primary.main' : 'text.primary',
                          lineHeight: 1.3,
                        }}
                        secondaryTypographyProps={{
                          fontSize: '0.7rem',
                          color: 'text.secondary',
                          lineHeight: 1.2,
                          sx: {
                            mt: 0.3,
                            display: active ? 'none' : 'block',
                          },
                        }}
                      />
                      {item.badge !== undefined && item.badge > 0 && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: 'error.main',
                            color: 'error.contrastText',
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          px: 3,
          py: 2,
          backgroundColor: alpha(theme.palette.background.default, 0.4),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            OdontoLink
          </Typography>
          <Chip
            label="v1.0.0"
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 600,
            }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.65rem',
            display: 'block',
            lineHeight: 1.4,
          }}
        >
          © 2025 UTN Facultad Regional Tucumán
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
      }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
