import { useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  Lock as LockIcon,
  PersonOutline as PersonIcon,
} from '@mui/icons-material';
import {
  LogoutAllButton,
  PersonalInfoForm,
  ProfileHeader,
  ProfilePictureField,
  RoleSpecificForm,
  SecurityForm,
  useMyDetails,
  useMyProfile,
} from '../../features/profile';
import type { MyProfileDTO } from '../../types/profile.types';

type TabValue = 'personal' | 'security';

export default function MyProfilePage() {
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
    setProfile,
  } = useMyProfile();
  const { details, loading: detailsLoading, refresh: refreshDetails } = useMyDetails();
  const [tab, setTab] = useState<TabValue>('personal');

  const handleProfileUpdated = (updated: MyProfileDTO) => {
    setProfile(updated);
  };

  const handleProfilePictureChange = (url: string | null) => {
    if (!profile) return;
    setProfile({ ...profile, profilePictureUrl: url });
  };

  if (profileLoading) {
    return <ProfilePageSkeleton />;
  }

  if (profileError || !profile) {
    return (
      <Box>
        <PageHeading />
        <Alert
          severity="error"
          action={
            <Box
              component="button"
              onClick={() => void refreshProfile()}
              sx={{
                background: 'none',
                border: 0,
                color: 'inherit',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Reintentar
            </Box>
          }
        >
          {profileError ?? 'No se pudo cargar tu perfil.'}
        </Alert>
      </Box>
    );
  }

  const showRoleSection =
    details && details.role !== 'ROLE_ADMIN';

  return (
    <Box>
      <PageHeading />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value as TabValue)}
          sx={{
            px: { xs: 1, sm: 2 },
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tab
            value="personal"
            icon={<PersonIcon fontSize="small" />}
            iconPosition="start"
            label="Información personal"
            sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            value="security"
            icon={<LockIcon fontSize="small" />}
            iconPosition="start"
            label="Seguridad"
            sx={{ minHeight: 56, textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {tab === 'personal' ? (
            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 3, sm: 4 }}
                    alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                  >
                    <ProfilePictureField
                      profile={profile}
                      onProfilePictureChange={handleProfilePictureChange}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ProfileHeader profile={profile} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <PersonalInfoForm
                    profile={profile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                </CardContent>
              </Card>

              {showRoleSection ? (
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    {detailsLoading || !details ? (
                      <Stack alignItems="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} />
                      </Stack>
                    ) : (
                      <RoleSpecificForm
                        details={details}
                        onUpdated={refreshDetails}
                      />
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </Stack>
          ) : null}

          {tab === 'security' ? (
            <Stack spacing={3}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <SecurityForm />
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <LogoutAllButton />
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </Box>
      </Paper>
    </Box>
  );
}

function PageHeading() {
  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Mi perfil
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Gestioná tu información personal, datos profesionales y seguridad de la cuenta.
      </Typography>
    </Box>
  );
}

function ProfilePageSkeleton() {
  return (
    <Box>
      <PageHeading />
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          p: 4,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Skeleton variant="circular" width={128} height={128} />
          <Stack spacing={1} sx={{ flex: 1, width: '100%' }}>
            <Skeleton variant="text" width="60%" height={36} />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="rectangular" height={70} sx={{ mt: 1, borderRadius: 1 }} />
          </Stack>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Stack spacing={2}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={56} />
        </Stack>
      </Paper>
    </Box>
  );
}
