import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { motion, useReducedMotion } from 'framer-motion';
import { stagger, fadeUp } from '../../../motion/variants';

type HeroHeadingProps = {
  align?: 'left' | 'center';
  /**
   * Use a smaller display variant. Auto-derived from breakpoint when unset.
   */
  compact?: boolean;
};

export const HeroHeading = ({ align = 'left', compact }: HeroHeadingProps) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isCompact = compact ?? !isMdUp;
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = prefersReducedMotion ? undefined : stagger(0.08, 0.1);
  const itemVariants = prefersReducedMotion ? undefined : fadeUp;

  const displayVariant = isCompact
    ? isSmUp
      ? 'displaySmall'
      : 'headlineLarge'
    : 'displayLarge';

  return (
    <motion.div
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={containerVariants}
      style={{
        width: '100%',
        maxWidth: align === 'center' ? 760 : 640,
        marginInline: align === 'center' ? 'auto' : undefined,
      }}
    >
      <motion.div variants={itemVariants}>
        <Typography
          variant="labelLarge"
          sx={{
            display: 'inline-block',
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            mb: { xs: 1.5, md: 2 },
            textAlign: align,
            width: '100%',
          }}
        >
          Plataforma académica · FOUNT-UNT
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          variant={displayVariant}
          component="h1"
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'text.primary',
            mb: { xs: 2, md: 2.5 },
            textAlign: align,
            lineHeight: 1.1,
          }}
        >
          Del{' '}
          <Box
            component="span"
            sx={{
              color: 'error.main',
              textDecoration: 'line-through',
              textDecorationThickness: 2,
            }}
          >
            caos
          </Box>{' '}
          al{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            orden académico
          </Box>{' '}
          en odontología.
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Typography
          variant={isCompact ? 'bodyMedium' : 'bodyLarge'}
          sx={{
            color: 'text.secondary',
            mb: { xs: 3, md: 4 },
            maxWidth: 620,
            textAlign: align,
            mx: align === 'center' ? 'auto' : 0,
          }}
        >
          Pacientes y estudiantes de la Facultad de Odontología UNT se conectan en un solo lugar:
          turnos digitales, comunicación segura y supervisión docente real. Sin Facebook, sin
          carteles, sin WhatsApp.
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            component={RouterLink}
            to="/register/patient"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PersonIcon />}
            fullWidth={!isSmUp}
            sx={{
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 1.25, md: 1.5 },
              fontSize: { xs: '0.95rem', md: '1rem' },
              fontWeight: 600,
              boxShadow: 'none',
            }}
          >
            Soy Paciente
          </Button>
          <Button
            component={RouterLink}
            to="/register/practitioner"
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<SchoolIcon />}
            fullWidth={!isSmUp}
            sx={{
              px: { xs: 2.5, md: 3.5 },
              py: { xs: 1.25, md: 1.5 },
              fontSize: { xs: '0.95rem', md: '1rem' },
              fontWeight: 600,
              borderWidth: 1.5,
              '&:hover': { borderWidth: 1.5, backgroundColor: theme.palette.primary.container },
            }}
          >
            Soy Estudiante
          </Button>
        </Stack>
      </motion.div>
    </motion.div>
  );
};

export default HeroHeading;
