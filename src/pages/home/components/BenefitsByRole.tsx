import { Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import SectionShell from './SectionShell';
import RevealOnView from '../motion/RevealOnView';
import { benefits } from '../data/benefits';

export const BenefitsByRole = () => {
  const theme = useTheme();
  return (
    <SectionShell
      id="beneficios"
      eyebrow="Para cada rol"
      title="Tres formas distintas de usar OdontoLink, un solo ecosistema."
      subtitle="Pacientes, practicantes y docentes encuentran herramientas pensadas específicamente para su lugar en el proceso académico."
      align="left"
      background="default"
    >
      <RevealOnView
        staggerChildren={0.12}
        amount={0.15}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        {benefits.map((b) => {
          const Icon = b.icon;
          return (
            <Box
              key={b.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                p: { xs: 3, md: 4 },
                backgroundColor: theme.palette.surfaces.containerLow,
                border: `1px solid ${theme.palette.outlineVariant}`,
                height: '100%',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.primary.container,
                    color: theme.palette.primary.onContainer,
                  }}
                >
                  <Icon />
                </Box>
                <Chip
                  label={b.role}
                  size="small"
                  sx={{
                    backgroundColor: theme.palette.tertiary.container,
                    color: theme.palette.tertiary.onContainer,
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography variant="titleLarge" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {b.title}
              </Typography>
              <Typography variant="bodyMedium" sx={{ color: 'text.secondary' }}>
                {b.intro}
              </Typography>
              <Stack spacing={1.25} sx={{ mt: 'auto' }}>
                {b.points.map((p) => (
                  <Stack key={p} direction="row" spacing={1} alignItems="flex-start">
                    <CheckIcon sx={{ color: 'primary.main', fontSize: 18, mt: 0.25 }} />
                    <Typography variant="bodyMedium">{p}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Button
                component={RouterLink}
                to={b.ctaHref}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  mt: 1,
                  px: 0,
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              >
                {b.ctaLabel}
              </Button>
            </Box>
          );
        })}
      </RevealOnView>
    </SectionShell>
  );
};

export default BenefitsByRole;
