import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Header />
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
