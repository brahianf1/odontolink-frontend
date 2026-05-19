import { Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

/**
 * Live preview of the currently active theme + font pair. Uses real MUI
 * components so the user sees exactly what changing settings does to the
 * actual app. Re-renders automatically when the theme changes.
 */
export const AppearancePreview = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.surfaces.containerLow,
        border: `1px solid ${theme.palette.outlineVariant}`,
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={3}>
        {/* Typography sample */}
        <Stack spacing={1.5}>
          <Typography variant="labelLarge" sx={{ color: 'primary.main', letterSpacing: '0.1em' }}>
            VISTA PREVIA
          </Typography>
          <Typography variant="displaySmall" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>
            Diseño que comunica confianza.
          </Typography>
          <Typography variant="bodyLarge" color="text.secondary" sx={{ maxWidth: 640 }}>
            Plataforma académica para la Facultad de Odontología de la Universidad
            Nacional de Tucumán. Atención supervisada que conecta pacientes,
            practicantes y docentes.
          </Typography>
        </Stack>

        {/* Buttons + chip row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="flex-start">
          <Button variant="contained" color="primary" startIcon={<LocalHospitalIcon />}>
            Botón primario
          </Button>
          <Button variant="outlined" color="primary">
            Secundario
          </Button>
          <Button color="primary">Texto</Button>
          <Chip
            label="Supervisado"
            size="small"
            icon={<CheckCircleOutlineIcon />}
            sx={{
              backgroundColor: theme.palette.tertiary.container,
              color: theme.palette.tertiary.onContainer,
              '& .MuiChip-icon': { color: theme.palette.tertiary.onContainer },
            }}
          />
        </Stack>

        {/* Card sample */}
        <Box
          sx={{
            backgroundColor: theme.palette.surfaces.containerHigh,
            border: `1px solid ${theme.palette.outlineVariant}`,
            p: 2,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="labelSmall" color="text.secondary">
              PRÓXIMO TURNO
            </Typography>
            <Typography variant="titleLarge" sx={{ fontWeight: 600 }}>
              Limpieza dental — 14:30
            </Typography>
            <Typography variant="bodyMedium" color="text.secondary">
              Practicante: Lucas Ortiz · Docente supervisor: Dra. M. Pérez
            </Typography>
            <Typography
              variant="bodySmall"
              sx={{ fontFamily: theme.typography.fontFamilyMono, color: 'text.secondary', mt: 0.5 }}
            >
              odontolink.unt.edu.ar/mi-turno/0421
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default AppearancePreview;
