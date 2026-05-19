import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
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

type ScatterPos = {
  initialX: number;
  initialY: number;
  finalX: number;
  finalY: number;
  rotateFrom: number;
  rotateTo: number;
};

const ScatterCard = ({
  progress,
  position,
  children,
}: {
  progress: MotionValue<number>;
  position: ScatterPos;
  children: ReactNode;
}) => {
  const x = useTransform(progress, [0, 0.5], [position.initialX, position.finalX], { clamp: true });
  const y = useTransform(progress, [0, 0.5], [position.initialY, position.finalY], { clamp: true });
  const rotate = useTransform(
    progress,
    [0, 0.5],
    [position.rotateFrom, position.rotateTo],
    { clamp: true },
  );
  const opacity = useTransform(progress, [0, 0.25, 0.45], [1, 0.6, 0], { clamp: true });
  return (
    <motion.div
      style={{
        position: 'absolute',
        x,
        y,
        rotate,
        opacity,
        pointerEvents: 'none',
      }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
};

export const HeroScatterPile = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const prefersReducedMotion = useReducedMotion();

  if (!isMdUp || prefersReducedMotion) {
    return <HeroStatic />;
  }

  return <HeroScatterDesktop />;
};

const HeroScatterDesktop = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: rawProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  // Defensive clamp at the source: even if useScroll emits values outside
  // [0, 1] during fast scroll or layout updates, downstream transforms are
  // guaranteed to receive a value inside the intended range.
  const progress = useTransform(rawProgress, [0, 1], [0, 1], { clamp: true });

  const pileOpacity = useTransform(progress, [0, 0.3, 0.45], [1, 0.5, 0], { clamp: true });
  const mockupOpacity = useTransform(progress, [0.3, 0.55], [0, 1], { clamp: true });
  const mockupScale = useTransform(progress, [0.3, 0.55], [0.92, 1], { clamp: true });

  // DOM-level guarantee: when the scatter phase is over the chaos cards are
  // unmounted entirely so they cannot reappear under any circumstance.
  // Hysteresis (mount < 0.45, unmount > 0.55) avoids flickering at the edge.
  const [showChaos, setShowChaos] = useState(true);
  useMotionValueEvent(progress, 'change', (latest) => {
    setShowChaos((prev) => {
      if (latest > 0.55) return false;
      if (latest < 0.45) return true;
      return prev;
    });
  });

  const cards: { node: ReactNode; pos: ScatterPos }[] = [
    {
      node: <FacebookPostCard rotation={-6} width={280} />,
      pos: { initialX: -40, initialY: -10, finalX: -200, finalY: -260, rotateFrom: -6, rotateTo: -20 },
    },
    {
      node: <WhatsAppChatCard rotation={5} width={240} />,
      pos: { initialX: 30, initialY: -30, finalX: 220, finalY: -240, rotateFrom: 5, rotateTo: 22 },
    },
    {
      node: <PaperFlyerCard rotation={-10} width={210} />,
      pos: { initialX: -20, initialY: 40, finalX: -200, finalY: 260, rotateFrom: -10, rotateTo: -30 },
    },
    {
      node: <BulletinPostCard rotation={4} width={220} />,
      pos: { initialX: 50, initialY: 60, finalX: 210, finalY: 270, rotateFrom: 4, rotateTo: 28 },
    },
  ];

  return (
    <Box
      ref={ref}
      component="section"
      data-hero-section
      sx={{
        position: 'relative',
        height: '200vh',
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
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
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <HeroHeading align="left" />
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  height: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AnimatePresence>
                  {showChaos && (
                    <motion.div
                      key="pile"
                      style={{
                        opacity: pileOpacity,
                        position: 'absolute',
                        inset: 0,
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
                          pointerEvents: 'none',
                        }}
                      >
                        {cards.map(({ node, pos }, i) => (
                          <ScatterCard key={i} progress={progress} position={pos}>
                            {node}
                          </ScatterCard>
                        ))}
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  style={{
                    opacity: mockupOpacity,
                    scale: mockupScale,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <AppMockup width={460} />
                </motion.div>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'text.secondary',
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              opacity: 0.6,
            }}
          >
            Desliza para ver la transformación ↓
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroScatterPile;
