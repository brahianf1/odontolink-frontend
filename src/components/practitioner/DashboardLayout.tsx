import { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        width: '100%',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          display: { md: 'none' },
          zIndex: theme.zIndex.drawer + 1,
          width: '100%',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            OdontoLink - Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <DashboardSidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          maxWidth: '100%',
          mt: { xs: 7, md: 0 },
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
