import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, useTheme, Divider, Avatar } from '@mui/material';
import { Dashboard, CalendarMonth, LocalHospital, People, Star, Chat, MedicalServices, Logout } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 280;

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuthStore();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/practitioner/dashboard' },
    { text: 'Mis Turnos', icon: <CalendarMonth />, path: '/practitioner/appointments' },
    { text: 'Atenciones', icon: <LocalHospital />, path: '/practitioner/attentions' },
    { text: 'Tratamientos', icon: <MedicalServices />, path: '/practitioner/treatments' },
    { text: 'Pacientes', icon: <People />, path: '/practitioner/patients' },
    { text: 'Feedback', icon: <Star />, path: '/practitioner/feedback' },
    { text: 'Chat', icon: <Chat />, path: '/practitioner/chat' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onMobileClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          px: 3,
          py: 2,
          backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'primary.main',
          color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'background.paper',
              color: theme.palette.mode === 'dark' ? 'primary.contrastText' : 'primary.main',
            }}
          >
            {user?.firstName?.charAt(0) || 'P'}
          </Avatar>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="subtitle1" noWrap fontWeight={600}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" noWrap>
              Practicante
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ flexGrow: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ px: 2, mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'action.selected' : 'primary.main',
                  color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'action.hover' : 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List sx={{ pb: 2 }}>
        <ListItem disablePadding sx={{ px: 2 }}>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon>
              <Logout color="error" />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
}
