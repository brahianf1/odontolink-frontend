import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AuthHeader from './AuthHeader';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AuthHeader />
      <Box 
        sx={{ 
          flex: 1, 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
