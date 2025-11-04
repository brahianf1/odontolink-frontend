import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ChatIcon from '@mui/icons-material/Chat';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SecurityIcon from '@mui/icons-material/Security';
import DevicesIcon from '@mui/icons-material/Devices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
      title: 'Gestión de Turnos',
      description: 'Sistema inteligente de reservas y administración de citas odontológicas',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40 }} />,
      title: 'Comunicación Directa',
      description: 'Chat interno entre pacientes y practicantes para consultas y seguimiento',
    },
    {
      icon: <FeedbackIcon sx={{ fontSize: 40 }} />,
      title: 'Sistema de Feedback',
      description: 'Calificaciones y evaluaciones para mejorar la calidad del servicio',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Seguridad Garantizada',
      description: 'Protección de datos personales conforme a normativas vigentes',
    },
    {
      icon: <DevicesIcon sx={{ fontSize: 40 }} />,
      title: 'Multiplataforma',
      description: 'Accede desde cualquier dispositivo: PC, tablet o smartphone',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Disponibilidad 24/7',
      description: 'Sistema disponible en todo momento para tu comodidad',
    },
  ];

  const userTypes = [
    {
      icon: <PersonIcon sx={{ fontSize: 48 }} />,
      title: 'Pacientes',
      description: 'Accede a tratamientos odontológicos de calidad, reserva turnos y realiza seguimiento de tu atención.',
      benefits: [
        'Consulta catálogo de tratamientos',
        'Reserva turnos online',
        'Historial de atenciones',
        'Comunicación con practicantes',
      ],
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 48 }} />,
      title: 'Practicantes',
      description: 'Estudiantes de odontología que gestionan su práctica clínica y desarrollan experiencia profesional.',
      benefits: [
        'Gestión de agenda personal',
        'Registro de atenciones',
        'Feedback académico',
        'Seguimiento de casos',
      ],
    },
    {
      icon: <SupervisorAccountIcon sx={{ fontSize: 48 }} />,
      title: 'Docentes Supervisores',
      description: 'Supervisión y evaluación del desempeño de practicantes en el proceso formativo.',
      benefits: [
        'Monitoreo de practicantes',
        'Revisión de atenciones',
        'Evaluación académica',
        'Análisis de feedback',
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: '#FFFFFF',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2rem', md: '3rem' },
                fontWeight: 800,
                mb: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Bienvenido a OdontoLink
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                fontWeight: 400,
                mb: 4,
                opacity: 0.95,
                maxWidth: '800px',
                mx: 'auto',
              }}
            >
              Sistema integral de gestión para clínicas odontológicas universitarias
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                mb: 4,
                opacity: 0.9,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              Conectamos pacientes, practicantes y supervisores en un entorno digital 
              moderno y seguro para optimizar la atención odontológica.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register/patient')}
                sx={{
                  backgroundColor: '#FFFFFF',
                  color: theme.palette.primary.main,
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: alpha('#FFFFFF', 0.9),
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Registrarse como Paciente
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: '#FFFFFF',
                  color: '#FFFFFF',
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#FFFFFF',
                    backgroundColor: alpha('#FFFFFF', 0.1),
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8, width: '100%' }}>
        <Box sx={{ textAlign: 'center', mb: 6, px: 2 }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            ¿Por qué elegir OdontoLink?
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: '600px', mx: 'auto' }}
          >
            Plataforma diseñada con las mejores prácticas para ofrecer una experiencia 
            excepcional a todos los usuarios del ecosistema odontológico.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box
                  sx={{
                    color: theme.palette.primary.main,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* User Types Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.main, 0.05)
            : alpha(theme.palette.primary.main, 0.03),
          py: 8,
          width: '100%',
        }}
      >
        <Container maxWidth="lg" sx={{ width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 6, px: 2 }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                fontWeight: 700,
                mb: 2,
                color: theme.palette.text.primary,
              }}
            >
              ¿Quién utiliza OdontoLink?
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: '600px', mx: 'auto' }}
            >
              Nuestro sistema está diseñado para satisfacer las necesidades específicas 
              de cada rol en el ecosistema de la clínica odontológica.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3, 1fr)',
              },
              gap: 4,
            }}
          >
            {userTypes.map((userType, index) => (
              <Card
                key={index}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[12],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {userType.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    textAlign="center"
                    color="primary"
                  >
                    {userType.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 3 }}
                  >
                    {userType.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {userType.benefits.map((benefit, idx) => (
                      <Typography
                        key={idx}
                        variant="body2"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: theme.palette.primary.main,
                            mr: 1.5,
                          }}
                        />
                        {benefit}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, width: '100%', px: { xs: 2, sm: 3 } }}>
        <Card
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: '#FFFFFF',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            ¿Listo para comenzar?
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, opacity: 0.95, fontSize: '1.1rem' }}
          >
            Únete a OdontoLink y experimenta una nueva forma de gestionar 
            la atención odontológica universitaria.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register/patient')}
            sx={{
              backgroundColor: '#FFFFFF',
              color: theme.palette.primary.main,
              py: 1.5,
              px: 5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: alpha('#FFFFFF', 0.9),
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Crear Mi Cuenta
          </Button>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;
