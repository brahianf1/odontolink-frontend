import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import HeroHeading from './HeroHeading';
import AppMockup from './AppMockup';
import RevealOnView from '../../../motion/RevealOnView';

/**
 * Static fallback used on mobile and when prefers-reduced-motion is on.
 *
 * No sticky pinning, no scroll-driven transforms — just a clean section
 * that flows naturally with the page. This avoids the overflow/clipping
 * issues sticky introduces when the content is taller than the viewport.
 */
export const HeroStatic = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      component="section"
      data-hero-section
      sx={{
        minHeight: { xs: 'auto', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        // Top padding accounts for the fixed AppBar overlapping the section.
        pt: { xs: 14, sm: 16, md: 18 },
        pb: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
        overflowX: 'clip',
      }}
    >
      <Container maxWidth="lg" sx={{ width: '100%' }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 5, md: 6 },
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
            alignItems: 'center',
          }}
        >
          <RevealOnView amount={0.1}>
            <HeroHeading align={isMdUp ? 'left' : 'center'} />
          </RevealOnView>
          <RevealOnView amount={0.1}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <AppMockup width={isMdUp ? 460 : 300} />
            </Box>
          </RevealOnView>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroStatic;
