import { AppBar, Toolbar, Container, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: '100%',
        left: 0,
        right: 0,
      }}
    >
      <Container maxWidth="xl" sx={{ width: '100%' }}>
        <Toolbar 
          disableGutters 
          sx={{ 
            justifyContent: 'space-between', 
            py: 1,
            width: '100%',
            minHeight: { xs: 56, sm: 64 },
          }}
        >
          {/* Logo */}
          <Box 
            component={RouterLink} 
            to="/"
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: theme.palette.primary.main,
              flexShrink: 0,
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: { xs: 28, sm: 32 }, mr: 1 }} />
            <Box
              sx={{
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 700,
                color: theme.palette.text.primary,
              }}
            >
              OdontoLink
            </Box>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexShrink: 0 }}>
            {!isAuthenticated ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{ display: isMobile ? 'none' : 'inline-flex' }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  component={RouterLink}
                  to="/register/patient"
                  variant="contained"
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                >
                  Registrarse
                </Button>
              </>
            ) : (
              <>
                <Box sx={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                    {user?.firstName} {user?.lastName}
                  </Box>
                </Box>
                <Button
                  onClick={logout}
                  variant="outlined"
                  color="primary"
                  size="small"
                >
                  Cerrar Sesión
                </Button>
              </>
            )}
            
            {/* Theme Toggle */}
            <IconButton 
              onClick={toggleTheme} 
              color="inherit"
              aria-label="toggle theme"
              size={isMobile ? 'small' : 'medium'}
            >
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
