import { Box, Container, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

type SectionShellProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  background?: 'default' | 'container' | 'containerHigh';
  py?: { xs?: number; md?: number };
  maxWidth?: 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
  align?: 'left' | 'center';
};

const bgFor = (theme: Theme, key: SectionShellProps['background']) => {
  switch (key) {
    case 'container':
      return theme.palette.surfaces.container;
    case 'containerHigh':
      return theme.palette.surfaces.containerHigh;
    default:
      return theme.palette.background.default;
  }
};

export const SectionShell = ({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  background = 'default',
  py = { xs: 8, md: 14 },
  maxWidth = 'lg',
  sx,
  align = 'left',
}: SectionShellProps) => {
  const theme = useTheme();
  return (
    <Box
      id={id}
      component="section"
      sx={{
        backgroundColor: bgFor(theme, background),
        color: 'text.primary',
        py,
        width: '100%',
        ...sx,
      }}
    >
      <Container maxWidth={maxWidth || false}>
        {(eyebrow || title || subtitle) && (
          <Box
            sx={{
              mb: { xs: 5, md: 8 },
              textAlign: align,
              maxWidth: align === 'center' ? 760 : 'unset',
              mx: align === 'center' ? 'auto' : 0,
            }}
          >
            {eyebrow && (
              <Typography
                variant="labelLarge"
                sx={{
                  display: 'inline-block',
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mb: 1.5,
                  fontWeight: 600,
                }}
              >
                {eyebrow}
              </Typography>
            )}
            {title && (
              <Typography
                variant="displaySmall"
                component="h2"
                sx={{ mb: subtitle ? 2 : 0, letterSpacing: '-0.02em' }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="bodyLarge"
                sx={{ color: 'text.secondary', maxWidth: 720 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        {children}
      </Container>
    </Box>
  );
};

export default SectionShell;
