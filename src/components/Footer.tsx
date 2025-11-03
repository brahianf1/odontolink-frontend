import { Box, Container, Typography, Link, useTheme, IconButton, Divider, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#0D7C66',
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : '#FFFFFF',
        py: 6,
        mt: 'auto',
        width: '100%',
      }}
    >
      <Container maxWidth="xl" sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1.5fr 1.5fr',
            },
            gap: 4,
            width: '100%',
          }}
        >
          {/* Brand Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospitalIcon sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight={700}>
                OdontoLink
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Sistema integral de gestión para clínicas odontológicas universitarias.
              Conectando pacientes, practicantes y supervisores.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'inherit' }} aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'inherit' }} aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'inherit' }} aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'inherit' }} aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Enlaces Rápidos
            </Typography>
            <Stack spacing={1}>
              <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Inicio
              </Link>
              <Link component={RouterLink} to="/register" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Registrarse
              </Link>
              <Link component={RouterLink} to="/login" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Iniciar Sesión
              </Link>
            </Stack>
          </Box>

          {/* For Patients */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Para Pacientes
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • Consulta tratamientos disponibles
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • Reserva tu turno online
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • Seguimiento de tu historial
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                • Comunicación directa
              </Typography>
            </Stack>
          </Box>

          {/* Contact */}
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Contacto
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Email: soporte@odontolink.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Universidad Tecnológica Nacional
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Facultad Regional Tucumán
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} OdontoLink. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
            Desarrollado por Grupo 6 - Proyecto Final ISI
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
