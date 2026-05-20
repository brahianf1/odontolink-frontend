import { Box, Container, GlobalStyles, useMediaQuery, useTheme } from '@mui/material';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import {
  BulletinPostCard,
  FacebookPostCard,
  PaperFlyerCard,
  WhatsAppChatCard,
} from './shared/ChaosAssets';
import AppMockup from './shared/AppMockup';
import HeroHeading from './shared/HeroHeading';
import HeroStatic from './shared/HeroStatic';

const MarqueeRow = ({
  children,
  duration = 40,
  reverse = false,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
}) => (
  <Box
    sx={{
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
      py: 1,
      maskImage:
        'linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)',
      WebkitMaskImage:
        'linear-gradient(90deg, transparent 0, #000 8%, #000 92%, transparent 100%)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        animation: `${reverse ? 'odl-marquee-reverse' : 'odl-marquee'} ${duration}s linear infinite`,
        flexShrink: 0,
      }}
    >
      {children}
      {children}
    </Box>
  </Box>
);

export const HeroMarqueeReveal = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const prefersReducedMotion = useReducedMotion();

  if (!isMdUp || prefersReducedMotion) {
    return <HeroStatic />;
  }

  return <HeroMarqueeDesktop />;
};

const HeroMarqueeDesktop = () => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(rawProgress, [0, 1], [0, 1], { clamp: true });

  const marqueeOpacity = useTransform(progress, [0, 0.55], [0.85, 0.05], { clamp: true });
  const mockupY = useTransform(progress, [0, 0.55], [40, 0], { clamp: true });
  const mockupOpacity = useTransform(progress, [0, 0.45], [0, 1], { clamp: true });

  const [showMarquee, setShowMarquee] = useState(true);
  useMotionValueEvent(progress, 'change', (latest) => {
    setShowMarquee((prev) => {
      if (latest > 0.65) return false;
      if (latest < 0.55) return true;
      return prev;
    });
  });

  const row1 = (
    <>
      <FacebookPostCard rotation={-3} />
      <WhatsAppChatCard rotation={4} />
      <PaperFlyerCard rotation={-8} />
      <BulletinPostCard rotation={2} />
    </>
  );
  const row2 = (
    <>
      <BulletinPostCard rotation={-4} />
      <PaperFlyerCard rotation={6} />
      <FacebookPostCard rotation={2} />
      <WhatsAppChatCard rotation={-6} />
    </>
  );
  const row3 = (
    <>
      <PaperFlyerCard rotation={5} />
      <WhatsAppChatCard rotation={-2} />
      <BulletinPostCard rotation={7} />
      <FacebookPostCard rotation={-5} />
    </>
  );

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes odl-marquee': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-50%)' },
          },
          '@keyframes odl-marquee-reverse': {
            from: { transform: 'translateX(-50%)' },
            to: { transform: 'translateX(0)' },
          },
        }}
      />
      <Box
        ref={ref}
        component="section"
        data-hero-section
        sx={{
          position: 'relative',
          height: '180vh',
          backgroundColor: 'background.default',
          overflowX: 'clip',
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence>
            {showMarquee && (
              <motion.div
                key="marquee"
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: marqueeOpacity,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 16,
                  pointerEvents: 'none',
                  filter: 'grayscale(0.2)',
                }}
                aria-hidden
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                <MarqueeRow duration={45}>{row1}</MarqueeRow>
                <MarqueeRow duration={55} reverse>
                  {row2}
                </MarqueeRow>
                <MarqueeRow duration={40}>{row3}</MarqueeRow>
              </motion.div>
            )}
          </AnimatePresence>

          <Container
            maxWidth="lg"
            sx={{
              position: 'relative',
              zIndex: 2,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.05fr 1fr',
                gap: 6,
                alignItems: 'center',
                width: '100%',
                backgroundColor: theme.palette.background.default,
                py: 4,
                px: 4,
                border: `1px solid ${theme.palette.outlineVariant}`,
              }}
            >
              <HeroHeading align="left" />
              <motion.div
                style={{
                  y: mockupY,
                  opacity: mockupOpacity,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <AppMockup width={420} />
              </motion.div>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default HeroMarqueeReveal;
