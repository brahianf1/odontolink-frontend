import { useState, useMemo } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import AppBar from '../components/layout/AppBar';
import Sidebar from '../components/layout/Sidebar';

const DRAWER_WIDTH = 260;

// Match base paths so that nested routes like /chat/:sessionId share the same title.
const dynamicPrefixes: Array<{ prefix: string; title: string }> = [
  { prefix: '/patient/chat', title: 'Mensajes' },
  { prefix: '/practitioner/chat', title: 'Mensajes' },
  { prefix: '/admin/ai-agent', title: 'Agente IA' },
];

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

  // Rutas de administrador
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Gestión de Usuarios',
  '/admin/treatments': 'Catálogo de Tratamientos',
  '/admin/settings': 'Configuración Institucional',
  '/admin/appearance': 'Apariencia',

  // Rutas de supervisor (docente)
  '/supervisor/dashboard': 'Dashboard',
  '/supervisor/practitioners': 'Practicantes a Cargo',
  '/supervisor/feedback': 'Panel de Feedback',
  '/supervisor/profile': 'Mi Perfil',
};

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Obtener el título de la página actual
  const pageTitle = useMemo(() => {
    const exact = pageTitles[location.pathname];
    if (exact) return exact;
    const dynamic = dynamicPrefixes.find((p) =>
      location.pathname.startsWith(p.prefix)
    );
    return dynamic?.title || 'OdontoLink';
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
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
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
          overflow: 'hidden',
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
            minHeight: 0,
            overflow: 'auto',
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
