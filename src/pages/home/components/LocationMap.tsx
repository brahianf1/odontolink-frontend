import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsIcon from '@mui/icons-material/Directions';
import SectionShell from './SectionShell';
import RevealOnView from '../motion/RevealOnView';

const MAP_QUERY = 'Facultad de Odontología Universidad Nacional de Tucumán';
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  MAP_QUERY,
)}&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  MAP_QUERY,
)}`;

export const LocationMap = () => {
  const theme = useTheme();
  return (
    <SectionShell
      id="ubicacion"
      eyebrow="Dónde estamos"
      title="Visitanos en la FOUNT."
      subtitle="La Facultad de Odontología de la UNT está en el corazón de San Miguel de Tucumán. Vení, conocenos y empezá tu tratamiento supervisado."
      background="default"
      align="left"
    >
      <RevealOnView amount={0.15}>
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr' },
            gap: { xs: 3, lg: 0 },
          }}
        >
          {/* Map */}
          <Box
            sx={{
              position: 'relative',
              height: { xs: 320, sm: 420, md: 520 },
              border: `1px solid ${theme.palette.outlineVariant}`,
              overflow: 'hidden',
              backgroundColor: theme.palette.surfaces.containerLow,
            }}
          >
            <Box
              component="iframe"
              title="Mapa Facultad de Odontología UNT"
              src={MAP_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sx={{
                width: '100%',
                height: '100%',
                border: 0,
                filter: theme.palette.mode === 'dark' ? 'invert(0.9) hue-rotate(180deg)' : 'none',
              }}
            />
          </Box>

          {/* Info card */}
          <Box
            sx={{
              position: { xs: 'static', lg: 'absolute' },
              left: { lg: 32 },
              bottom: { lg: 32 },
              maxWidth: { lg: 420 },
              backgroundColor: theme.palette.surfaces.containerHighest,
              border: `1px solid ${theme.palette.outlineVariant}`,
              p: { xs: 3, md: 4 },
              boxShadow: theme.shadows[2],
              mt: { xs: 0, lg: 0 },
            }}
          >
            <Typography variant="titleLarge" sx={{ fontWeight: 600, mb: 2 }}>
              Facultad de Odontología — UNT
            </Typography>
            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <PlaceIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                <Box>
                  <Typography variant="labelLarge" sx={{ fontWeight: 600 }}>
                    Dirección
                  </Typography>
                  <Typography variant="bodyMedium" sx={{ color: 'text.secondary' }}>
                    Av. Benjamín Aráoz 800
                    <br />
                    San Miguel de Tucumán, Tucumán
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <ScheduleIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                <Box>
                  <Typography variant="labelLarge" sx={{ fontWeight: 600 }}>
                    Horarios
                  </Typography>
                  <Typography variant="bodyMedium" sx={{ color: 'text.secondary' }}>
                    Lunes a viernes — 8:00 a 18:00
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <PhoneIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                <Box>
                  <Typography variant="labelLarge" sx={{ fontWeight: 600 }}>
                    Teléfono
                  </Typography>
                  <Typography variant="bodyMedium" sx={{ color: 'text.secondary' }}>
                    +54 381 436-4093
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <EmailIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.25 }} />
                <Box>
                  <Typography variant="labelLarge" sx={{ fontWeight: 600 }}>
                    Email
                  </Typography>
                  <Typography variant="bodyMedium" sx={{ color: 'text.secondary' }}>
                    contacto@odontolink.unt.edu.ar
                  </Typography>
                </Box>
              </Stack>
            </Stack>
            <Button
              component="a"
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<DirectionsIcon />}
              sx={{ mt: 3, fontWeight: 600 }}
            >
              Cómo llegar
            </Button>
          </Box>
        </Box>
      </RevealOnView>
    </SectionShell>
  );
};

export default LocationMap;
