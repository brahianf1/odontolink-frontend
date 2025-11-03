import { AppBar, Toolbar, Typography, IconButton, Container, Box } from '@mui/material';
import { Brightness4, Brightness7, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';

export default function AuthHeader() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeStore();

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'transparent', 
        color: 'text.primary',
        width: '100%',
      }}
    >
      <Container maxWidth="xl" sx={{ width: '100%' }}>
        <Toolbar sx={{ width: '100%', minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            edge="start"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
            aria-label="volver"
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: 'primary.main',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              OdontoLink
            </Typography>
          </Box>

          <IconButton onClick={toggleTheme} color="inherit" aria-label="cambiar tema">
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
