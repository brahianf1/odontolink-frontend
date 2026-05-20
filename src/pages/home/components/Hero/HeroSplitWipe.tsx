import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useRef, useState } from 'react';
import {
  BulletinPostCard,
  FacebookPostCard,
  PaperFlyerCard,
  WhatsAppChatCard,
} from './shared/ChaosAssets';
import AppMockup from './shared/AppMockup';
import HeroHeading from './shared/HeroHeading';
import HeroStatic from './shared/HeroStatic';

export const HeroSplitWipe = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const prefersReducedMotion = useReducedMotion();

  if (!isMdUp || prefersReducedMotion) {
    return <HeroStatic />;
  }

  return <HeroSplitDesktop />;
};

const HeroSplitDesktop = () => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(rawProgress, [0, 1], [0, 1], { clamp: true });

  // Wipe completes by progress 0.7 — remaining scroll holds the "order" side.
  const chaosClipPath = useTransform(
    progress,
    [0, 0.7],
    ['inset(0 0% 0 0)', 'inset(0 100% 0 0)'],
    { clamp: true },
  );
  const dividerPos = useTransform(progress, [0, 0.7], ['100%', '0%'], { clamp: true });

  const [showChaos, setShowChaos] = useState(true);
  useMotionValueEvent(progress, 'change', (latest) => {
    setShowChaos((prev) => {
      if (latest > 0.75) return false;
      if (latest < 0.65) return true;
      return prev;
    });
  });

  return (
    <Box
      ref={ref}
      component="section"
      data-hero-section
      sx={{
        position: 'relative',
        height: '180vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          {/* Order layer (back) */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'background.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 6,
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="labelLarge"
                sx={{ color: 'primary.main', mb: 2, letterSpacing: '0.2em' }}
              >
                AHORA — ODONTOLINK
              </Typography>
              <AppMockup width={440} />
            </Box>
          </Box>

          {/* Chaos layer (front, clipped) */}
          <AnimatePresence>
            {showChaos && (
              <motion.div
                key="chaos-layer"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: theme.palette.surfaces.container,
                  clipPath: chaosClipPath,
                }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 6,
                  }}
                >
                  <Box sx={{ textAlign: 'center', maxWidth: '90%' }}>
                    <Typography
                      variant="labelLarge"
                      sx={{ color: 'error.main', mb: 2, letterSpacing: '0.2em' }}
                    >
                      ANTES — CAOS INFORMAL
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 380,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box sx={{ position: 'absolute', transform: 'translate(-50%, -10%)' }}>
                        <FacebookPostCard rotation={-6} width={260} />
                      </Box>
                      <Box sx={{ position: 'absolute', transform: 'translate(40%, 20%)' }}>
                        <WhatsAppChatCard rotation={8} width={230} />
                      </Box>
                      <Box sx={{ position: 'absolute', transform: 'translate(-10%, 60%)' }}>
                        <PaperFlyerCard rotation={-10} width={190} />
                      </Box>
                      <Box sx={{ position: 'absolute', transform: 'translate(60%, -40%)' }}>
                        <BulletinPostCard rotation={5} width={210} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider line */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: dividerPos,
              width: 4,
              backgroundColor: theme.palette.primary.main,
              boxShadow: `0 0 24px ${theme.palette.primary.main}`,
              zIndex: 3,
            }}
          />
        </Box>

        {/* Headline strip */}
        <Box
          sx={{
            position: 'relative',
            backgroundColor: 'background.default',
            borderTop: `1px solid ${theme.palette.outlineVariant}`,
            py: 4,
            zIndex: 4,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <HeroHeading align="center" compact />
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSplitWipe;
