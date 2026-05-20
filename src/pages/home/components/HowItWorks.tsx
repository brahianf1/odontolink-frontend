import { Box, Stack, Typography, useTheme } from '@mui/material';
import SectionShell from './SectionShell';
import RevealOnView from '../motion/RevealOnView';
import { steps } from '../data/steps';

export const HowItWorks = () => {
  const theme = useTheme();
  return (
    <SectionShell
      id="como-funciona"
      eyebrow="Cómo funciona"
      title="Tres pasos. Sin grupos de Facebook."
      subtitle="Del registro a la primera atención supervisada. Todo dentro de la plataforma."
      background="container"
      align="center"
    >
      <Box sx={{ position: 'relative' }}>
        {/* Connecting line (desktop only) */}
        <Box
          sx={{
            position: 'absolute',
            top: 28,
            left: '12%',
            right: '12%',
            height: 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.container}, ${theme.palette.primary.main}, ${theme.palette.primary.container})`,
            display: { xs: 'none', md: 'block' },
            zIndex: 0,
          }}
        />
        <RevealOnView
          staggerChildren={0.18}
          amount={0.3}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {steps.map((step) => (
            <Stack key={step.number} spacing={2} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.surfaces.containerLow,
                  color: 'primary.main',
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <Typography variant="titleLarge" sx={{ fontWeight: 700 }}>
                  {step.number}
                </Typography>
              </Box>
              <Typography
                variant="headlineSmall"
                component="h3"
                sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="bodyMedium"
                sx={{ color: 'text.secondary', maxWidth: 320 }}
              >
                {step.description}
              </Typography>
            </Stack>
          ))}
        </RevealOnView>
      </Box>
    </SectionShell>
  );
};

export default HowItWorks;
