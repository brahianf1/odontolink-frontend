import { Box, Container, Typography, Link, useTheme, IconButton, Divider, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import PlaceIcon from '@mui/icons-material/Place';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.surfaces.container,
        color: theme.palette.text.primary,
        borderTop: `1px solid ${theme.palette.outlineVariant}`,
        py: { xs: 6, md: 8 },
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
          {/* Brand */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospitalIcon sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
              <Typography variant="titleLarge" fontWeight={600}>
                OdontoLink
              </Typography>
            </Box>
            <Typography
              variant="bodyMedium"
              sx={{ mb: 2, color: 'text.secondary', maxWidth: 360 }}
            >
              Plataforma académica de la Facultad de Odontología de la Universidad Nacional de
              Tucumán. Atención supervisada que conecta pacientes, practicantes y docentes.
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary' }}
                aria-label="Facebook"
                component="a"
                href="#"
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary' }}
                aria-label="Instagram"
                component="a"
                href="#"
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: 'text.secondary' }}
                aria-label="LinkedIn"
                component="a"
                href="#"
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Enlaces */}
          <Box>
            <Typography variant="labelLarge" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>
              Enlaces
            </Typography>
            <Stack spacing={1.25}>
              <Link
                component={RouterLink}
                to="/"
                color="text.secondary"
                underline="hover"
                variant="bodyMedium"
              >
                Inicio
              </Link>
              <Link
                component={RouterLink}
                to="/register/patient"
                color="text.secondary"
                underline="hover"
                variant="bodyMedium"
              >
                Registrarse como Paciente
              </Link>
              <Link
                component={RouterLink}
                to="/register/practitioner"
                color="text.secondary"
                underline="hover"
                variant="bodyMedium"
              >
                Registrarse como Estudiante
              </Link>
              <Link
                component={RouterLink}
                to="/login"
                color="text.secondary"
                underline="hover"
                variant="bodyMedium"
              >
                Iniciar sesión
              </Link>
            </Stack>
          </Box>

          {/* Para Pacientes */}
          <Box>
            <Typography variant="labelLarge" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>
              Para pacientes
            </Typography>
            <Stack spacing={1.25}>
              <Typography variant="bodyMedium" color="text.secondary">
                Atención gratuita y supervisada
              </Typography>
              <Typography variant="bodyMedium" color="text.secondary">
                Reserva turnos sin WhatsApp
              </Typography>
              <Typography variant="bodyMedium" color="text.secondary">
                Comunicación segura por chat
              </Typography>
              <Typography variant="bodyMedium" color="text.secondary">
                Historial de prácticas privadas
              </Typography>
            </Stack>
          </Box>

          {/* Contacto */}
          <Box>
            <Typography variant="labelLarge" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>
              Contacto
            </Typography>
            <Stack spacing={1.25}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <PlaceIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
                <Typography variant="bodyMedium" color="text.secondary">
                  Av. Benjamín Aráoz 800
                  <br />
                  San Miguel de Tucumán
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="bodyMedium" color="text.secondary">
                  contacto@odontolink.unt.edu.ar
                </Typography>
              </Box>
              <Typography variant="bodyMedium" color="text.secondary">
                Facultad de Odontología — UNT
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: theme.palette.outlineVariant }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'center' },
            gap: 1,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography variant="bodySmall" color="text.secondary">
            © {currentYear} OdontoLink — Proyecto institucional FOUNT-UNT.
          </Typography>
          <Typography variant="bodySmall" color="text.secondary">
            Universidad Nacional de Tucumán · Facultad de Odontología
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
