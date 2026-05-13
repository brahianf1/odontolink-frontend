import { useState, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import AppBar from '../components/layout/AppBar';
import Sidebar from '../components/layout/Sidebar';

const DRAWER_WIDTH = 260;

// Mapeo de rutas a títulos de página
const pageTitles: Record<string, string> = {
  // Rutas de paciente
  '/patient/dashboard': 'Dashboard',
  '/patient/treatments': 'Tratamientos Disponibles',
  '/patient/appointments': 'Mis Turnos',
  '/patient/attentions': 'Mis Atenciones',
  '/patient/feedback': 'Feedback Recibido',
  '/patient/chat': 'Mensajes',
  '/patient/profile': 'Mi Perfil',
  
  // Rutas de practicante
  '/practitioner/dashboard': 'Dashboard',
  '/practitioner/appointments': 'Gestión de Turnos',
  '/practitioner/attentions': 'Atenciones',
  '/practitioner/treatments': 'Mis Tratamientos',
  '/practitioner/patients': 'Mis Pacientes',
  '/practitioner/feedback': 'Feedback Recibido',
  '/practitioner/chat': 'Mensajes',
  '/practitioner/profile': 'Mi Perfil',
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Obtener el título de la página actual
  const pageTitle = useMemo(() => {
    return pageTitles[location.pathname] || 'OdontoLink';
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          overflow: 'auto',
        }}
      >
        {/* Top AppBar */}
        <AppBar
          drawerWidth={DRAWER_WIDTH}
          onMenuClick={handleDrawerToggle}
          title={pageTitle}
        />

        {/* Page Content Container */}
        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            pt: { xs: 10, sm: 11 }, // Top padding to account for fixed AppBar
            pb: 4,
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
