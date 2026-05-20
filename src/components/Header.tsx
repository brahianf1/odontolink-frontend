import { useEffect, useState, type MouseEvent } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Button,
  Box,
  IconButton,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { originFromEvent, withViewTransition } from '../theme/viewTransition';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const isHome = location.pathname === '/';

  // When on a route that opts into the transparent overlay (home), the Header
  // tracks the [data-hero-section] element via IntersectionObserver: it stays
  // transparent while the Hero is in view, becomes solid the moment the Hero
  // is fully scrolled past. Robust against viewport size and Hero variant.
  const [heroInView, setHeroInView] = useState(isHome);

  useEffect(() => {
    if (!isHome) {
      setHeroInView(false);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let observedEl: Element | null = null;
    let rafId: number | null = null;

    const attach = () => {
      observedEl = document.querySelector('[data-hero-section]');
      if (!observedEl) {
        // Hero may not have mounted yet on the first paint after navigation —
        // try again on the next frame instead of falling back to a fixed
        // scroll threshold.
        rafId = window.requestAnimationFrame(attach);
        return;
      }
      observer = new IntersectionObserver(
        (entries) => {
          setHeroInView(entries[0].isIntersecting);
        },
        { threshold: 0 },
      );
      observer.observe(observedEl);
    };

    attach();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (observer && observedEl) observer.unobserve(observedEl);
      observer?.disconnect();
    };
  }, [isHome, location.pathname]);

  const isTransparent = isHome && heroInView;

  return (
    <AppBar
      // On home, fixed so the Hero starts at viewport y=0 with no flow offset.
      // Elsewhere, sticky behaves identically but participates in flow so
      // following content is not hidden behind it (no spacer required).
      position={isHome ? 'fixed' : 'sticky'}
      elevation={0}
      sx={{
        backgroundColor: isTransparent ? 'transparent' : theme.palette.surfaces.container,
        borderBottom: isTransparent
          ? '1px solid transparent'
          : `1px solid ${theme.palette.outlineVariant}`,
        color: theme.palette.text.primary,
        backdropFilter: 'none',
        transition: `background-color ${theme.motion.duration.medium2}ms ${theme.motion.easing.standard}, border-color ${theme.motion.duration.medium2}ms ${theme.motion.easing.standard}`,
      }}
    >
      <Container maxWidth="xl" sx={{ width: '100%' }}>
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            width: '100%',
            minHeight: { xs: 56, sm: 64 },
          }}
        >
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
            <LocalHospitalIcon sx={{ fontSize: { xs: 26, sm: 30 }, mr: 1 }} />
            <Box
              sx={{
                fontSize: isMobile ? '1.125rem' : '1.375rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                letterSpacing: '-0.01em',
              }}
            >
              OdontoLink
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              flexShrink: 0,
            }}
          >
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
                <Box
                  sx={{
                    display: isMobile ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '0.875rem',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {user?.firstName} {user?.lastName}
                  </Box>
                </Box>
                <Button onClick={logout} variant="outlined" color="primary" size="small">
                  Cerrar Sesión
                </Button>
              </>
            )}

            <IconButton
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                withViewTransition(toggleTheme, originFromEvent(event));
              }}
              aria-label="toggle theme"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.text.primary, 0.06),
                  color: 'text.primary',
                },
              }}
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
