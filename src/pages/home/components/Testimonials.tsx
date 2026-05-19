import { Box, Stack, Typography, useTheme } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import SectionShell from './SectionShell';
import RevealOnView from '../motion/RevealOnView';
import { testimonials } from '../data/testimonials';

const colorFromInitials = (initials: string, theme: ReturnType<typeof useTheme>) => {
  const charSum = initials.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = [
    theme.palette.primary.container,
    theme.palette.secondary.container,
    theme.palette.tertiary.container,
  ];
  return palette[charSum % palette.length];
};

const fgFromInitials = (initials: string, theme: ReturnType<typeof useTheme>) => {
  const charSum = initials.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = [
    theme.palette.primary.onContainer,
    theme.palette.secondary.onContainer,
    theme.palette.tertiary.onContainer,
  ];
  return palette[charSum % palette.length];
};

export const Testimonials = () => {
  const theme = useTheme();
  return (
    <SectionShell
      id="testimonios"
      eyebrow="Voces reales"
      title="Lo que cambia cuando dejás de buscar pacientes en Facebook."
      subtitle="Historias de pacientes y estudiantes que ya pasaron del caos al orden académico."
      background="default"
      align="left"
    >
      <RevealOnView
        staggerChildren={0.15}
        amount={0.2}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
        }}
      >
        {testimonials.map((t) => (
          <Box
            key={t.name}
            sx={{
              p: { xs: 3, md: 4 },
              backgroundColor: theme.palette.surfaces.containerLow,
              border: `1px solid ${theme.palette.outlineVariant}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <FormatQuoteIcon
              sx={{ fontSize: 40, color: 'primary.main', opacity: 0.6, ml: -0.5 }}
            />
            <Typography
              variant="headlineSmall"
              sx={{
                fontWeight: 400,
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
              }}
            >
              {t.quote}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 'auto' }}>
              <Box
                aria-hidden
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: colorFromInitials(t.initials, theme),
                  color: fgFromInitials(t.initials, theme),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {t.initials}
              </Box>
              <Box>
                <Typography variant="labelLarge" sx={{ fontWeight: 600 }}>
                  {t.name}
                </Typography>
                <Typography variant="bodySmall" sx={{ color: 'text.secondary' }}>
                  {t.role} · {t.context}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </RevealOnView>
    </SectionShell>
  );
};

export default Testimonials;
