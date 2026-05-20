import { Box, Toolbar } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
  const location = useLocation();
  // The Header is `position: fixed` on home so the Hero starts at viewport
  // y=0 with no flow offset; other public routes need a spacer that occupies
  // the same vertical space the AppBar would have taken in normal flow.
  const isHome = location.pathname === '/';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'clip',
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
        {!isHome && <Toolbar />}
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
