import { Box, Stack, Typography, Chip, useTheme, alpha } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CircleIcon from '@mui/icons-material/Circle';

type AppMockupProps = {
  width?: number | string;
  scale?: number;
};

export const AppMockup = ({ width = 460, scale = 1 }: AppMockupProps) => {
  const theme = useTheme();
  const palette = theme.palette;
  return (
    <Box
      sx={{
        width,
        maxWidth: '100%',
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        backgroundColor: palette.surfaces.containerLowest,
        border: `1px solid ${palette.outlineVariant}`,
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        color: palette.text.primary,
      }}
    >
      {/* Browser-ish chrome */}
      <Box
        sx={{
          height: 32,
          backgroundColor: palette.surfaces.container,
          borderBottom: `1px solid ${palette.outlineVariant}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
        }}
      >
        <CircleIcon sx={{ fontSize: 10, color: '#FF5F57' }} />
        <CircleIcon sx={{ fontSize: 10, color: '#FEBC2E' }} />
        <CircleIcon sx={{ fontSize: 10, color: '#28C840' }} />
        <Box
          sx={{
            ml: 1,
            flex: 1,
            backgroundColor: palette.surfaces.containerHigh,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            px: 1,
          }}
        >
          <Typography sx={{ fontSize: 10, color: palette.text.secondary }}>
            odontolink.utnpf.site / mi-turno
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 2.5 } }}>
        {/* Logo */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <LocalHospitalIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="titleMedium" sx={{ fontWeight: 600 }}>
            OdontoLink
          </Typography>
          <Chip
            label="Supervisado"
            size="small"
            icon={<VerifiedUserIcon />}
            sx={{
              ml: 'auto',
              backgroundColor: palette.tertiary.container,
              color: palette.tertiary.onContainer,
              '& .MuiChip-icon': { color: palette.tertiary.onContainer },
            }}
          />
        </Stack>

        {/* Appointment card */}
        <Box
          sx={{
            border: `1px solid ${palette.outlineVariant}`,
            backgroundColor: palette.surfaces.containerLow,
            p: 2,
            mb: 1.5,
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 44,
                height: 44,
                backgroundColor: palette.primary.container,
                color: palette.primary.onContainer,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarTodayIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="labelSmall" sx={{ color: 'text.secondary' }}>
                Próximo turno
              </Typography>
              <Typography variant="titleMedium" sx={{ fontWeight: 600 }}>
                Limpieza dental — 14:30
              </Typography>
              <Typography variant="bodySmall" sx={{ color: 'text.secondary' }}>
                Practicante: Lucas Ortiz · 4° año
              </Typography>
              <Typography variant="bodySmall" sx={{ color: 'text.secondary' }}>
                Docente supervisor: Dra. M. Pérez
              </Typography>
            </Box>
            <Chip
              label="Confirmado"
              size="small"
              sx={{
                backgroundColor: alpha(palette.primary.main, 0.12),
                color: palette.primary.main,
                fontWeight: 600,
              }}
            />
          </Stack>
        </Box>

        {/* Chat preview */}
        <Box
          sx={{
            border: `1px solid ${palette.outlineVariant}`,
            backgroundColor: palette.surfaces.containerLow,
            p: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="labelLarge" sx={{ fontWeight: 600 }}>
              Chat interno seguro
            </Typography>
            <Box
              sx={{
                ml: 'auto',
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: palette.success.main,
              }}
            />
          </Stack>
          <Stack spacing={0.75}>
            <Box
              sx={{
                alignSelf: 'flex-start',
                backgroundColor: palette.surfaces.containerHigh,
                px: 1.25,
                py: 0.75,
                maxWidth: '85%',
              }}
            >
              <Typography variant="bodySmall">
                Hola Ana, te confirmo el turno del jueves a las 14:30. Cualquier consulta por acá.
              </Typography>
            </Box>
            <Box
              sx={{
                alignSelf: 'flex-end',
                backgroundColor: palette.primary.container,
                color: palette.primary.onContainer,
                px: 1.25,
                py: 0.75,
                maxWidth: '85%',
              }}
            >
              <Typography variant="bodySmall">¡Perfecto, gracias Lucas!</Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AppMockup;
